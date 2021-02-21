"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cors = require("cors");
const express = require("express");
const WebSocketServer_js_1 = require("./WebSocketServer.js");
const ListController_js_1 = require("./controller/ListController.js");
const CardController_js_1 = require("./controller/CardController.js");
class App {
    constructor() {
        this.app = express();
        this.app.use(Cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.get("/check", (req, res) => {
            var datetime = new Date();
            console.log("connection is detected = " +
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
                datetime.getSeconds());
            res.send("connect");
        });
        this.app.get("/", (req, res) => {
            res.send("Welcome to my server");
        });
        const socketServer = new WebSocketServer_js_1.default();
        new ListController_js_1.default(this.app, socketServer);
        new CardController_js_1.default(this.app, socketServer);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map