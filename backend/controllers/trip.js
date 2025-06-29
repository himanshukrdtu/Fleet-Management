// controllers/tripController.js
import Trip from '../models/Trip.js';
import { getIO } from '../socket.js';

// @desc    Filter Trips
export const filterTrips = async (req, res) => {
  const { userId, vehicleNumber, status, start, end } = req.query;

  const query = {};

  if (userId) query.userId = userId;
  if (vehicleNumber) query.vehicleNumber = vehicleNumber;
  if (status) query.status = status;

  if (start && end) {
    query.startedAt = {
      $gte: new Date(start),
      $lte: new Date(end)
    };
  }

  try {
    const trips = await Trip.find(query)
      .populate('userId', 'username role')
      .sort({ startedAt: -1 }); // most recent first

    const formatted = trips.map(trip => ({
      _id: trip._id,
      vehicleNumber: trip.vehicleNumber,
      startedAt: trip.startedAt,
      endedAt: trip.endedAt,
      status: trip.status,
      path: trip.path,
      userId: trip.userId._id,
      name: trip.userId.username,
      role: trip.userId.role,
      formId: trip.formId // ✅ include formId in response
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Failed to filter trips', error: error.message });
  }
};


// @desc    Start a new trip
// @route   POST /api/trips/start
// @access  Public (or Protected if using auth)
export const startTrip = async (req, res) => {
  try {
    const { userId, vehicleNumber, formId } = req.body;
// console.log('Starting trip with data:', req.body);
    if (!userId || !vehicleNumber || !formId) {
      return res.status(400).json({ message: 'User ID, Vehicle Number, and Form ID are required' });
    }
// console.log('Received data:', { userId, vehicleNumber, formId }); 
    // Check for existing running trip
    const existing = await Trip.findOne({ userId, status: 'running' });
    if (existing) {
      // console.log('Existing running trip found for user:', userId);
      return res.status(400).json({ message: 'A trip is already running for this user' });
    }
  //  console.log('No existing running trip found for user:', userId);
    // Create and save trip
    const trip = new Trip({
      userId,
      vehicleNumber,
      formId, // ✅ save formId
      startedAt: new Date(),
      status: 'running',
    });

    await trip.save();

    // ✅ Re-fetch trip with populated user info
    const populatedTrip = await Trip.findById(trip._id).populate('userId', 'username role');

    // ✅ Format the trip like in your filterTrips
    const formatted = {
      _id: populatedTrip._id,
      vehicleNumber: populatedTrip.vehicleNumber,
      startedAt: populatedTrip.startedAt,
      endedAt: populatedTrip.endedAt,
      status: populatedTrip.status,
      path: populatedTrip.path,
      userId: populatedTrip.userId._id,
      name: populatedTrip.userId.username,
      role: populatedTrip.userId.role,
      formId: populatedTrip.formId // ✅ include in response
    };

    // 🔴 Emit tripStarted with formatted structure
    getIO().emit('tripStarted', formatted);

    res.status(201).json({ message: 'Trip started', trip: formatted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start trip', error: error.message });
  }
};


// @desc    End a trip
// @route   PUT /api/trips/end/:tripId
export const endTrip = async (req, res) => {
  try {
    // console.log('Ending trip with ID:', req.params.tripId);
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    // console.log('Found trip:', trip);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
// console.log('Trip status before ending:', trip.status);
    if (trip.status === 'completed') {
      return res.status(400).json({ message: 'Trip is already completed' });
    }

    trip.endedAt = new Date();
    trip.status = 'completed';
// console.log('Trip status after ending:', trip.status);
    await trip.save();
// console.log('Trip after saving:', trip);
    
    getIO().emit('tripEnded', tripId);

    res.status(200).json({ message: 'Trip ended', trip });
  } catch (error) {
    res.status(500).json({ message: 'Failed to end trip', error: error.message });
  }
};
