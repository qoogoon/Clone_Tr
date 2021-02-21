import { getRequest, postRequest, putRequest } from "./Connect.js";
import Url from "../data/constant/Url.js";
import WebSocketClient from "../WebSocketClient.js";
export default class CardModel {
    static getCards() {
        return new Promise((resolve, reject) => {
            getRequest(Url.Cards).then((ResponseServer) => {
                const response = ResponseServer;
                if (response.ok)
                    resolve(response.data);
                else
                    reject(response);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    static setCards(cards) {
        return new Promise((resolve, reject) => {
            putRequest(Url.Cards, { cards, id: WebSocketClient.id }).then((ResponseServer) => {
                const response = ResponseServer;
                if (response.ok)
                    resolve();
                else
                    reject(response);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    static addCard(text, index, listSeq) {
        const addData = {
            seq: -1, listSeq, text, index
        };
        return new Promise((resolve, reject) => {
            postRequest(Url.Card, { addData, id: WebSocketClient.id }).then((ResponseServer) => {
                const response = ResponseServer;
                if (response.ok)
                    resolve(response.data);
                else
                    reject(response);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
}
//# sourceMappingURL=CardModel.js.map