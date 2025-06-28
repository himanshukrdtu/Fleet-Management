// models/Trip.js
import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  endedAt: Date,
  path: [
    {
      lat: Number,
      lng: Number,
      time: Date,
    }
  ],
  status: {
    type: String,
    enum: ['running', 'completed'],
    default: 'running',
  },
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleReport', // ✅ reference to VehicleReport
    required: true,
  },
});

export default mongoose.model('Trip', tripSchema);
