export default class PreLobby {
  constructor(fw, socket, error) {
    this.fw = fw;
    this.state = fw.state;
    this.socket = socket;
    this.error = error;
    this.content = this.render();
  }

  handleClick = (e) => {
    const input = document.getElementById("input-name");
    const userName = input.value;
    // e.target.value = "";

    if (userName != "") {
      this.socket.emit("username", userName);
    }
  };

  handleInput = (e) => {
    if (
      (e.code === "Enter" || e.code === "NumpadEnter") &&
      e.target.value != ""
    ) {
      e.preventDefault();
      let userName = e.target.value;
      // e.target.value = "";
      this.socket.emit("username", userName);
    }
  };

  render() {
    const label = this.fw.dom.createVirtualNode("label", {
      attrs: { for: "input-name", class: "px-4 py-1 row" },
      children: ["Insert username"],
    });

    const input = this.fw.dom.createVirtualNode("input", {
      attrs: { id: "input-name" },
      children: [],
      listeners: {
        keydown: (e) => this.handleInput(e),
      },
    });

    const inputWrapper = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "col-10" },
      children: [input],
    });

    const button = this.fw.dom.createVirtualNode("input", {
      attrs: { id: "input-btn", type: "button", value: "OK" },
      children: ["OK"],
      listeners: {
        click: (e) => this.handleClick(e),
      },
    });

    const buttonWrapper = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "col-2" },
      children: [button],
    });

    const inputRow = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "row g-1" },
      children: [inputWrapper, buttonWrapper],
    });

    var errorMsg = this.fw.dom.createVirtualNode("p", {
      attrs: { id: "validation-error", class: "row text-danger" },
      children: [],
    });

    if (this.error !== "") {
      errorMsg.children.push(this.error);
    }

    const col = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "col" },
      children: [label, inputRow, errorMsg],
    });

    const preLobby = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "container", id: "pre-lobby" },
      children: [col],
    });

    const lobbyContainer = this.fw.dom.createVirtualNode("div", {
      attrs: {
        class: "d-flex justify-content-center align-items-center",
        id: "content-container",
      },
      children: [preLobby],
    });

    return preLobby;
  }

  update(error) {
    this.error = error;
    const newLobby = this.render();
    const patch = this.fw.dom.diff(this.content, newLobby);
    const actualDOMNode = document.getElementById("pre-lobby");
    patch(actualDOMNode);
  }
}
