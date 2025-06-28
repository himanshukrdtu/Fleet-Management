 import mongoose from 'mongoose';
import VehicleReport from '../models/VehicleReport.js';

// Submit full vehicle report (Start Form)
export const submitVehicleReport = async (req, res) => {
  try {
    const report = new VehicleReport(req.body);
    const savedReport = await report.save();
    res.status(201).json({ message: 'Form saved successfully', formId: savedReport._id });
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ message: 'Error saving form', error });
  }
};

// Update HMR and KM on trip end (End Form)
export const updateTripEndDetails = async (req, res) => {
  const { formId } = req.params;
  const { closeHMR, closeKM } = req.body;

  // Validate input fields
  if (!closeHMR || !closeKM) {
    return res.status(400).json({ message: 'closeHMR and closeKM are required' });
  }

  // Validate formId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return res.status(400).json({ message: 'Invalid formId' });
  }

  try {
    const report = await VehicleReport.findById(formId);

    if (!report) {
      return res.status(404).json({ message: 'Vehicle report not found' });
    }

    report.tripDetails.closeHMR = closeHMR;
    report.tripDetails.closeKM = closeKM;

    await report.save();

    res.status(200).json({
      message: 'Trip end details updated successfully',
      updated: {
        closeHMR: report.tripDetails.closeHMR,
        closeKM: report.tripDetails.closeKM
      }
    });
  } catch (error) {
    console.error('Error updating trip end details:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
