const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const apartmentRoutes = require('./modules/apartments/apartments.routes');
const complexRoutes = require('./modules/complexes/complexes.routes');
const userRoutes = require('./modules/users/users.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/complexes', complexRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
