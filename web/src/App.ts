import CanvasController from "./controller/CanvasController.js"
import WebSocketClient from "./WebSocketClient.js"

const controller = new CanvasController()
export const webSocketClient = new WebSocketClient(controller)

