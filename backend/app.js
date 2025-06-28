import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/tripRoutes.js';
import vehicleReportRoutes from './routes/vehicleReportRoutes.js';


dotenv.config(); // Load .env variables

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Basic route to test

app.get('/', (req, res) => {
  res.send('Fleet Backend is running...');
});
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/vehicle-report', vehicleReportRoutes);

export default app;
