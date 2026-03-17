const { prisma } = require('../../config/db');

const TOUR_DURATION_MINUTES = 120;
const SLOT_INCREMENT_MINUTES = 30;

function parseDateTime(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const err = new Error(`${fieldName} must be a valid datetime`);
    err.statusCode = 400;
    throw err;
  }
  return date;
}

function maxDate(a, b) {
  return a.getTime() >= b.getTime() ? a : b;
}

function minDate(a, b) {
  return a.getTime() <= b.getTime() ? a : b;
}

function ceilToIncrement(date, incrementMinutes) {
  const incrementMs = incrementMinutes * 60 * 1000;
  const time = date.getTime();
  const rounded = Math.ceil(time / incrementMs) * incrementMs;
  return new Date(rounded);
}

function mergeIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const merged = [];

  for (const interval of sorted) {
    if (merged.length === 0) {
      merged.push({ ...interval });
      continue;
    }

    const last = merged[merged.length - 1];
    if (interval.startAt.getTime() <= last.endAt.getTime()) {
      if (interval.endAt.getTime() > last.endAt.getTime()) {
        last.endAt = interval.endAt;
      }
      continue;
    }

    merged.push({ ...interval });
  }

  return merged;
}

function overlaps(startA, endA, startB, endB) {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

async function getAvailableTourSlots(apartmentId, rawFrom, rawTo) {
  const from = parseDateTime(rawFrom, 'from');
  const to = parseDateTime(rawTo, 'to');
  if (from.getTime() >= to.getTime()) {
    const err = new Error('"from" must be before "to"');
    err.statusCode = 400;
    throw err;
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true, status: true, realtorId: true },
  });

  if (!apartment || apartment.status !== 'active') {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  if (!apartment.realtorId) {
    const err = new Error('Tours are not available for this apartment yet');
    err.statusCode = 400;
    throw err;
  }

  const [availabilityBlocks, bookings] = await Promise.all([
    prisma.realtorAvailability.findMany({
      where: {
        realtorId: apartment.realtorId,
        startAt: { lt: to },
        endAt: { gt: from },
      },
      select: {
        startAt: true,
        endAt: true,
      },
      orderBy: { startAt: 'asc' },
    }),
    prisma.tourBooking.findMany({
      where: {
        realtorId: apartment.realtorId,
        status: 'BOOKED',
        startAt: { lt: to },
        endAt: { gt: from },
      },
      select: {
        startAt: true,
        endAt: true,
      },
      orderBy: { startAt: 'asc' },
    }),
  ]);

  const mergedAvailability = mergeIntervals(availabilityBlocks);
  const durationMs = TOUR_DURATION_MINUTES * 60 * 1000;
  const incrementMs = SLOT_INCREMENT_MINUTES * 60 * 1000;

  const slotSet = new Set();

  for (const block of mergedAvailability) {
    const windowStart = maxDate(block.startAt, from);
    const windowEnd = minDate(block.endAt, to);

    let candidate = ceilToIncrement(windowStart, SLOT_INCREMENT_MINUTES);
    while (candidate.getTime() + durationMs <= windowEnd.getTime()) {
      const candidateEnd = new Date(candidate.getTime() + durationMs);

      const hasConflict = bookings.some((booking) =>
        overlaps(candidate, candidateEnd, booking.startAt, booking.endAt)
      );

      if (!hasConflict) {
        slotSet.add(candidate.toISOString());
      }

      candidate = new Date(candidate.getTime() + incrementMs);
    }
  }

  return {
    durationMinutes: TOUR_DURATION_MINUTES,
    slots: Array.from(slotSet).sort(),
  };
}

async function bookTour(apartmentId, userId, rawStartAt) {
  const startAt = parseDateTime(rawStartAt, 'startAt');
  const now = new Date();
  if (startAt.getTime() < now.getTime() - 60 * 1000) {
    const err = new Error('startAt must be in the future');
    err.statusCode = 400;
    throw err;
  }

  const durationMs = TOUR_DURATION_MINUTES * 60 * 1000;
  const endAt = new Date(startAt.getTime() + durationMs);

  return prisma.$transaction(async (tx) => {
    const apartment = await tx.apartment.findUnique({
      where: { id: apartmentId },
      select: { id: true, status: true, realtorId: true },
    });

    if (!apartment || apartment.status !== 'active') {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    if (!apartment.realtorId) {
      const err = new Error('Tours are not available for this apartment yet');
      err.statusCode = 400;
      throw err;
    }

    const hasAvailability = await tx.realtorAvailability.findFirst({
      where: {
        realtorId: apartment.realtorId,
        startAt: { lte: startAt },
        endAt: { gte: endAt },
      },
      select: { id: true },
    });

    if (!hasAvailability) {
      const err = new Error('Selected time is not available');
      err.statusCode = 400;
      throw err;
    }

    const conflicting = await tx.tourBooking.findFirst({
      where: {
        realtorId: apartment.realtorId,
        status: 'BOOKED',
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    });

    if (conflicting) {
      const err = new Error('Selected time is already booked');
      err.statusCode = 409;
      throw err;
    }

    const booking = await tx.tourBooking.create({
      data: {
        apartmentId: apartment.id,
        realtorId: apartment.realtorId,
        userId,
        startAt,
        endAt,
        status: 'BOOKED',
      },
      include: {
        apartment: {
          select: { id: true, title: true },
        },
        realtor: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    return booking;
  });
}

module.exports = {
  getAvailableTourSlots,
  bookTour,
  TOUR_DURATION_MINUTES,
};

