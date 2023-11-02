const socket = io();

window.sendMessage = function() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chatMessage', message);
    messageInput.value = '';
  }
};

socket.on('chatMessage', (message) => {
  const messages = document.getElementById('messages');
  const li = document.createElement('li');
  li.textContent = message;
  messages.appendChild(li);
});
