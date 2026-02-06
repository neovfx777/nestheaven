const statusService = require('./status.service');

class StatusController {
  constructor() {
    this.statusService = statusService;
  }

  getStatusHistory = async (req, res, next) => {
    try {
      const { apartmentId } = req.params;
      const { limit, offset } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      const history = await this.statusService.getStatusHistory(
        apartmentId,
        userId,
        userRole,
        { limit, offset }
      );

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req, res, next) => {
    try {
      const { apartmentId } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user.id;

      const result = await this.statusService.changeStatus(
        apartmentId,
        status,
        adminId,
        reason
      );

      res.json({
        success: true,
        message: `Apartment status changed to ${status}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  markSold = async (req, res, next) => {
    try {
      const { apartmentId } = req.params;
      const { soldPrice, soldDate, notes } = req.body;
      const sellerId = req.user.id;

      const result = await this.statusService.markSold(
        apartmentId,
        sellerId,
        { soldPrice, soldDate, notes }
      );

      res.json({
        success: true,
        message: 'Apartment marked as sold',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  bulkStatusChange = async (req, res, next) => {
    try {
      const { apartmentIds, status, reason } = req.body;
      const adminId = req.user.id;

      const result = await this.statusService.bulkStatusChange(
        apartmentIds,
        status,
        adminId,
        reason
      );

      res.json({
        success: true,
        message: `Bulk status change completed for ${result.count} apartments`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  bulkMarkSold = async (req, res, next) => {
    try {
      const { apartmentIds, reason } = req.body;
      const sellerId = req.user.id;

      const result = await this.statusService.bulkMarkSold(
        apartmentIds,
        sellerId,
        reason
      );

      res.json({
        success: true,
        message: `Bulk mark as sold completed for ${result.count} apartments`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new StatusController();