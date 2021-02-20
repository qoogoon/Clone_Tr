import { ListData, ResponseServer } from "../data/Container.js";
import ItemModel from "./ItemModel.js"

export default class ListModel {
  private constructor() { }
  static lists: ListData[] = [
    { seq: 0, index: 0, title: "test1" },
  ]

  static getLists = (): ResponseServer<ListData[]> => {
    ListModel.lists.forEach(list => {
      const items = ItemModel.items.filter(item => item.listSeq === list.seq)
      items.sort((a, b) => a.index - b.index)
      list.items = items
    })
    return { ok: true, data: ListModel.lists }
  }

  static setLists = (lists: ListData[]): ResponseServer<void> => {
    ListModel.lists = lists
    console.log("setLists:", lists)

    return { ok: true }
  }

  // static getList = (index: string): ResponseServer<ListData> => {
  //   if (index === undefined) return { ok: false, serverMessage: "index param nothing" }
  //   const list = ListModel.lists.find(list => list.index === Number.parseInt(index))
  //   if (list === undefined) return { ok: false, serverMessage: "not found index" }

  //   return { ok: true, data: list }
  // }

  static addList = (newData: ListData): ResponseServer<ListData> => {
    try {
      newData.seq = ListModel.lists.length;
      ListModel.lists.push(newData);
      console.log("addList:", newData)
      return { ok: true, data: newData }
    } catch (e) {
      return { ok: false, serverMessage: "add fail : " + e }
    }
  }
}
