export default class PreLobby {
    constructor(fw) {
        this.fw = fw;
        this.state = fw.state;
    }

    handleClick = (e) => {
        debugger
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
    }

    handleInput = (e) => {
        if ((e.code === "Enter" || e.code === "NumpadEnter") && e.target.value != "") {
        debugger

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
            this.fw.events.notify("userAdded");
        }
    };

    render(error) {
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

        if (error) {
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

        return preLobby;
    }

    update(oldLobby, newData) {
        const newLobby = this.render(newData);
        const patch = this.fw.dom.diff(oldLobby, newLobby);
        const actualDOMNode = document.getElementById("pre-lobby");
        patch(actualDOMNode);
    }

}
