// src/routes/folders.js
const express = require('express');
const prisma = require('../config/prisma');
const { ensureAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// List all folders for logged-in user
router.get('/', ensureAuthenticated, async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.render('folders/index', { title: 'Your Folders', folders });
});

// New folder form
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('folders/form', { title: 'New Folder' });
});

// Create new folder
router.post('/new', ensureAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    req.flash('error', 'Folder name required');
    return res.redirect('/folders/new');
  }

  await prisma.folder.create({
    data: { name, userId: req.user.id },
  });

  req.flash('success', 'Folder created!');
  res.redirect('/folders');
});

// View single folder and its files
router.get('/:id', ensureAuthenticated, async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: Number(req.params.id) },
    include: { files: true },
  });
  if (!folder || folder.userId !== req.user.id) {
    req.flash('error', 'Folder not found');
    return res.redirect('/folders');
  }
  res.render('folders/show', { title: folder.name, folder });
});

// Delete folder
router.post('/:id/delete', ensureAuthenticated, async (req, res) => {
  const id = Number(req.params.id);
  const folder = await prisma.folder.findUnique({ where: { id } });
  if (!folder || folder.userId !== req.user.id) {
    req.flash('error', 'Unauthorized');
    return res.redirect('/folders');
  }

  await prisma.folder.delete({ where: { id } });
  req.flash('success', 'Folder deleted');
  res.redirect('/folders');
});

module.exports = router;
