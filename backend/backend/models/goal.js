const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['water', 'calories', 'sleep'], required: true }, // e.g., 'steps', 'water', 'sleep'
  // For Water: glasses, For Calories: kcal, For Sleep: hours
  value: { type: Number, required: true }, 
  target: { type: Number }, // The daily target for that metric
  date: { type: Date, default: Date.now } // Date used to aggregate data (unique per day/user/type)
});

module.exports = mongoose.model('Goal', goalSchema);