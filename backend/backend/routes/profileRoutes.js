const express = require('express');
const { protect } = require('./Authmiddleware'); // Assuming Auth middleware is here
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/profile/patient
// @desc    Get the authenticated patient's profile data
// @access  Private
router.get('/patient', protect, async (req, res) => {
    try {
        // req.user is set by the 'protect' middleware and contains { id, role }
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user || user.role !== 'patient') {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }

        // Return a simplified object for the frontend
        res.json({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            age: user.healthProfile?.age || '',
            weight: user.healthProfile?.weight || '',
            height: user.healthProfile?.height || '',
        });

    } catch (error) {
        console.error("Fetch Profile Error:", error);
        res.status(500).json({ message: 'Server error fetching profile data.' });
    }
});

// @route   PUT /api/profile/patient
// @desc    Update the authenticated patient's profile details
// @access  Private
router.put('/patient', protect, async (req, res) => {
    const { name, phone, age, weight, height } = req.body;

    try {
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'patient') {
            return res.status(404).json({ message: 'Patient profile not found.' });
        }

        // Update basic fields
        user.name = name || user.name;
        user.phone = phone || user.phone;
        
        // Ensure healthProfile is initialized
        if (!user.healthProfile) {
            user.healthProfile = {};
        }

        // Update nested health fields. Check if the value is provided before setting.
        if (age !== undefined) user.healthProfile.age = Number(age);
        if (weight !== undefined) user.healthProfile.weight = Number(weight);
        if (height !== undefined) user.healthProfile.height = Number(height);

        const updatedUser = await user.save();

        res.json({
            message: 'Profile updated successfully!',
            name: updatedUser.name,
            phone: updatedUser.phone,
            age: updatedUser.healthProfile.age,
            weight: updatedUser.healthProfile.weight,
            height: updatedUser.healthProfile.height,
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
});

module.exports = router;