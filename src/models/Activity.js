const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  month:           { type: String, required: true, index: true },
  date:            { type: Number, required: true },
  lab:             { type: String, required: true },
  kegiatan:        { type: String, default: '' },
  pengguna:        { type: String, default: '' },
  fr:              { type: Number, required: true, default: 0 },
  jlh:             { type: Number, required: true, default: 0 },
  drs:             { type: Number, required: true, default: 0 },
  overridesStatic: { type: Boolean, default: false },
}, { timestamps: true });

// Speed up override lookup queries
ActivitySchema.index({ month: 1, date: 1, lab: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
