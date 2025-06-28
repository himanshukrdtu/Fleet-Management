import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  key: String,
  value: String,
});

const tripRowSchema = new mongoose.Schema({
  tipper: String,
  time: String,
  machine: String,
  material: String,
  site: String,
});

const vehicleReportSchema = new mongoose.Schema({
  checklist: { type: Map, of: String },
  notes: String,
  breakdownNote: String,
  repairReported: String,
  mechanicPin: String,
  driverPin: String,
  tripRows: [tripRowSchema],
  footerPins: {
    driver: String,
    supervisor: String,
    incharge: String
  },
  tripDetails: {
    tripDate: String,
    shift: String,
    relay: String,
    driverName: String,
    dumperNumber: String,
    operatorId: String,
    startHMR: String,
    closeHMR: String,
    startKM: String,
    closeKM: String
  }
}, { timestamps: true });

const VehicleReport = mongoose.model('VehicleReport', vehicleReportSchema);
export default VehicleReport;
