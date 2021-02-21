"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CardModel_js_1 = require("./CardModel.js");
class ListModel {
    constructor() { }
}
exports.default = ListModel;
ListModel.lists = [];
/**
 * @returns 모든 리스트(데이터 응답)
 */
ListModel.getLists = () => {
    ListModel.lists.forEach(list => {
        const cards = CardModel_js_1.default.cards.filter(card => card.listSeq === list.seq);
        cards.sort((a, b) => a.index - b.index);
        list.cards = cards;
    });
    return { ok: true, data: ListModel.lists };
};
/**
 * @param lists 수정 할 리스트들
 * @returns (데이터 응답)
 */
ListModel.setLists = (lists) => {
    ListModel.lists = lists;
    return { ok: true };
};
/**
 * @param newData 추가 할 리스트 데이터
 * @returns 추가 된 리스트(데이터 응답)
 */
ListModel.addList = (newData) => {
    try {
        newData.seq = ListModel.lists.length;
        ListModel.lists.push(newData);
        return { ok: true, data: newData };
    }
    catch (e) {
        return { ok: false, serverMessage: "add fail : " + e };
    }
};
//# sourceMappingURL=ListModel.js.map