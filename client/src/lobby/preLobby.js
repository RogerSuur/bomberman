export default class PreLobby {
    constructor(fw) {
        this.fw = fw;
        this.state = fw.state;
    }

    render() {
        const handleInput = (e) => {
            if ((e.code === "Enter" || e.code === "NumpadEnter") && e.target.value != "") {
                e.preventDefault();
            }
            let userName = e.target.value;

            let { players } = this.fw.state.getState();

            if (players.includes(userName)) {
                console.log("name in use")
                this.fw.events.notify("userNameInUser");
                return
            }
            e.target.value = "";
            players.push(userName)
            this.fw.state.setState({ players });

            this.fw.events.notify("userAdded");

            // items.push(item);


            this.fw.events.notify("userAdded");

        };

        const label = this.fw.dom.createVirtualNode("label", {
            attrs: { for: "input-name", class: "row" },
            children: ["Insert username"]
        });

        const input = this.fw.dom.createVirtualNode("input", {
            attrs: { id: "input-name", class: "row" },
            children: ["preLobby"],
            listeners: {
                change: (e) => handleInput(e)
            }
        });

        const col = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "col" },
            children: [label, input]
        });

        const preLobby = this.fw.dom.createVirtualNode("div", {
            attrs: { class: "container" },
            children: [col]
        });

        this.fw.events.subscribe("userNameInUser", this.update)


        return preLobby;
        // this.fw.dom.render(preLobby, document.body);
    }

    userNameInUse(){
        
    }

    update(){

    }


}
