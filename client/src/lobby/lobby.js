export default class  Lobby {
    constructor(fw, socket) {
        this.fw = fw;
        this.state = fw.state;
        this.socket = socket;
    }

    render() {
        const lobby = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "container", id:"pre-lobby" },
            children: ["THIS IS LOBBY"]
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