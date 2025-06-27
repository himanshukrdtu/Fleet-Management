// server.js
import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';

dotenv.config();
await connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Init socket
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
