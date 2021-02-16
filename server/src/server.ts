import App from "./App.js";
import * as Express from "express";
import * as http from "http";

const app: Express.Application = new App().app;
http.createServer(app).listen(4000);