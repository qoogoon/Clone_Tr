import CanvasView from "../view/CanvasView.js"
import CanvasModel from "../model/CanvasModel.js"
import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import { preventParentClick, setOnListnerbyClass, setOnListnerbyID } from "./ElementListner.js"
import Constant from "../data/constant/Constant.js"
import CanvasController from "./CanvasController.js"
export enum AddMode {
    IDLE, ADDING
}
export interface ElementPosition {
    left: number
    top: number
}

export default class List {
    itemPositions: ElementPosition[] = []
    addMode: AddMode
    items: ItemData[] = []
    listData: ListData
    canvasCtrl: CanvasController
    listElement: HTMLElement

    constructor(data: ListData, canvasCtrl: CanvasController) {
        this.listData = data
        this.addMode = AddMode.IDLE;
        this.canvasCtrl = canvasCtrl
        this.initRender()
    }

    getListElement(): HTMLElement {
        return this.listElement
    }

    /**
     * 초기 랜더
     */
    private initRender() {
        const newListElement = CanvasView.addList(this.listData)
        this.listElement = newListElement
        this.listData.items.forEach(item => {
            this.addItem(this.listData.index, item)
        })
        CanvasView.addItemAddElement(newListElement, this.addMode)
        this.setItemAddMode(this.addMode)
    }

    /**
     * 리스트 추가
     * @param data 적용될 데이터 
     * @returns 추가 된 리스트 Element
     */
    private addItem(listIndex: number, data: ItemData): HTMLElement {
        // const list = new List(data, CanvasView)
        this.items.push(data)
        const newItemElement = CanvasView.addItem(listIndex, data)
        const rect = newItemElement.getBoundingClientRect()
        this.itemPositions.push({
            left: rect.x,
            top: rect.y
        })
        const isExistIndex = this.listData.items.find(item => item.index === data.index) !== undefined
        if (!isExistIndex)
            this.listData.items.push(data)
        this.canvasCtrl.setItemListener(newItemElement, data, this.listData.index)
        return newItemElement
    }

    /**
     * 리스트 추가 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    setItemAddMode(mode: AddMode) {
        this.addMode = mode
        CanvasView.setItemAddMode(mode, this.listData.index)
        switch (mode) {
            case AddMode.IDLE:
                const addItem = this.listElement.getElementsByClassName("js-add-item add-item mod-add is-idle").item(0)
                addItem.addEventListener("click", this.handleAddItemIdleClick)
                break;
            case AddMode.ADDING:
                setOnListnerbyClass("click", "js-add-item add-item mod-add", preventParentClick)
                setOnListnerbyClass("keypress", "item-name-input", this.handleListNameKeypress)
                setOnListnerbyClass("click", "add-button", this.addItemByInputElement)
                setOnListnerbyClass("click", "add-close-button", () => {
                    this.setItemAddMode(AddMode.IDLE)
                })
                break;
        }
    }

    /**
     * 리스트 이름 input text 키 리스너
     */
    private handleListNameKeypress = (event: KeyboardEvent) => {
        if (event.key !== "Enter") return
        this.addItemByInputElement()
    }

    /**
     * 리스트명을 작성하는 Element의 정보로 리스트를 추가
     */
    private addItemByInputElement = () => {
        const addElement = document.getElementsByClassName("js-add-item").item(this.listData.index) as HTMLInputElement
        const inputElement = addElement.getElementsByClassName("item-name-input").item(0) as HTMLInputElement

        if (inputElement === null) return

        const inputText = inputElement.value
        if (inputText === "") return

        inputElement.value = ""
        const addItemData: ItemData = CanvasModel.addItem(inputText, this.items.length, this.listData.seq)
        this.addItem(this.listData.index, addItemData)
    }

    /**
     * Idle 상태의 아이템 추가 컴포넌트 클릭리스너
     * 리스트 추가 상태로 활성
     */
    private handleAddItemIdleClick = (event: MouseEvent) => {
        preventParentClick(event);
        this.setItemAddMode(AddMode.ADDING)
    }
}