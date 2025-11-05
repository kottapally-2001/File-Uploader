const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'file_uploader_project', // Cloudinary folder name
    resource_type: 'auto', // Automatically detect image/video/pdf/etc
  },
});

const upload = multer({ storage });

module.exports = upload;
