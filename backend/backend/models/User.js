const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['patient', 'provider'], 
    default: 'patient' 
  },
  phone: { type: String },
  privacyConsent: { type: Boolean, default: true },
  
  // --- Patient/Health Fields ---
  healthProfile: { 
    allergies: [String],
    medications: [String],
    bloodType: String
  },
  age: { type: Number },
  weight: { type: Number }, // in kg
  height: { type: Number }, // in cm

  // NEW: Patient's assigned doctors
  assignedDoctorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // --- Doctor-specific fields (optional for patient role) ---
  specialization: { type: String },
  hospital: { type: String },
  licenseNumber: { type: String },
  experience: { type: Number },

  // NEW: Doctor's assigned patients (used for privacy enforcement)
  assignedPatientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  doctorRecommendations: [{
    doctorName: String,
    date: Date,
    recommendation: String,
    priority: { type: String, enum: ['high', 'medium', 'low'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);