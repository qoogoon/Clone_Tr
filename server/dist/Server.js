"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_js_1 = require("./App.js");
const http = require("http");
const app = new App_js_1.default().app;
http.createServer(app).listen(4000);
//# sourceMappingURL=Server.js.map