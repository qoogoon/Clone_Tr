import { CardData, ListData, ResponseServer } from "../data/container/DocumentContainer.js"
import Constant from "../data/constant/Constant.js"
import { getRequest, postRequest, putRequest } from "./Connect.js"
import Url from "../data/constant/Url.js"
// import { webSocketClient } from "../App.js"
import WebSocketClient from "../WebSocketClient.js"

export default class ListModel {
    static getLists(): Promise<ListData[]> {
        return new Promise((resolve, reject) => {
            getRequest(Url.Lists).then((response: ResponseServer<ListData[]>) => {
                if (response.ok)
                    resolve(response.data as ListData[])
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }

    static setLists(lists: ListData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            putRequest(Url.Lists, { lists, id: WebSocketClient.id }).then((response: ResponseServer<ListData[]>) => {
                if (response.ok)
                    resolve()
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }

    static addList(title: string, cards: CardData[], index: number): Promise<ListData> {
        const addData: ListData = {
            seq: -1, index, cards, title
        }
        return new Promise((resolve, reject) => {
            postRequest(Url.List, { addData, id: WebSocketClient.id }).then((response: ResponseServer<ListData>) => {
                if (response.ok)
                    resolve(response.data as ListData)
                else
                    reject(response)

            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }
}