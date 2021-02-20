import CanvasController from "./controller/CanvasController.js"

export default class WebSocketClient {
    static id: string
    socket: WebSocket
    constructor(controller: CanvasController) {
        this.socket = new WebSocket('ws://172.30.1.55:4001');
        this.socket.addEventListener('message', function (event) {
            console.log(event.data)
            const data = JSON.parse(event.data)
            switch (data.message) {
                case "reload":
                    controller.loadFromServer()
                    break
            }
            WebSocketClient.id = data.id
            console.log(data.id)
        });
    }
}
