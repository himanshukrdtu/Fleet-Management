import { io } from 'socket.io-client';
import { BASE_URL } from '../config';
let socket = null;
 
export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(BASE_URL, {
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
