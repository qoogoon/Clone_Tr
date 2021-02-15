import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import Constant from "../data/constant/Constant.js"
export default class CanvasModel {
    static getLists(): ListData[] {
        Constant.dummyLists.forEach(list => {
            const items = Constant.dummyItems.filter(item => item.listSeq === list.seq)
            items.sort((a, b) => a.index - b.index)
            list.items = items
        })
        return Constant.dummyLists
    }

    static setLists(lists: ListData[]) {
        Constant.dummyLists = lists
    }

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