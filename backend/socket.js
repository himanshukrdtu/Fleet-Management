// socket.js
import { Server } from 'socket.io';
import Trip from './models/Trip.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
   cors: {
    origin: [
        "https://fleet-management-1-dpbb.onrender.com", // production frontend
        "http://localhost:5173",                        // local dev
      ],
  methods: ["GET", "POST"],
   
},
  });

  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    socket.on('locationUpdate', async ({ userId, tripId, location }) => {
      try {
        // console.log(`📍 Location update from user ${userId} for trip ${tripId}:`, location);
        await Trip.findByIdAndUpdate(tripId, {
          $push: { path: location }
        });

        io.emit('liveLocation', { userId, tripId, location });
      } catch (err) {
        console.error('❌ Error saving location:', err.message);
      }
    });
   

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected:', socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
