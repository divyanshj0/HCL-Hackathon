import mongoose from 'mongoose';

const patientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no two patients have the same email
    },
    age: {
      type: Number,
      required: true,
    },
    // You can add more fields based on your needs (e.g., phone, weight, doctorId)
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;