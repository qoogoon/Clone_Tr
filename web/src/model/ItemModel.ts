import { ItemData, ResponseServer } from "../data/container/DocumentContainer.js"
import Constant from "../data/constant/Constant.js"
import { getRequest, postRequest, putRequest } from "./Connect.js"
import Url from "../data/constant/Url.js"
import WebSocketClient from "../WebSocketClient.js"

export default class ItemModel {
    static getItems(): Promise<ItemData[]> {
        return new Promise((resolve, reject) => {
            getRequest(Url.Items).then((ResponseServer) => {
                const response: ResponseServer<ItemData[]> = ResponseServer as ResponseServer<ItemData[]>
                if (response.ok)
                    resolve(response.data as ItemData[])
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }

    static setItems(items: ItemData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            putRequest(Url.Items, { items, id: WebSocketClient.id }).then((ResponseServer) => {
                const response: ResponseServer<ItemData[]> = ResponseServer as ResponseServer<ItemData[]>
                if (response.ok)
                    resolve()
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }

    static addItem(text: string, index: number, listSeq: number): Promise<ItemData> {
        const addData: ItemData = {
            seq: -1, listSeq, text, index
        }
        return new Promise((resolve, reject) => {
            postRequest(Url.Item, { addData, id: WebSocketClient.id }).then((ResponseServer) => {
                const response: ResponseServer<ItemData> = ResponseServer as ResponseServer<ItemData>
                if (response.ok)
                    resolve(response.data as ItemData)
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }
}