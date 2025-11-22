const express = require('express');
const { protect, providerOnly } = require('./Authmiddleware');
const User = require('../models/User');
const Goal = require('../models/goal');
const router = express.Router();

// Helper to get start and end of day/week for query purposes
const getDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    return { today, sevenDaysAgo };
};

// =========================================================
// PROFILE ENDPOINTS (Patient & Doctor)
// =========================================================

// @route   GET /api/profile/:role
// @desc    Get user profile data
// @access  Private (protect)
router.get('/profile/:role', protect, async (req, res) => {
    const { role } = req.params;
    const userId = req.user.id;

    if (req.user.role !== role) {
        return res.status(403).json({ message: 'Access denied. Incorrect portal role.' });
    }

    try {
        let user;
        if (role === 'patient') {
            user = await User.findById(userId).select('name email phone age weight height');
        } else if (role === 'provider') {
            user = await User.findById(userId).select('name email phone specialization hospital licenseNumber experience');
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// @route   PUT /api/profile/:role
// @desc    Update user profile data
// @access  Private (protect)
router.put('/profile/:role', protect, async (req, res) => {
    const { role } = req.params;
    const userId = req.user.id;

    if (req.user.role !== role) {
        return res.status(403).json({ message: 'Access denied. Incorrect portal role.' });
    }

    try {
        let updateFields = {};

        if (role === 'patient') {
            const { name, phone, age, weight, height } = req.body;
            updateFields = { name, phone, age, weight, height };
        } else if (role === 'provider') {
            const { name, phone, specialization, hospital, licenseNumber, experience } = req.body;
            updateFields = { name, phone, specialization, hospital, licenseNumber, experience };
        }

        // Filter out undefined fields and update
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true }).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'Profile updated successfully!', ...updatedUser.toObject() });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});


// =========================================================
// PATIENT DASHBOARD ENDPOINT
// =========================================================

// @route   GET /api/dashboard/patient
// @desc    Get all dynamic data for patient dashboard
// @access  Private (protect)
router.get('/dashboard/patient', protect, async (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Access denied. Patient portal required.' });
    }
    const userId = req.user.id;

    try {
        const { today, sevenDaysAgo } = getDates();
        
        // 1. Fetch Today's Stats
        const todayGoals = await Goal.find({
            userId,
            date: { $gte: today }
        });

        const todayStats = todayGoals.reduce((acc, goal) => {
            acc[goal.type] = { 
                value: goal.value, 
                target: goal.target || (goal.type === 'water' ? 8 : (goal.type === 'calories' ? 2000 : 8))
            };
            return acc;
        }, {
            water: { value: 0, target: 8 },
            calories: { value: 0, target: 2000 },
            sleep: { value: 0, target: 8 }
        });

        // 2. Fetch Weekly Data for Charts (last 7 days)
        const weeklyGoals = await Goal.find({
            userId,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: 1 });
        
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        const processWeeklyData = (type, data) => {
            const weeklyData = Array.from({ length: 7 }, (_, i) => ({ 
                day: days[(sevenDaysAgo.getDay() + i) % 7], 
                value: 0 
            }));
            
            data.filter(g => g.type === type).forEach(g => {
                const dayIndex = g.date.getDay();
                const diff = (dayIndex - sevenDaysAgo.getDay() + 7) % 7;
                weeklyData[diff].value = g.value;
            });
            return weeklyData.map((d, index) => ({ day: days[(sevenDaysAgo.getDay() + index) % 7], [type]: d.value }));
        };
        
        const waterData = processWeeklyData('water', weeklyGoals);
        const caloriesData = processWeeklyData('calories', weeklyGoals);
        const sleepData = processWeeklyData('sleep', weeklyGoals);

        // Merge chart data into one array by day for easy use in frontend
        const mergedChartData = Array.from({ length: 7 }, (_, index) => {
            const dayOfWeek = days[(sevenDaysAgo.getDay() + index) % 7];
            return {
                day: dayOfWeek,
                water: waterData.find(d => d.day === dayOfWeek)?.water || 0,
                calories: caloriesData.find(d => d.day === dayOfWeek)?.calories || 0,
                hours: sleepData.find(d => d.day === dayOfWeek)?.sleep || 0,
            };
        });
        
        // 3. Fetch Doctor Recommendations
        const patient = await User.findById(userId).select('doctorRecommendations');

        res.json({
            todayStats: {
                waterIntake: todayStats.water.value,
                waterGoal: todayStats.water.target,
                calories: todayStats.calories.value,
                caloriesGoal: todayStats.calories.target,
                sleep: todayStats.sleep.value,
                sleepGoal: todayStats.sleep.target,
            },
            weeklyData: mergedChartData,
            doctorRecommendations: patient?.doctorRecommendations || [],
        });

    } catch (error) {
        console.error("Patient Dashboard Error:", error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});


// =========================================================
// DOCTOR DASHBOARD ENDPOINT
// =========================================================

// @route   GET /api/dashboard/doctor
// @desc    Get all dynamic data for doctor dashboard
// @access  Private (protect, providerOnly)
router.get('/dashboard/doctor', protect, providerOnly, async (req, res) => {
    try {
        // 1. Fetch Stats
        const totalPatients = await User.countDocuments({ role: 'patient' });
        // NOTE: Appointments/Active Cases requires additional models/logic not present, using mock logic
        // Total Appointments - Mock as half of total patients (e.g., historical)
        const totalAppointments = Math.floor(totalPatients * 1.5);
        // Today's Appointments - Mock as small percentage of total
        const todayAppointments = Math.ceil(totalPatients * 0.05);

        // 2. Fetch Recent Patients
        const recentPatients = await User.find({ role: 'patient' })
            .select('name createdAt')
            .sort({ createdAt: -1 })
            .limit(3);

        const data = {
            totalPatients,
            todayAppointments,
            activeCases: Math.ceil(totalPatients * 0.15), // Mock Active Cases
            totalConsultations: totalAppointments, // Mock Consultations
            recentPatients: recentPatients.map(p => ({
                name: p.name,
                lastVisit: p.createdAt.toISOString().split('T')[0], // Using creation date as mock 'last visit'
                condition: "Follow-up" // Mock Condition
            }))
        };

        res.json(data);
    } catch (error) {
        console.error("Doctor Dashboard Error:", error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

module.exports = router;