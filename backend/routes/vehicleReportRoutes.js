import express from 'express';
import { submitVehicleReport,updateTripEndDetails,getVehicleReportById } from '../controllers/vehicleReportController.js';

const router = express.Router();

router.post('/submit', submitVehicleReport);
router.put('/update/:formId', updateTripEndDetails);
router.get('/:formId', getVehicleReportById);

export default router;
