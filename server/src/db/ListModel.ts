import { ListData, Response } from "../data/Container.js";
import ItemModel from "./ItemModel.js"

export default class ListModel {
  private constructor() { }
  private static lists: ListData[] = [
    { seq: 0, index: 0, title: "test1" },
  ]

  static getLists = (): Response<ListData[]> => {
    ListModel.lists.forEach(list => {
      const items = ItemModel.items.filter(item => item.listSeq === list.seq)
      items.sort((a, b) => a.index - b.index)
      list.items = items
    })
    return {
      result: "success",
      data: ListModel.lists
    }
  }

  static getList = (index: string): Response<ListData> => {
    if (index === undefined) return { result: "fail", message: "index param nothing" }

    const list = ListModel.lists.find(list => list.index === Number.parseInt(index))
    if (list === undefined) return { result: "fail", message: "out of index" }

    return {
      result: "success",
      data: list
    }
  }

  static setLists = (lists: ListData[]): Response<void> => {
    ListModel.lists = lists
    return {
      result: "success"
    }
  }
}
