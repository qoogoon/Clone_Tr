import * as WebSocket from "ws"
// import { WebSocket } from "ws"

import * as crypo from "crypto"

export class Client {
    id: string
    ws: WebSocket
}

export default class WebSocketServer {
    wss: WebSocket.Server
    clients: Client[] = []
    constructor() {
        this.wss = new WebSocket.Server({ host: "172.30.1.55", port: 4001 })
        this.wss.on('connection', (ws: WebSocket, req) => {
            const random = String(new Date().getDate()) + Math.random()
            const id = crypo.createHash("sha512").update(String(random)).digest("base64")
            const client = new Client
            client.id = id
            client.ws = ws
            this.clients.push(client)
            ws.send(JSON.stringify({ id: id }))
            ws.addEventListener('close', (event) => {
                const targetClientIndex = this.clients.findIndex(client => client.ws === event.target)
                this.clients.splice(targetClientIndex, 1)
                console.log(this.clients)
            });
        });
    }

    reloadBroadcast(exceptionID?: string) {
        this.broadcast("reload", exceptionID)
    }

    broadcast(message: string, exceptionID?: string) {
        const targetClients = this.clients.filter(client => client.id !== exceptionID)
        targetClients.forEach(client => client.ws.send(JSON.stringify({ message })))
    }
}

