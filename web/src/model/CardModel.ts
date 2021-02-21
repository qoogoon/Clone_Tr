import { CardData, ResponseServer } from "../data/container/DocumentContainer.js"
import Constant from "../data/constant/Constant.js"
import { getRequest, postRequest, putRequest } from "./Connect.js"
import Url from "../data/constant/Url.js"
import WebSocketClient from "../WebSocketClient.js"

export default class CardModel {
    static getCards(): Promise<CardData[]> {
        return new Promise((resolve, reject) => {
            getRequest(Url.Cards).then((ResponseServer) => {
                const response: ResponseServer<CardData[]> = ResponseServer as ResponseServer<CardData[]>
                if (response.ok)
                    resolve(response.data as CardData[])
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }

    static setCards(cards: CardData[]): Promise<void> {
        return new Promise((resolve, reject) => {
            putRequest(Url.Cards, { cards, id: WebSocketClient.id }).then((ResponseServer) => {
                const response: ResponseServer<CardData[]> = ResponseServer as ResponseServer<CardData[]>
                if (response.ok)
                    resolve()
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }

    static addCard(text: string, index: number, listSeq: number): Promise<CardData> {
        const addData: CardData = {
            seq: -1, listSeq, text, index
        }
        return new Promise((resolve, reject) => {
            postRequest(Url.Card, { addData, id: WebSocketClient.id }).then((ResponseServer) => {
                const response: ResponseServer<CardData> = ResponseServer as ResponseServer<CardData>
                if (response.ok)
                    resolve(response.data as CardData)
                else
                    reject(response)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }
}