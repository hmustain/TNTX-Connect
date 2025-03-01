// server/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure storage (files will be saved in the "uploads" folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists in your project root
  },
  filename: (req, file, cb) => {
    // Add a timestamp to the original filename for uniqueness
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create the upload middleware; allow up to 10 photos
const upload = multer({ storage });
module.exports = upload;
