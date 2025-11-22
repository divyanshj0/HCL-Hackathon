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
            user = await User.findById(userId).select('name email phone age weight height assignedDoctorIds');
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
// DOCTOR LIST & ASSIGNMENT ENDPOINTS
// =========================================================

// @route   GET /api/doctors/list
// @desc    Get list of all registered doctors (for patient booking)
// @access  Private (protect)
router.get('/doctors/list', protect, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'provider' }).select('name specialization hospital experience');

        // Check if the current user (patient) is already assigned to any of these doctors
        const patient = await User.findById(req.user.id).select('assignedDoctorIds');
        const assignedIds = (patient?.assignedDoctorIds || []).map(id => id.toString());

        const doctorList = doctors.map(doc => ({
            id: doc._id,
            name: doc.name,
            specialization: doc.specialization,
            hospital: doc.hospital,
            experience: doc.experience,
            isAssigned: assignedIds.includes(doc._id.toString()) // Mark if already assigned
        }));

        res.json(doctorList);
    } catch (error) {
        console.error("Fetch Doctors List Error:", error);
        res.status(500).json({ message: 'Server error fetching doctors list' });
    }
});


// @route   POST /api/doctors/assign
// @desc    Assign a doctor to the logged-in patient (and vice-versa)
// @access  Private (protect)
router.post('/doctors/assign', protect, async (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Only patients can book doctors.' });
    }

    const patientId = req.user.id;
    const { doctorId } = req.body;

    if (!doctorId) {
        return res.status(400).json({ message: 'Doctor ID is required for assignment.' });
    }

    try {
        // 1. Assign doctor to patient (Add doctorId to patient's list)
        const updatedPatient = await User.findByIdAndUpdate(
            patientId,
            { $addToSet: { assignedDoctorIds: doctorId } }, // $addToSet prevents duplicates
            { new: true }
        );

        // 2. Assign patient to doctor (Add patientId to doctor's list)
        await User.findByIdAndUpdate(
            doctorId,
            { $addToSet: { assignedPatientIds: patientId } },
            { new: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ message: 'Doctor successfully assigned!', doctorName: updatedPatient.name });

    } catch (error) {
        console.error("Doctor Assignment Error:", error);
        res.status(500).json({ message: 'Server error during doctor assignment' });
    }
});

// @route   POST /api/doctors/unassign
// @desc    Unassign a doctor from the logged-in patient (and vice-versa)
// @access  Private (protect)
router.post('/doctors/unassign', protect, async (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Only patients can unassign doctors.' });
    }

    const patientId = req.user.id;
    const { doctorId } = req.body;

    if (!doctorId) {
        return res.status(400).json({ message: 'Doctor ID is required for unassignment.' });
    }

    try {
        // 1. Unassign doctor from patient (Pull doctorId from patient's list)
        const updatedPatient = await User.findByIdAndUpdate(
            patientId,
            { $pull: { assignedDoctorIds: doctorId } },
            { new: true }
        );

        // 2. Unassign patient from doctor (Pull patientId from doctor's list)
        await User.findByIdAndUpdate(
            doctorId,
            { $pull: { assignedPatientIds: patientId } },
            { new: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ message: 'Doctor successfully unassigned!' });

    } catch (error) {
        console.error("Doctor Unassignment Error:", error);
        res.status(500).json({ message: 'Server error during doctor unassignment' });
    }
});


// =========================================================
// PATIENT GOAL & DATA INPUT ENDPOINTS
// =========================================================

// @route   POST /api/goals/add
// @desc    Add daily health data (Water, Calories, Sleep)
// @access  Private (protect)
router.post('/goals/add', protect, async (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Only patients can log health data.' });
    }

    const userId = req.user.id;
    const { type, value } = req.body; // type: 'water' | 'calories' | 'sleep'

    if (!type || value === undefined) {
        return res.status(400).json({ message: 'Type and value are required.' });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find and update today's log, or create a new one
        const goal = await Goal.findOneAndUpdate(
            { userId, type, date: { $gte: today } },
            { value },
            { new: true, upsert: true } // Creates if not found
        );

        res.status(200).json({ message: `${type} data logged successfully for today!`, goal });

    } catch (error) {
        console.error("Add Goal Error:", error);
        res.status(500).json({ message: 'Server error logging health data' });
    }
});

// @route   PUT /api/goals/set-target
// @desc    Set/Update daily health data target
// @access  Private (protect)
router.put('/goals/set-target', protect, async (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Only patients can set goals.' });
    }

    const userId = req.user.id;
    const { type, target } = req.body;

    if (!type || target === undefined) {
        return res.status(400).json({ message: 'Type and target are required.' });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find today's entry and update the target. Use upsert to create if it doesn't exist.
        const goal = await Goal.findOneAndUpdate(
            { userId, type, date: { $gte: today } },
            { target },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: `${type} goal set to ${target}.`, goal });

    } catch (error) {
        console.error("Set Target Error:", error);
        res.status(500).json({ message: 'Server error setting goal target' });
    }
});


// =========================================================
// PATIENT DASHBOARD ENDPOINT
// =========================================================

// @route   GET /api/dashboard/patient
// @desc    Get all dynamic data for patient dashboard
// @access  Private (protect)
router.get('/dashboard/patient', protect, async (req, res) => {
    // ... (logic remains the same, included for completeness)
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
                // Use stored target or default
                target: goal.target || (goal.type === 'water' ? 8 : (goal.type === 'calories' ? 2000 : 8))
            };
            return acc;
        }, {
            // Default stats for the day if no log exists yet
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
// DOCTOR DASHBOARD ENDPOINTS
// =========================================================

// @route   GET /api/dashboard/doctor
// @desc    Get dynamic data for doctor dashboard (filtered by assigned patients)
// @access  Private (protect, providerOnly)
router.get('/dashboard/doctor', protect, providerOnly, async (req, res) => {
    const doctorId = req.user.id;

    try {
        // 1. Get the list of IDs of patients assigned to this doctor
        const doctorProfile = await User.findById(doctorId).select('assignedPatientIds');
        const assignedPatientIds = doctorProfile ? doctorProfile.assignedPatientIds : [];

        // 2. Fetch Stats based *only* on assigned patients
        const totalPatients = assignedPatientIds.length;
        
        // MOCK DATA for other stats, now based on the assigned count
        const todayAppointments = Math.ceil(totalPatients * 0.1); 
        const activeCases = Math.ceil(totalPatients * 0.15);
        const totalConsultations = Math.floor(totalPatients * 2.5);

        // 3. Fetch Recent Patients (only those assigned) - Include ID for detail link
        const recentPatients = await User.find({ 
            _id: { $in: assignedPatientIds }, 
            role: 'patient' 
        })
            .select('name createdAt') 
            .sort({ createdAt: -1 })
            .limit(10); 

        const data = {
            totalPatients,
            todayAppointments,
            activeCases,
            totalConsultations,
            recentPatients: recentPatients.map(p => ({
                id: p._id, // Include ID for frontend link
                name: p.name,
                lastVisit: p.createdAt.toISOString().split('T')[0],
                condition: "Assigned"
            }))
        };

        res.json(data);
    } catch (error) {
        console.error("Doctor Dashboard Error:", error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});


// @route   GET /api/doctors/patient/:patientId
// @desc    Get comprehensive health data for an assigned patient (FOR DOCTOR VIEW)
// @access  Private (protect, providerOnly)
router.get('/doctors/patient/:patientId', protect, providerOnly, async (req, res) => {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    try {
        // 1. Check if the doctor is assigned to this patient (Privacy check)
        const doctor = await User.findById(doctorId).select('assignedPatientIds');
        if (!doctor || !doctor.assignedPatientIds.includes(patientId)) {
            return res.status(403).json({ message: 'Access denied. Patient is not assigned to this doctor.' });
        }

        // 2. Fetch Patient Profile
        const patient = await User.findById(patientId).select('name email phone age weight height doctorRecommendations');
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // 3. Fetch All Goal Data
        const allGoals = await Goal.find({ userId: patientId }).sort({ date: 1 });

        // Structure goals by type for easy consumption
        const structuredGoals = allGoals.reduce((acc, goal) => {
            if (!acc[goal.type]) acc[goal.type] = [];
            acc[goal.type].push({
                date: goal.date,
                value: goal.value,
                target: goal.target,
            });
            return acc;
        }, {});
        
        res.json({
            profile: {
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                age: patient.age,
                weight: patient.weight,
                height: patient.height,
            },
            goals: structuredGoals,
            recommendations: patient.doctorRecommendations,
        });

    } catch (error) {
        console.error("Doctor Patient Detail Error:", error);
        res.status(500).json({ message: 'Server error fetching patient details' });
    }
});

module.exports = router;