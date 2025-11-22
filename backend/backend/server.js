// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Allows the server to parse JSON in request bodies

// Database Connection
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB Atlas cluster
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('MongoDB Atlas Connected Successfully! 🥭');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to DB and then start the server
connectDB().then(() => {
    // Define a simple root route
    app.get('/', (req, res) => {
        res.send('Healthy India Connect Backend API Running...');
    });

    // Mount Patient Routes
    app.use('/api/patients', patientRoutes);

    // Start listening for requests
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
});