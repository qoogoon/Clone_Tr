import { ItemData, ListData, Response } from "../data/container/DocumentContainer.js"
import Constant from "../data/constant/Constant.js"
import { getRequest, postRequest } from "./Connect.js"
// import Url from "../data/constant/Url.js"
import Url from "../data/constant/Url.js"

export default class CanvasModel {
    // static getLists(): Promise<ListData[]> {
    //     console.log("test")

    //     return new Promise((resolve, reject) => {
    //         fetch(Url.Lists)
    //             .then((response) => response.json())
    //             .then((responseData) => {
    //                 const response: Response<ListData[]> = responseData as Response<ListData[]>
    //                 if (response.result === "success") {
    //                     const lists = response.data as ListData[]
    //                     resolve(lists)
    //                 }
    //                 else
    //                     reject(response.result)
    //             }).catch((reason: any) => {
    //                 reject(reason)
    //             })
    //     })
    // }


    static getLists(): Promise<ListData[]> {
        console.log("test")
        return new Promise((resolve, reject) => {
            getRequest(Url.Lists).then((responseData) => {
                const response: Response<ListData[]> = responseData as Response<ListData[]>
                if (response.result === "success") {
                    const lists = response.data as ListData[]
                    resolve(lists)
                }
                else
                    reject(response.result)
            }).catch((reason: any) => {
                reject(reason)
            })
        })
    }


    // static setLists(lists: ListData[]): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         return fetch(Url.Lists, {
    //             method: 'PUT', // *GET, POST, PUT, DELETE, etc.
    //             mode: 'cors', // no-cors, cors, *same-origin
    //             cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //             credentials: 'same-origin', // include, *same-origin, omit
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 // 'Content-Type': 'application/x-www-form-urlencoded',
    //             },
    //             redirect: 'follow', // manual, *follow, error
    //             referrer: 'no-referrer', // no-referrer, *client
    //             body: JSON.stringify(lists), // body data type must match "Content-Type" header
    //         })
    //             .then(response => response.json());
    //     })
    // }

    // static getList(index: number) : Promise<ListData[]> {
    //     return new Promise((resolve, reject) => {
    //         fetch(Url.Lists)
    //             .then((response) => response.json())
    //             .then((data) => {
    //                 const response: Response<ListData[]> = data as Response<ListData[]>
    //                 if (response.result === "success")
    //                     resolve(response.data as ListData[])
    //                 else
    //                     reject(response.result)
    //             }).catch((reason: any) => {
    //                 reject(reason)
    //             })
    //     })
    // }

    static getList(index: number) {
        return Constant.dummyLists.find(list => list.index === index)
    }

    static replaceList(oldData: ListData, newData: ListData) {
        let targetData = Constant.dummyLists.find(list => list.seq === oldData.seq)
        // targetData = newData
        targetData.index = newData.index
        targetData.items = newData.items
        targetData.title = newData.title

    }

    static setList(newData: ListData) {
        const oldData = Constant.dummyLists.filter(list => list.seq === newData.seq)[0]
        oldData.index = newData.index
        oldData.items = newData.items
        oldData.title = newData.title
    }

    static addList(title: string, items: ItemData[], index: number): ListData {
        const addData: ListData = {
            seq: Constant.dummyLists.length,
            index, items, title
        }
        Constant.dummyLists.push(addData)
        return addData
    }
    static addItem(text: string, index: number, listSeq: number): ItemData {
        const addData: ItemData = {
            seq: Constant.dummyItems.length,
            listSeq, text, index

        }
        Constant.dummyItems.push(addData)
        return addData
    }

    static getItem(listIndex: number, itemIndex: number): ItemData {
        const listData = Constant.dummyLists.filter(list => list.index === listIndex)[0]
        return Constant.dummyItems.filter((item: ItemData) => {
            return item.listSeq === listData.seq && item.index === itemIndex
        })[0]

    }

    static setItem(newData: ItemData) {
        let oldData = Constant.dummyItems.filter(item => item.seq === newData.seq)[0]
        if (oldData.listSeq !== newData.listSeq) {
            const lastListInItems = Constant.dummyItems.filter(list => list.listSeq === oldData.listSeq)
            lastListInItems.forEach((item) => {
                if (item.index > oldData.index)
                    item.index -= 1
            })

            const nextListInItems = Constant.dummyItems.filter(list => list.listSeq === newData.listSeq)
            nextListInItems.forEach((item) => {
                if (item.index >= newData.index)
                    item.index += 1
            })
        }
        oldData.index = newData.index
        oldData.listSeq = newData.listSeq
        oldData.seq = newData.seq
        oldData.text = newData.text
    }

}