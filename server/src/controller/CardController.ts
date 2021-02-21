import * as Express from "express"
import CardModel from "../db/CardModel.js"
import WebSocketServer from "../WebSocketServer.js"

class CardController {
  constructor(app: Express.Application, wss: WebSocketServer) {
    this.controller(app, wss)
  }

  controller = (app: Express.Application, wss: WebSocketServer) => {
    /**
     * 모든 카드 얻기
     */
    app.get(`/cards`, (req, res) => {
      res.send(CardModel.getCards())
    });

    /**
     * 모든 카드 일괄 수정
     * @param cards 갱신 할 카드 데이터
     * @param id 소켓 통신 클라이언트 id
     */
    app.put(`/cards`, (req, res) => {
      const { cards, id } = req.body
      res.send(CardModel.setCards(cards))
      wss.reloadBroadcast(id)
    });

    /**
     * 카드 추가
     * @param id 소켓 통신 클라이언트 id
     */
    app.post(`/card`, (req, res) => {
      const { id } = req.body
      const result = CardModel.addCard(req.body.addData)
      res.send(result)
      wss.reloadBroadcast(id)
    })
  }
}
export default CardController;
