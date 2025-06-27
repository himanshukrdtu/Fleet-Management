import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      query: { userId },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => console.log('🟢 Socket connected:', socket.id));
    socket.on('disconnect', () => console.log('🔴 Socket disconnected'));
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🟡 Socket manually disconnected');
  }
};
