import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import Constant from "../data/constant/Constant.js"
export default class CanvasModel {
    getLists(): ListData[] {
        return Constant.dummyLists
    }
}