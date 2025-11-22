// routes/patientRoutes.js

import express from 'express';
import Patient from '../models/patient.js';

const router = express.Router();
router.post('/', async (req, res) => {
  const { name, email, age } = req.body;

  // Simple validation
  if (!name || !email || !age) {
    return res.status(400).json({ message: 'Please include a name, email, and age' });
  }

  try {
    const patientExists = await Patient.findOne({ email });

    if (patientExists) {
      return res.status(400).json({ message: 'Patient with this email already exists' });
    }

    const patient = await Patient.create({
      name,
      email,
      age,
    });

    res.status(201).json({
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      age: patient.age,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @route   GET /api/patients
// @desc    Get all patient records
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;