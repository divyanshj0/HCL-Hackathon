// backend/backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Patient or Doctor)
// @access  Public
router.post('/register', async (req, res) => {
    const { 
        name, 
        email, 
        phone, 
        password, 
        role = 'patient',
        specialization, 
        hospital, 
        licenseNumber 
    } = req.body;

    try {
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Please enter all required fields: name, email, phone, and password.' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Prepare user data
        const userData = {
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            privacyConsent: true
        };

        // Add doctor-specific fields if role is provider
        if (role === 'provider') {
            if (!specialization || !hospital || !licenseNumber) {
                return res.status(400).json({ message: 'Please include specialization, hospital, and license number for doctor registration.' });
            }
            userData.specialization = specialization;
            userData.hospital = hospital;
            userData.licenseNumber = licenseNumber;
            // Frontend DoctorRegister asks for licenseNumber, specialization, hospital.
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate a user (Patient or Doctor)
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check if the user's stored role matches the expected role for the login portal
            if (role && user.role !== role) {
                return res.status(401).json({ message: `Access denied. Please log in through the ${user.role} portal.` });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials or user not found' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;