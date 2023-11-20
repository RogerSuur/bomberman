import ChatComponent from "../chat.js";

export default class  Lobby {
    constructor(fw,socket) {
        this.fw = fw;
        this.state = fw.state;
        this.players = this.fw.state.getState();
        this.socket = socket;
    }

    render() {
        console.log(this.players)

        var str = `Waiting for players: 0/4`
        
        const header = this.fw.dom.createVirtualNode("h1", {
            attrs: { for: "input-name", class: "px-4 py-1 row" },
            children: [str]
        })

        const headerRow = this.fw.dom.createVirtualNode("div",{
            attrs: { class: "row"},
            children: [header]
        })

        const playerColumn = this.fw.dom.createVirtualNode("div",{
            attrs: { class: "col-4"},
            children: ["players col"]
        })

        const chatComponent = new ChatComponent(this.socket);
        const chatElement = chatComponent.getChatElement();

        const chatArea = this.fw.dom.createVirtualNode("div",{
            attrs: { class: "col-8"},
            children: [chatElement]
        })

        const contentRow = this.fw.dom.createVirtualNode("div",{
            attrs: { class: "row"},
            children: [playerColumn, chatArea]
        })
        
        const lobby = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "container", id:"lobby" },
            children: [headerRow, contentRow]
        });

        return lobby;
    }

    createContainer(tagName, attributes = {}) {
        const element = document.createElement(tagName);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    update(oldElement) {
        const playerList = oldElement.querySelector('#player-list');
        playerList.innerHTML = '';
        this.players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
    }


}