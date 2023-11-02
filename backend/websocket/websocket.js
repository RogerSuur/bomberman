const users = new Set();

const Websocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Add the new user to the users set
    users.add(socket.id);
  
    // Notify all users about the new user count
    io.emit('userCount', users.size);
  
    // Listen for chat messages
    socket.on('chatMessage', (message) => {
      // Broadcast the message to all connected users
      io.emit('chatMessage', message);
    });
  
    // Socket.io disconnect event
    socket.on('disconnect', () => {
      console.log('A user disconnected');
  
      // Remove the user from the users set
      users.delete(socket.id);
  
      // Notify all users about the updated user count
      io.emit('userCount', users.size);
    });
  });
};

export default Websocket;
