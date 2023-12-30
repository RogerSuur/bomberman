export default class Lobby {
  constructor(fw, socket, timer) {
    this.fw = fw;
    this.state = fw.state;
    this.playerList = [];
    this.myUserName = "";
    this.socket = socket;
    this.timer = timer;
    this.content = this.render();
  }

  addPlayer(playerList, myUserName) {
    this.playerList = playerList;
    this.myUserName = myUserName;
  }

  render(stage) {
    this.playerList = this.playerList.filter((player) => player !== null);
    var players = this.playerList.length;
    var str = `Waiting for players: ${players}/4`;

    const header = this.fw.dom.createVirtualNode("h1", {
      attrs: { class: "px-4 py-1" },
      children: [str],
    });

    const headerRow = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "row" },
      children: [header],
    });

    //console.log(this.timer);
    console.log(stage);
    if (this.timer === 0) {
      var timerStr = `Waiting for other players to join`;
    } else if (!stage) {
      var timerStr = `Waiting for players: ${this.timer}`;
    } else {
      var timerStr = `Game starts in: ${this.timer}`;
    }

    const timer = this.fw.dom.createVirtualNode("p", {
      attrs: { for: "input-name", class: "" },
      children: [timerStr],
    });

    headerRow.children.push(timer);
    console.log(headerRow.children);

    const playerColumn = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "col-4" },
      children: [],
    });

    for (const key in this.playerList) {
      playerColumn.children.push(
        this.fw.dom.createVirtualNode("div", {
          attrs: { class: "row" },
          children: [this.playerList[key]],
        })
      );
    }

    const contentRow = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "row" },
      children: [playerColumn],
    });

    const lobby = this.fw.dom.createVirtualNode("div", {
      attrs: { class: "container", id: "lobby-container" },
      children: [headerRow, contentRow],
    });

    return lobby;
  }

  update(seconds, stage) {
    this.timer = seconds;

    const newLobby = this.render(stage);
    console.log(newLobby.children[0].children[1].children);
    const patch = this.fw.dom.diff(this.content, newLobby);
    const actualDOMNode = document.getElementById("lobby-container");
    patch(actualDOMNode);
  }
}
