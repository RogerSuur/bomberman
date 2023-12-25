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

    render() {
        this.playerList = this.playerList.filter((player) => player !== null);
        var players = this.playerList.length;
        var str = `Waiting for players: ${players}/4`
        
        const header = this.fw.dom.createVirtualNode("h1", {
            attrs: { class: "px-4 py-1" },
            children: [str]
        })


        const headerRow = this.fw.dom.createVirtualNode("div",{
            attrs: { class: "row"},
            children: [header]
        })

        if (this.timer >= 0) {
            // console.log(this.timer)
            var timerStr = `Game starts in: ${this.timer}`

            const timer = this.fw.dom.createVirtualNode("p", {
                attrs: { for: "input-name", class: "" },
                children: [timerStr]
            })

            headerRow.children.push(timer)  
        }

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

        const contentRow = this.fw.dom.createVirtualNode("div",{
            attrs: { class: "row"},
            children: [playerColumn]
        })
        
        const lobby = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "container", id:"lobby" },
            children: [headerRow, contentRow]
        });

        return lobby;
    }

    update(seconds) {
        this.timer = seconds;
        const newLobby = this.render();
        const patch = this.fw.dom.diff(this.content, newLobby);
        const actualDOMNode = document.getElementById("lobby");
        patch(actualDOMNode);
    }
}