import fw from "../fwinstance.js";

export default class ChatComponent {
  constructor(socket) {
    this.socket = socket;
    this.chatElement = this.createChatElement();
    this.username = "";
    this.attachEventListeners();
  }

  addPlayer(myUserName) {
    this.username = myUserName;
  }

  createChatElement() {
    const chatDiv = fw.dom.createVirtualNode("div", {
      attrs: { id: "chat" },
      children: [
        fw.dom.createVirtualNode("div", { attrs: { id: "messages" } }),
        fw.dom.createVirtualNode("div", {
          attrs: { id: "messageInputContainer" },
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


  sendMessage() {
    if (this.username) {
      const messageInput = document.getElementById("messageInput");
      const message = messageInput.value.trim();
      if (message) {
        this.socket.emit('chatMessage', { username: this.username, message });
        messageInput.value = '';
      }
    }
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.sendMessage();
    }
  }

  attachEventListeners() {
    this.socket.on('chatMessage', (data) => {
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
