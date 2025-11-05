const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const upload = require('../utils/multer');
const { ensureAuthenticated } = require('../middlewares/auth');

// 📤 Upload file to Cloudinary
router.post('/upload', ensureAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadUrl: req.file.path,
        cloudinaryPublicId: req.file.filename,
        userId: req.user.id,
      },
    });

    req.flash('success', 'File uploaded successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ File upload error:', err);
    req.flash('error', 'Error uploading file.');
    res.redirect('/dashboard');
  }
});

// 👁️ View File Details
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file || file.userId !== req.user.id) {
      req.flash('error', 'File not found or unauthorized');
      return res.redirect('/dashboard');
    }

    res.render('files/view', { title: 'View File', file });
  } catch (err) {
    console.error('❌ Error fetching file:', err);
    req.flash('error', 'Error fetching file.');
    res.redirect('/dashboard');
  }
});

// 🗑️ Delete File
router.post('/:id/delete', ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file || file.userId !== req.user.id) {
      req.flash('error', 'Unauthorized or file not found');
      return res.redirect('/dashboard');
    }

    // Delete from Cloudinary
    if (file.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(file.cloudinaryPublicId);
    }

    // Delete from DB
    await prisma.file.delete({ where: { id: file.id } });

    req.flash('success', 'File deleted successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ File delete error:', err);
    req.flash('error', 'Error deleting file.');
    res.redirect('/dashboard');
  }
});

module.exports = router;
