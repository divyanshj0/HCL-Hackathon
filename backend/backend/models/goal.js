const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'steps', 'water', 'sleep'
  target: { type: Number, required: true }, // e.g., 6000 steps
  current: { type: Number, default: 0 },    // e.g., 3420 steps [cite: 92]
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);