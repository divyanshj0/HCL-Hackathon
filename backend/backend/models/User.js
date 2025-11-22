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
  
  // --- Doctor-specific fields (optional for patient role) ---
  specialization: { type: String },
  hospital: { type: String },
  licenseNumber: { type: String },
  experience: { type: Number },
  
  // Removed explicit reminders/recommendations array to simplify core model in this phase
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);