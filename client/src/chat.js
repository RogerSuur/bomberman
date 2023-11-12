import fw from "./fwinstance.js";

const socket = io();

export default class ChatComponent {
  constructor() {
    this.chatElement = this.createChatElement();
    this.username = '';
    this.attachEventListeners();
  }

  createChatElement() {
    const chatDiv = fw.dom.createVirtualNode("div", {
      attrs: { id: "chat" },
      children: [
        fw.dom.createVirtualNode("div", { attrs: { id: "messages" } }),
        fw.dom.createVirtualNode("input", {
          attrs: { id: "usernameInput", placeholder: "Enter your username" },
          listeners: { keydown: this.handleUsernameKeyDown.bind(this) },
        }),
        fw.dom.createVirtualNode("div", {
          attrs: { id: "messageInputContainer", style: "display: none" },
          children: [
            fw.dom.createVirtualNode("input", {
              attrs: { id: "messageInput", autocomplete: "off", placeholder: "Type a message..." },
              listeners: { keydown: this.handleKeyDown.bind(this) },
              props: { disabled: true },
            }),
            fw.dom.createVirtualNode("button", {
              children: ["Send"],
              listeners: { click: this.sendMessage.bind(this) },
              props: { disabled: true },
            }),
          ],
        }),
      ],
    });
  
    return chatDiv;
  }

  showChat() {
    const chatDiv = document.getElementById("chat");
    chatDiv.style.display = "block"; 
  }
  showChatInput() {
    const messageInputContainer = document.getElementById("messageInputContainer");
    messageInputContainer.style.display = "block";
  }

  sendMessage() {
    if (this.username) {
      const messageInput = document.getElementById("messageInput");
      const message = messageInput.value.trim();
      if (message) {
        socket.emit('chatMessage', { username: this.username, message });
        messageInput.value = '';
      }
    }
  }

  handleUsernameKeyDown(event) {
    if (event.key === "Enter") {
      const usernameInput = document.getElementById("usernameInput");
      this.username = usernameInput.value.trim();
      usernameInput.disabled = true;
      this.showChatInput(); 
    }
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.sendMessage();
    }
  }

  attachEventListeners() {
    socket.on('chatMessage', (data) => {
      const messagesContainer = document.getElementById('messages');
      const messageWithUsername = `${data.username}: ${data.message}`;
      const li = fw.dom.createVirtualNode("li", { text: messageWithUsername });
      const realDOM = fw.dom.render(li);
      const textNode = document.createTextNode(messageWithUsername);
      realDOM.appendChild(textNode);
      messagesContainer.appendChild(realDOM);
      const messages = document.getElementById('messages');
      messages.scrollTop = messages.scrollHeight;
    });
  }

  getChatElement() {
    return this.chatElement;
  }
}


