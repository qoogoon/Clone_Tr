import * as Express from "express"
import { webworker } from "webpack"
import ListModel from "../db/ListModel.js"
import WebSocketServer from "../WebSocketServer.js"

class ListController {
  constructor(app: Express.Application, wss: WebSocketServer) {
    this.controller(app, wss)
  }

  controller = (app: Express.Application, wss: WebSocketServer) => {
    app.get(`/lists`, (req, res) => {
      res.send(ListModel.getLists())
    });

    app.put(`/lists`, (req, res) => {
      const { lists, id } = req.body
      res.send(ListModel.setLists(lists))
      wss.reloadBroadcast(id)
    })

    app.post(`/list`, (req, res) => {
      const { id } = req.body
      const result = ListModel.addList(req.body.addData)
      res.send(result)
      wss.reloadBroadcast(id)
    })
  }

  requestReload = () => {
    console.log("request")
  }
}
export default ListController;
