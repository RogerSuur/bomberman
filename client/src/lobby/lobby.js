import ChatComponent from "../chat.js";

export default class  Lobby {
    constructor(fw,socket, playerList) {
        this.fw = fw;
        this.state = fw.state;
        this.playerList = playerList;
        this.socket = socket;
    }

    render() {
        this.playerList = this.playerList.filter((player) => player !== null);
        var players = this.playerList.length;
        var str = `Waiting for players: ${players}/4`
        
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
            children: []
        })

        for (const key in this.playerList) {
            playerColumn.children.push(this.fw.dom.createVirtualNode("div",{
                attrs: { class: "row"},
                children: [this.playerList[key]]
            }))
        };

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

}