import express from 'express';
import { submitVehicleReport,updateTripEndDetails } from '../controllers/vehicleReportController.js';

const router = express.Router();

router.post('/submit', submitVehicleReport);
router.put('/update/:formId', updateTripEndDetails);

export default router;
