const { prisma } = require('../../config/db');

function parseDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function buildFullName(user) {
  return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
}

function defaultRange(query = {}) {
  const now = new Date();
  const from = parseDateTime(query.from) || new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const to = parseDateTime(query.to) || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { from, to };
}

async function listAvailability(realtorId, query) {
  const { from, to } = defaultRange(query);

  const blocks = await prisma.realtorAvailability.findMany({
    where: {
      realtorId,
      startAt: { lt: to },
      endAt: { gt: from },
    },
    orderBy: { startAt: 'asc' },
  });

  return { from: from.toISOString(), to: to.toISOString(), blocks };
}

async function createAvailability(realtorId, data) {
  const startAt = parseDateTime(data.startAt);
  const endAt = parseDateTime(data.endAt);

  if (!startAt || !endAt || startAt.getTime() >= endAt.getTime()) {
    const err = new Error('Invalid availability range');
    err.statusCode = 400;
    throw err;
  }

  const created = await prisma.realtorAvailability.create({
    data: {
      realtorId,
      startAt,
      endAt,
    },
  });

  return created;
}

async function deleteAvailability(realtorId, availabilityId) {
  const existing = await prisma.realtorAvailability.findFirst({
    where: { id: availabilityId, realtorId },
    select: { id: true },
  });

  if (!existing) {
    const err = new Error('Availability block not found');
    err.statusCode = 404;
    throw err;
  }

  await prisma.realtorAvailability.delete({ where: { id: availabilityId } });
  return { success: true };
}

async function listBookings(realtorId, query) {
  const { from, to } = defaultRange(query);

  const bookings = await prisma.tourBooking.findMany({
    where: {
      realtorId,
      status: 'BOOKED',
      startAt: { lt: to },
      endAt: { gt: from },
    },
    include: {
      apartment: { select: { id: true, title: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
    orderBy: { startAt: 'asc' },
  });

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    bookings: bookings.map((booking) => ({
      ...booking,
      user: booking.user ? { ...booking.user, fullName: buildFullName(booking.user) } : null,
    })),
  };
}

module.exports = {
  listAvailability,
  createAvailability,
  deleteAvailability,
  listBookings,
};

