// routes/tripRoutes.js
import express from 'express';
import { filterTrips, startTrip,endTrip } from '../controllers/trip.js';

const router = express.Router();

router.get('/filterTrips', filterTrips); // GET /api/trips?userId=...&vehicleNumber=...&...
router.post('/start', startTrip);
router.put('/end/:tripId', endTrip);

export default router;
