"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CardModel {
    constructor() { }
}
exports.default = CardModel;
CardModel.cards = [];
/**
 * @returns 모든 카드(데이터 응답)
 */
CardModel.getCards = () => {
    return { ok: true, data: CardModel.cards };
};
/**
 * @param cards 수정 할 카드들
 * @returns (데이터 응답)
 */
CardModel.setCards = (cards) => {
    CardModel.cards = cards;
    return { ok: true };
};
/**
 * @param newData 추가 할 카드 데이터
 * @returns 추가 된 카드(데이터 응답)
 */
CardModel.addCard = (newData) => {
    try {
        newData.seq = CardModel.cards.length;
        CardModel.cards.push(newData);
        return { ok: true, data: newData };
    }
    catch (e) {
        return { ok: false, serverMessage: "add fail : " + e };
    }
};
//# sourceMappingURL=CardModel.js.map