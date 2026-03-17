const toursService = require('./tours.service');

async function getSlots(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { from, to } = req.validated.query;
    const result = await toursService.getAvailableTourSlots(id, from, to);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function book(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { startAt } = req.validated.body;
    const booking = await toursService.bookTour(id, req.user.id, startAt);

    const fullName = (user) => `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

    res.status(201).json({
      success: true,
      data: {
        ...booking,
        realtor: booking.realtor ? { ...booking.realtor, fullName: fullName(booking.realtor) } : null,
        user: booking.user ? { ...booking.user, fullName: fullName(booking.user) } : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSlots,
  book,
};

