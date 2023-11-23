export default class PreLobby {
    constructor(fw, socket, errorPresent) {
        this.fw = fw;
        this.state = fw.state;
        this.socket = socket;
        this.errorPresent = errorPresent;
        this.content = this.render();
    }

    handleClick = (e) => {
        
        const input = document.getElementById("input-name");
        const userName = input.value
        let { players } = this.fw.state.getState();

        if (players.includes(userName)) {
             this.fw.events.notify("userNameInUser");
            return
        }
        e.target.value = "";
        players.push(userName)
        this.fw.state.setState({ players });
        this.fw.events.notify("userAdded");
        this.socket.emit("username", userName);

    }

    handleInput = (e) => {
        if ((e.code === "Enter" || e.code === "NumpadEnter") && e.target.value != "") {

            e.preventDefault();
            let userName = e.target.value;

            let { players } = this.fw.state.getState();

            if (players.includes(userName)) {
                this.fw.events.notify("userNameInUser");
                return
            }
            e.target.value = "";
            players.push(userName)
            this.fw.state.setState({ players });

            // notify about added user
            this.fw.events.notify("userAdded");
            this.socket.emit("username", userName);
        }
    };

    render() {
        const label = this.fw.dom.createVirtualNode("label", {
            attrs: { for: "input-name", class: "px-4 py-1 row" },
            children: ["Insert username"]
        });


        const input = this.fw.dom.createVirtualNode("input", {
            attrs: { id: "input-name"},
            children: [],
            listeners: {
                keydown: (e) => this.handleInput(e)
            }
        });

                
        const inputWrapper = this.fw.dom.createVirtualNode("div", {
            attrs: { class:"col-10"},
            children: [input],
        });

        const button = this.fw.dom.createVirtualNode("input", {
            attrs: { id: "input-btn", type:"button", value:"OK" },
            children: ["OK"],
            listeners: {
                click: (e) => this.handleClick(e)
            }
        });

        const buttonWrapper = this.fw.dom.createVirtualNode("div", {
            attrs: { class:"col-2"},
            children: [button],
        });

        const inputRow = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "row g-1" },
            children: [inputWrapper, buttonWrapper]
        });


        var errorMsg = this.fw.dom.createVirtualNode("p", {
            attrs: { id: "validation-error", class: "row text-danger" },
            children: [],
        });

        if (this.errorPresent ) {
            errorMsg.children.push("This username is already in use!") 
        }

        const col = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "col"},
            children: [label, inputRow, errorMsg]
        });


        const preLobby = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "container", id:"pre-lobby" },
            children: [col]
        });

        const lobbyContainer = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "d-flex justify-content-center align-items-center", id:"content-container" },
            children: [preLobby]
        });

        return preLobby;
    }

    update() {
        const newLobby = this.render();
        const patch = this.fw.dom.diff(this.content, newLobby);
        const actualDOMNode = document.getElementById("pre-lobby");
        patch(actualDOMNode);
    }

}
