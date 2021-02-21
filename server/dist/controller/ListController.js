"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ListModel_js_1 = require("../db/ListModel.js");
class ListController {
    constructor(app, wss) {
        this.controller = (app, wss) => {
            /**
             * 모든 리스트 얻기
             */
            app.get(`/lists`, (req, res) => {
                res.send(ListModel_js_1.default.getLists());
            });
            /**
             * 모든 리스트 일괄 수정
             * @param lists 갱신 할 리스트 데이터
             * @param id 소켓 통신 클라이언트 id
             */
            app.put(`/lists`, (req, res) => {
                const { lists, id } = req.body;
                res.send(ListModel_js_1.default.setLists(lists));
                wss.reloadBroadcast(id);
            });
            /**
             * 리스트 추가
             * @param id 소켓 통신 클라이언트 id
             */
            app.post(`/list`, (req, res) => {
                const { id, addData } = req.body;
                const result = ListModel_js_1.default.addList(addData);
                res.send(result);
                wss.reloadBroadcast(id);
            });
        };
        this.requestReload = () => {
            console.log("request");
        };
        this.controller(app, wss);
    }
}
exports.default = ListController;
//# sourceMappingURL=ListController.js.map