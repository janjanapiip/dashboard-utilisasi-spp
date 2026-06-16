const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  key:    { type: String, required: true, unique: true, index: true }, // "month||lab||date"
  photos: [{
    dataUrl:  String, // base64 DataURL, max 1 MB source file (~1.37 MB encoded)
    filename: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Photo', PhotoSchema);
