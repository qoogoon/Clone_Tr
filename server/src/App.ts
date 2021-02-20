import * as Cors from "cors";
import * as express from "express";
// import * as WebSocket from "ws";
import WebSocketServer from "./WebSocketServer.js"

//component
import ListController from "./controller/ListController.js";
import ItemController from "./controller/ItemController.js";

class App {
    test: string;
    public app: express.Application;

    constructor() {
        this.app = express();

        // CORS 설정
        this.app.use(Cors());

        //body parser 설정(post body 얻게 해 줌)
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
        const listController = new ListController(this.app, socketServer)
        const itemController = new ItemController(this.app, socketServer)


    }
}

export default App;
