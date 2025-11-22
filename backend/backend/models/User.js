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
  phone: { type: String }, // Added for both registration forms
  privacyConsent: { type: Boolean, default: true }, // Assuming implicit consent on signup
  
  // --- Patient/Health Fields ---
  healthProfile: { // Kept minimal for now
    allergies: [String],
    medications: [String],
    bloodType: String
  },
  age: { type: Number },
  weight: { type: Number }, // in kg
  height: { type: Number }, // in cm

  // --- Doctor-specific fields (optional for patient role) ---
  specialization: { type: String },
  hospital: { type: String },
  licenseNumber: { type: String },
  experience: { type: Number }, // Added for DoctorProfile

  // --- Dynamic Data Link for Patient Dashboard ---
  // Embedded Recommendations/Reminders for simplicity
  doctorRecommendations: [{
    doctorName: String,
    date: Date,
    recommendation: String,
    priority: { type: String, enum: ['high', 'medium', 'low'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);