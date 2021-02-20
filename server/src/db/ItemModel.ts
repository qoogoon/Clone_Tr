import { ItemData, ResponseServer } from "../data/Container.js";
import ListModel from "../db/ListModel"
export default class ItemModel {
  private constructor() { }
  static items: ItemData[] = [
    { seq: 0, listSeq: 0, index: 0, text: "item1" },
  ]

  static getItems = (): ResponseServer<ItemData> => {
    return { ok: true, data: ItemModel.items }
  }

  static setItems = (items: ItemData[]): ResponseServer<void> => {
    ItemModel.items = items
    console.log("setItems:", items)

    return { ok: true }
  }

  static addItem = (newData: ItemData): ResponseServer<ItemData> => {
    try {
      newData.seq = ItemModel.items.length;
      ItemModel.items.push(newData);
      console.log("addItem:", newData)
      return { ok: true, data: newData }
    } catch (e) {
      return { ok: false, serverMessage: "add fail : " + e }
    }
  }
}
