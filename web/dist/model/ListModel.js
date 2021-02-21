import { getRequest, postRequest, putRequest } from "./Connect.js";
import Url from "../data/constant/Url.js";
// import { webSocketClient } from "../App.js"
import WebSocketClient from "../WebSocketClient.js";
export default class ListModel {
    static getLists() {
        return new Promise((resolve, reject) => {
            getRequest(Url.Lists).then((response) => {
                if (response.ok)
                    resolve(response.data);
                else
                    reject(response);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    static setLists(lists) {
        return new Promise((resolve, reject) => {
            putRequest(Url.Lists, { lists, id: WebSocketClient.id }).then((response) => {
                if (response.ok)
                    resolve();
                else
                    reject(response);
            }).catch((reason) => {
                reject(reason);
            });
        });
    }
    static addList(title, cards, index) {
        const addData = {
            seq: -1, index, cards, title
        };
        return new Promise((resolve, reject) => {
            postRequest(Url.List, { addData, id: WebSocketClient.id }).then((response) => {
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
//# sourceMappingURL=ListModel.js.map