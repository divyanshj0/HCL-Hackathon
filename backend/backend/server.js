const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load Environment Variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const providerRoutes = require('./routes/providerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware [cite: 60]
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Database Connection [cite: 68]
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/provider', providerRoutes);

// Public Health Info Page (Static endpoint) [cite: 55]
app.get('/api/public-health', (req, res) => {
  res.json({
    message: "General Health Information",
    policy: "Privacy Policy: Your data is secure...",
    tips: ["Wash hands frequently", "Get 8 hours of sleep"]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));