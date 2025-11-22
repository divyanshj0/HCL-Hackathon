const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['patient', 'provider'], // Role-based access [cite: 27]
    default: 'patient' 
  },
  privacyConsent: { type: Boolean, required: true }, // Consent checkbox 
  
  // Profile Information 
  healthProfile: {
    allergies: [String],
    medications: [String],
    bloodType: String
  },
  
  // Preventive Care Reminders [cite: 44]
  reminders: [{
    title: String,
    date: Date,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);