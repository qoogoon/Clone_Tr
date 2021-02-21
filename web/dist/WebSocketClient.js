export default class WebSocketClient {
    constructor(controller) {
        this.socket = new WebSocket('ws://localhost:4001');
        this.socket.addEventListener('message', function (event) {
            const data = JSON.parse(event.data);
            switch (data.message) {
                case "reload":
                    controller.loadFromServer();
                    break;
            }
            WebSocketClient.id = data.id;
        });
    }
}
//# sourceMappingURL=WebSocketClient.js.map