import * as Express from "express"
import { webworker } from "webpack"
import ListModel from "../db/ListModel.js"
import WebSocketServer from "../WebSocketServer.js"

class ListController {
  constructor(app: Express.Application, wss: WebSocketServer) {
    this.controller(app, wss)
  }

  controller = (app: Express.Application, wss: WebSocketServer) => {
    /**
     * 모든 리스트 얻기
     */
    app.get(`/lists`, (req, res) => {
      res.send(ListModel.getLists())
    });

    /**
     * 모든 리스트 일괄 수정
     * @param lists 갱신 할 리스트 데이터
     * @param id 소켓 통신 클라이언트 id
     */
    app.put(`/lists`, (req, res) => {
      const { lists, id } = req.body
      res.send(ListModel.setLists(lists))
      wss.reloadBroadcast(id)
    })

    /**
     * 리스트 추가
     * @param id 소켓 통신 클라이언트 id
     */
    app.post(`/list`, (req, res) => {
      const { id, addData } = req.body
      const result = ListModel.addList(addData)
      res.send(result)
      wss.reloadBroadcast(id)
    })
  }

  requestReload = () => {
    console.log("request")
  }
}
export default ListController;
