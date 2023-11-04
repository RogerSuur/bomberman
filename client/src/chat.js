const socket = io();

export default class ChatComponent {
  constructor() {
    this.chatElement = this.createChatElement();
    this.attachEventListeners();
  }

  createChatElement() {
    const chatDiv = document.createElement("div");
    chatDiv.id = "chat";
    
    const messagesDiv = document.createElement("div");
    messagesDiv.id = "messages";
    chatDiv.appendChild(messagesDiv);
    
    const inputElement = document.createElement("input");
    inputElement.id = "messageInput";
    inputElement.autocomplete = "off";
    inputElement.addEventListener("keyup", this.handleKeyUp.bind(this)); // Listen for keyup events

    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    sendButton.addEventListener("click", this.sendMessage.bind(this));
    
    chatDiv.appendChild(messagesDiv);
    chatDiv.appendChild(inputElement);
    chatDiv.appendChild(sendButton);
    
    return chatDiv;
  }

  sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message) {
      socket.emit('chatMessage', message);
      messageInput.value = '';
    }
  }

  handleKeyUp(event) {
    if (event.key === "Enter") {
      this.sendMessage();
    }
  }

  attachEventListeners() {
    socket.on('chatMessage', (message) => {
      const messages = document.getElementById('messages');
      const li = document.createElement('li');
      li.textContent = message;
      messages.appendChild(li);
    });
  }

  getChatElement() {
    return this.chatElement;
  }
}
