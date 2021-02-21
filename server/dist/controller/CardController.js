"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CardModel_js_1 = require("../db/CardModel.js");
class CardController {
    constructor(app, wss) {
        this.controller = (app, wss) => {
            /**
             * 모든 카드 얻기
             */
            app.get(`/cards`, (req, res) => {
                res.send(CardModel_js_1.default.getCards());
            });
            /**
             * 모든 카드 일괄 수정
             * @param cards 갱신 할 카드 데이터
             * @param id 소켓 통신 클라이언트 id
             */
            app.put(`/cards`, (req, res) => {
                const { cards, id } = req.body;
                res.send(CardModel_js_1.default.setCards(cards));
                wss.reloadBroadcast(id);
            });
            /**
             * 카드 추가
             * @param id 소켓 통신 클라이언트 id
             */
            app.post(`/card`, (req, res) => {
                const { id } = req.body;
                const result = CardModel_js_1.default.addCard(req.body.addData);
                res.send(result);
                wss.reloadBroadcast(id);
            });
        };
        this.controller(app, wss);
    }
}
exports.default = CardController;
//# sourceMappingURL=CardController.js.map