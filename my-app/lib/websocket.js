import { Server } from 'socket.io';

let io;

const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to WebSocket');

    // Join a room for a specific shipment
    socket.on('join-shipment-room', (trackingNumber) => {
      socket.join(`shipment-${trackingNumber}`);
      console.log(`Client joined shipment room: shipment-${trackingNumber}`);
    });

    // Leave a shipment room
    socket.on('leave-shipment-room', (trackingNumber) => {
      socket.leave(`shipment-${trackingNumber}`);
      console.log(`Client left shipment room: shipment-${trackingNumber}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export { initWebSocket, getIo };
