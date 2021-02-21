import { ListData, ResponseServer } from "../data/Container.js";
import CardModel from "./CardModel.js"

export default class ListModel {
  private constructor() { }
  static lists: ListData[] = []

  /**
   * @returns 모든 리스트(데이터 응답) 
   */
  static getLists = (): ResponseServer<ListData[]> => {
    ListModel.lists.forEach(list => {
      const cards = CardModel.cards.filter(card => card.listSeq === list.seq)
      cards.sort((a, b) => a.index - b.index)
      list.cards = cards
    })
    return { ok: true, data: ListModel.lists }
  }

  /**
   * @param lists 수정 할 리스트들
   * @returns (데이터 응답) 
   */
  static setLists = (lists: ListData[]): ResponseServer<void> => {
    ListModel.lists = lists
    return { ok: true }
  }

  /**
   * @param newData 추가 할 리스트 데이터
   * @returns 추가 된 리스트(데이터 응답) 
   */
  static addList = (newData: ListData): ResponseServer<ListData> => {
    try {
      newData.seq = ListModel.lists.length;
      ListModel.lists.push(newData);
      return { ok: true, data: newData }
    } catch (e) {
      return { ok: false, serverMessage: "add fail : " + e }
    }
  }
}
