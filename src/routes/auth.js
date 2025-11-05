const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const prisma = require('../config/prisma');
const { forwardAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// --- REGISTER FORM ---
router.get('/register', forwardAuthenticated, (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

// --- REGISTER SUBMIT ---
router.post('/register', forwardAuthenticated, async (req, res) => {
  const { email, password, password2 } = req.body;

  if (!email || !password || !password2) {
    req.flash('error', 'Please fill in all fields');
    return res.redirect('/register');
  }
  if (password !== password2) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/register');
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      req.flash('error', 'Email already registered');
      return res.redirect('/register');
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, password: hashed } });

    req.flash('success', 'You are registered! Please log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/register');
  }
});

// --- LOGIN FORM ---
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

// --- LOGIN SUBMIT ---
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

// --- LOGOUT ---
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      req.flash('error', 'Error logging out');
    } else {
      req.flash('success', 'You are logged out');
    }
    res.redirect('/login');
  });
});

module.exports = router;
