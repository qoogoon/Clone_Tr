import * as Cors from "cors";
import * as express from "express";

//component
import CanvasController from "./controller/CanvasController.js";

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
        new CanvasController(this.app)
    }
}

export default App;
