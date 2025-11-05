// src/routes/share.js
const express = require('express');
const prisma = require('../config/prisma');
const { ensureAuthenticated } = require('../middlewares/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Generate share link
router.post('/:folderId/share', ensureAuthenticated, async (req, res) => {
  const { duration } = req.body; // e.g., "1d" or "10d"
  const folderId = Number(req.params.folderId);

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder || folder.userId !== req.user.id) {
    req.flash('error', 'Unauthorized');
    return res.redirect('/folders');
  }

  const days = parseInt(duration) || 1;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const token = uuidv4();
  await prisma.shareLink.create({
    data: {
      token,
      expiresAt,
      folderId,
      createdById: req.user.id,
    },
  });

  req.flash('success', `Share link created: ${req.protocol}://${req.get('host')}/share/${token}`);
  res.redirect(`/folders/${folderId}`);
});

// Publicly accessible share link
router.get('/:token', async (req, res) => {
  const share = await prisma.shareLink.findUnique({
    where: { token: req.params.token },
    include: { folder: { include: { files: true } } },
  });

  if (!share || share.expiresAt < new Date()) {
    return res.send('⚠️ This link has expired or is invalid.');
  }

  res.render('share/folder', { title: 'Shared Folder', share });
});

module.exports = router;
