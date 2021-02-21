import * as WebSocket from "ws"
import * as crypo from "crypto"

export class Client {
    id: string
    ws: WebSocket
}

export default class WebSocketServer {
    wss: WebSocket.Server
    clients: Client[] = []
    constructor() {
        this.wss = new WebSocket.Server({ port: 4001 })
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
            });
        });
    }

    /**
     * 클라이언트에 다시 데이터를 로드 할 것을 알림
     * @param exceptionID 예외 클라이언트 ID
     */
    reloadBroadcast(exceptionID?: string) {
        this.broadcast("reload", exceptionID)
    }

    /**
     * 클라이언트에 브로드캐스팅. 예외 클라이언트 ID를 제외하고 송신
     * @param exceptionID 예외 클라이언트 ID
     */
    broadcast(message: string, exceptionID?: string) {
        const targetClients = this.clients.filter(client => client.id !== exceptionID)
        targetClients.forEach(client => client.ws.send(JSON.stringify({ message })))
    }
}

