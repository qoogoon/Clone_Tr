import * as Express from "express"
import { ItemData, ListData, Response } from "../data/Container.js";
import ListModel from "../db/ListModel.js"
import ItemModel from "../db/ItemModel.js"

class CanvasController {
  constructor(app: Express.Application) {
    this.controller(app)
  }

  controller = (app: Express.Application) => {
    app.get(`/lists`, (req, res) => {
      res.send(ListModel.getLists())
    });

    app.put(`/lists`, (req, res) => {
      const lists = req.body.lists as ListData[]
      res.send(ListModel.setLists(lists))
    });

    app.get(`/list`, (req, res) => {
      const index = req.query.index as string
      res.send(ListModel.getList(index))
    });

    app.get(`/items`, (req, res) => {
      res.send(ItemModel.getItems())
    });

    app.put(`/items`, (req, res) => {
      const items = req.body.items as ItemData[]
      res.send(ItemModel.setItems(items))
    });
  }
}
export default CanvasController;
