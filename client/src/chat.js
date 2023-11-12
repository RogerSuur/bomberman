import fw from "./fwinstance.js";

export default class ChatComponent {
  constructor(socket) {
    this.socket = socket;
    this.chatElement = this.createChatElement();
    this.attachEventListeners();
  }

  createChatElement() {
    const chatDiv = fw.dom.createVirtualNode("div", {
      attrs: { id: "chat" },
      children: [
        fw.dom.createVirtualNode("div", { attrs: { id: "messages" } }),
        fw.dom.createVirtualNode("input", {
          attrs: { id: "messageInput", autocomplete: "off" },
          listeners: { keydown: this.handleKeyDown.bind(this) },
        }),
        fw.dom.createVirtualNode("button", {
          children: ["Send"],
          listeners: { click: this.sendMessage.bind(this) },
        }),
      ],
    });

    return chatDiv;
  }

  sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message) {
      socket.emit("chatMessage", message);
      messageInput.value = "";
    }
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.sendMessage();
    }
  }

  attachEventListeners() {
    socket.on("chatMessage", (message) => {
      const messagesContainer = document.getElementById("messages");
      const li = fw.dom.createVirtualNode("li", { text: message });
      const realDOM = fw.dom.render(li);
      const textNode = document.createTextNode(message);
      realDOM.appendChild(textNode);
      messagesContainer.appendChild(realDOM);
      const messages = document.getElementById("messages");
      messages.scrollTop = messages.scrollHeight;
    });
  }

  getChatElement() {
    return this.chatElement;
  }
}
