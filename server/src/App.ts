import * as Cors from "cors";
import * as express from "express";
import WebSocketServer from "./WebSocketServer.js"
import ListController from "./controller/ListController.js";
import CardController from "./controller/CardController.js";

class App {
    test: string;
    public app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(Cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.get("/check", (req, res) => {
            var datetime = new Date();
            console.log(
                "connection is detected = " +
                datetime.getFullYear() +
                "." +
                (datetime.getMonth() + 1) +
                "." +
                datetime.getDate() +
                " " +
                datetime.getHours() +
                ":" +
                datetime.getMinutes() +
                ":" +
                datetime.getSeconds()
            );
            res.send("connect");
        });
        this.app.get(
            "/",
            (
                req: express.Request,
                res: express.Response,
            ) => {
                res.send("Welcome to my server");
            }
        );
        const socketServer = new WebSocketServer()
        new ListController(this.app, socketServer)
        new CardController(this.app, socketServer)
    }
}

export default App;
