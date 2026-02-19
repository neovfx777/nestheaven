const express = require('express');
const { prisma } = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');
const { requireManagerAdmin } = require('../../middleware/roles');

const router = express.Router();
console.log('✅ sellers.routes.js loaded!'); // console check

// Get all sellers (users with SELLER role)
router.get(
  '/',
  authMiddleware,
  requireManagerAdmin,
  async (req, res, next) => {
    try {
      console.log('Fetching sellers...');
      
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
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ],
      });

      console.log(`Found ${sellers.length} sellers`);

      res.json({
        success: true,
        data: sellers,
      });
    } catch (error) {
      console.error('Error fetching sellers:', error);
      next(error);
    }
  }
);

// Get seller by ID
router.get(
  '/:id',
  authMiddleware,
  requireManagerAdmin,
  async (req, res, next) => {
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
        return res.status(404).json({
          success: false,
          error: 'Seller not found',
        });
      }

      res.json({
        success: true,
        data: seller,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;