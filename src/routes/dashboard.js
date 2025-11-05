const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { ensureAuthenticated } = require('../middlewares/auth');

// Root redirect
router.get('/', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.redirect('/login');
});

// Dashboard page
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
      orderBy: { uploadAt: 'desc' },
      take: 5,
    });

    res.render('dashboard/index', {
      title: 'Dashboard',
      folders,
      files,
      user: req.user,
    });
  } catch (err) {
    console.error('❌ Dashboard error:', err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/login');
  }
});

module.exports = router;
