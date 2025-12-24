const socketIo = require('socket.io');

function createSocketServer(httpServer) {
  const io = socketIo(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_order_room', (orderId) => {
      socket.join(orderId);
    });
  });

  return io;
}

module.exports = { createSocketServer };
