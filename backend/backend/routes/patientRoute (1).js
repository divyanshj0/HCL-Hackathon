const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Goal = require('../models/Goal');
const router = express.Router();

// Get Patient Dashboard Data (Goals + Reminders)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const today = new Date();
    today.setHours(0,0,0,0);

    // Fetch today's goals
    const goals = await Goal.find({ userId: req.user.id, date: { $gte: today } });

    res.json({
      profile: user,
      goals: goals, // e.g. Steps, Water [cite: 58]
      reminders: user.reminders, // "Upcoming: Annual blood test" [cite: 44]
      healthTip: "Stay hydrated! Drink 3L of water per day." // Static tip [cite: 45, 105]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Goal Progress (Log daily goals) [cite: 58]
router.post('/goal', protect, async (req, res) => {
  const { type, current } = req.body;
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    let goal = await Goal.findOne({ userId: req.user.id, type, date: { $gte: today } });
    
    if(goal) {
      goal.current = current;
      await goal.save();
    } else {
       // Create new goal entry if not exists
       await Goal.create({ 
           userId: req.user.id, 
           type, 
           target: 6000, // Default target
           current 
       });
    }
    res.json({ message: 'Goal updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;