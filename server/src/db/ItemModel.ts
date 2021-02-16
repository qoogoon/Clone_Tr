import { ItemData, Response } from "../data/Container.js";

export default class ItemModel {
  private constructor() { }
  static items: ItemData[] = [
    { seq: 0, listSeq: 0, index: 0, text: "item1" },
  ]

  static getItems = (): Response<ItemData> => {
    return {
      result: "success",
      data: ItemModel.items
    }
  }

  static setItems = (items: ItemData[]): Response<void> => {
    ItemModel.items = items
    return {
      result: "success"
    }
  }
}
