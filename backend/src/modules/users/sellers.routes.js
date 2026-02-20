const express = require('express');
const { prisma } = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');
const { requireManagerAdmin } = require('../../middleware/roles');

const router = express.Router();

// Get all active sellers
router.get('/', authMiddleware, requireManagerAdmin, async (req, res, next) => {
  try {
    const sellers = await prisma.user.findMany({
      where: {
        role: 'SELLER',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    res.json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    next(error);
  }
});

// Get one seller by ID
router.get('/:id', authMiddleware, requireManagerAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const seller = await prisma.user.findUnique({
      where: {
        id,
        role: 'SELLER',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!seller) {
      res.status(404).json({
        success: false,
        error: 'Seller not found',
      });
      return;
    }

    res.json({
      success: true,
      data: seller,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
