import * as Express from "express"
import ItemModel from "../db/ItemModel.js"
import WebSocketServer from "../WebSocketServer.js"


class ItemController {
  constructor(app: Express.Application, wss: WebSocketServer) {
    this.controller(app, wss)
  }

  controller = (app: Express.Application, wss: WebSocketServer) => {
    app.get(`/items`, (req, res) => {
      res.send(ItemModel.getItems())
    });

    app.put(`/items`, (req, res) => {
      const { items, id } = req.body
      res.send(ItemModel.setItems(items))
      wss.reloadBroadcast(id)

    });

    app.post(`/item`, (req, res) => {
      const { id } = req.body
      const result = ItemModel.addItem(req.body.addData)
      res.send(result)
      wss.reloadBroadcast(id)
    })
  }
}
export default ItemController;
