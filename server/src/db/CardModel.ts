import { CardData, ResponseServer } from "../data/Container.js";
import ListModel from "./ListModel"
export default class CardModel {
  private constructor() { }
  static cards: CardData[] = []

  /**
   * @returns 모든 카드(데이터 응답) 
   */
  static getCards = (): ResponseServer<CardData> => {
    return { ok: true, data: CardModel.cards }
  }

  /**
   * @param cards 수정 할 카드들
   * @returns (데이터 응답) 
   */
  static setCards = (cards: CardData[]): ResponseServer<void> => {
    CardModel.cards = cards
    return { ok: true }
  }

  /**
   * @param newData 추가 할 카드 데이터
   * @returns 추가 된 카드(데이터 응답) 
   */
  static addCard = (newData: CardData): ResponseServer<CardData> => {
    try {
      newData.seq = CardModel.cards.length;
      CardModel.cards.push(newData);
      return { ok: true, data: newData }
    } catch (e) {
      return { ok: false, serverMessage: "add fail : " + e }
    }
  }
}
