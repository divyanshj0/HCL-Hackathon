const express = require('express');
const { protect, providerOnly } = require('./Authmiddleware');
const User = require('../models/User');
const router = express.Router();

// Get List of Patients and Compliance Status [cite: 53]
router.get('/patients', protect, providerOnly, async (req, res) => {
  try {
    // Find all users with role 'patient'
    const patients = await User.find({ role: 'patient' }).select('name healthProfile reminders');
    
    // Simple logic to determine compliance based on reminders
    const data = patients.map(patient => {
      const missedCheckups = patient.reminders.some(r => !r.completed && new Date(r.date) < new Date());
      return {
        id: patient._id,
        name: patient.name,
        status: missedCheckups ? "Missed Preventive Checkup" : "Goal Met", // [cite: 53]
        info: patient.healthProfile
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;