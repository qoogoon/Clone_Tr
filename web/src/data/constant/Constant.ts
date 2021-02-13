import { ItemData, ListData } from "../container/DocumentContainer.js"
export default class Constant {
    static dummyLists: ListData[] = [
        {
            index: 0, items: [
                { index: 0, text: "item1" },
                { index: 1, text: "item2" },
            ], title: "test1"
        },
        { index: 1, items: [], title: "test2" },
        { index: 2, items: [], title: "test3" },
        { index: 3, items: [], title: "test4" },
        { index: 4, items: [], title: "test5" },
    ]
}