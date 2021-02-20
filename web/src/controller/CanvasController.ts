import ItemModel from "../model/ItemModel.js"
import ListModel from "../model/ListModel.js"
import { handleError } from "../model/Connect.js"
import CanvasView from "../view/CanvasView.js"
import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import { preventParentClick, setOnListnerbyClass, setOnListnerbyID } from "./ElementListner.js"
import List from "./List.js"

export enum AddMode {
    IDLE, ADDING
}
export interface ElementPosition {
    left: number
    top: number
}

export default class CanvasController {
    addMode: AddMode = AddMode.IDLE;
    isListFloating: boolean = false
    isItemFloating: boolean = false
    floatingListIndex: number = -1
    floatingItemIndex: number = -1
    listFloatingOffset: ElementPosition = { left: 0, top: 0 }
    itemFloatingOffset: ElementPosition = { left: 0, top: 0 }
    lists: List[] = []
    arrListData: ListData[] = []
    arrItemData: ItemData[] = []
    addItemListIndex: number = -1
    constructor() {
        this.loadFromServer()
    }

    loadFromServer() {
        this.lists = []
        ListModel.getLists().then(lists => {
            this.arrListData = lists
            this.render(lists)
        }).catch(reason => {
            handleError(reason)
        })
        ItemModel.getItems().then(items => {
            this.arrItemData = items
        }).catch(reason => {
            handleError(reason)
        })
    }

    refresh() {
        this.arrListData.forEach(list => {
            const items = this.arrItemData.filter(item => item.listSeq === list.seq)
            items.sort((a, b) => a.index - b.index)
            list.items = items
        })
        this.render(this.arrListData)
    }

    render(arrListData: ListData[]) {
        CanvasView.initBoard()
        arrListData.sort((a, b) => a.index - b.index).forEach(list => {
            this.addList(list)
        })

        const floatTargetList = CanvasView.getListElement(this.floatingItemIndex)
        const isListFloating = floatTargetList !== null && this.floatingItemIndex === -1
        if (isListFloating)
            floatTargetList.id = "mod-list-float"

        const floatTargetItem = CanvasView.getItemElement(this.floatingListIndex, this.floatingItemIndex)
        if (floatTargetItem !== null)
            floatTargetItem.id = "mod-item-float"

        this.setListAddMode(this.addMode)
        if (this.addItemListIndex > -1)
            this.lists[this.addItemListIndex].setItemAddMode(AddMode.ADDING)
        this.handleBoardClick()
    }

    /**
     * 리스트 추가
     * @param data 적용될 데이터 
     * @returns 추가 된 리스트 Element
     */
    private addList(data: ListData): HTMLElement {
        const list = new List(data, this)
        this.lists.push(list)
        const newListElement = list.getListElement()
        const isListFloating = this.floatingItemIndex === -1 && this.floatingListIndex === data.index
        newListElement.id = isListFloating ? "mod-list-float" : undefined
        this.setListListener(data)
        return newListElement
    }

    /**
     * 리스트에 적용 될 리스너 설정
     * @param element 적용 할 List Element
     * @param data 적용 될 데이터 
     */
    private setListListener(data: ListData) {
        const listElement = CanvasView.getListElement(data.index)
        const editingTarget = listElement.getElementsByClassName('float-list-target').item(0)
        editingTarget.addEventListener('mousedown', (downEvent: MouseEvent) => {
            this.isListFloating = true
            this.floatingListIndex = data.index
            const rect = editingTarget.getBoundingClientRect()
            const position: ElementPosition = { left: rect.x + window.scrollX, top: rect.y + window.scrollY }

            CanvasView.createFloatingList(data, position)
            CanvasView.setFloatingModeList(data.index, "float")
            this.listFloatingOffset = {
                left: position.left - downEvent.clientX, top: position.top - downEvent.clientY,
            }
            document.addEventListener('mousemove', this.handleListFloating)
            document.addEventListener('mouseup', this.handleListFloatingEnd)
        })
    }

    //#region Handler
    /**
     * Floating 리스트 종료 핸들러
     */
    private handleListFloatingEnd = async () => {
        this.floatingListIndex = -1
        CanvasView.clearFloatingList()
        document.removeEventListener('mousemove', this.handleListFloating)
        document.removeEventListener('mouseup', this.handleListFloatingEnd)
        this.isListFloating = false
        await ListModel.setLists(this.arrListData).catch((reason) => { handleError(reason) })
        await ItemModel.setItems(this.arrItemData).catch((reason) => { handleError(reason) })
        this.loadFromServer()
    }

    /**
     * Floating 아이템 종료 핸들러
     */
    private handleItemFloatingEnd = async () => {
        this.floatingItemIndex = -1
        this.floatingListIndex = -1
        CanvasView.clearFloatingItem()
        document.removeEventListener('mousemove', this.handleItemFloating)
        document.removeEventListener('mouseup', this.handleItemFloatingEnd)
        this.isItemFloating = false
        await ListModel.setLists(this.arrListData).catch((reason) => { handleError(reason) })
        await ItemModel.setItems(this.arrItemData).catch((reason) => { handleError(reason) })
        this.loadFromServer()
    }

    /**
     * 리스트 또는 아이템 컴포넌트가 옆 리스트 컴포넌트로 교체 할 수 있는지
     * @param dir 판별 할 옆 라인의 방향
     * @param moveEvent 마우스 이벤트
     */
    isExchangeLine = (dir: "left" | "right", moveEvent: MouseEvent): boolean => {
        const { listFloatingOffset } = this
        const listRect = CanvasView.getListRect()
        const targetIndex = dir === "left" ? -1 : 1
        const listPosition = CanvasView.getListPosition(this.floatingListIndex + targetIndex)
        const scrollX = CanvasView.boardElement.scrollLeft
        if (listPosition === null) return false

        const exchangeOffset = listRect.width / 3 * (dir === "left" ? 1 : 2)
        const exchangeLine = listPosition.left + exchangeOffset + scrollX
        const elementLeftEdgePos = moveEvent.clientX + listFloatingOffset.left + scrollX + (dir === "right" ? listRect.width : 0)    //요소의 모서리 Position + scroll 보정
        console.log(exchangeLine, elementLeftEdgePos, scrollX)
        return dir === "left" ? exchangeLine > elementLeftEdgePos : exchangeLine < elementLeftEdgePos
    }

    /**
     * Floating 리스트 이동 시 핸들러
     * @param moveEvent 마우스 이벤트
     */
    private handleItemFloating = async (moveEvent: MouseEvent) => {
        const { isItemFloating, itemFloatingOffset } = this
        if (!isItemFloating) return
        if (this.floatingItemIndex === -1) return

        const floatingItem = document.getElementById('floating-item')
        floatingItem.style.left = (moveEvent.clientX + itemFloatingOffset.left) + 'px'
        floatingItem.style.top = (moveEvent.clientY + itemFloatingOffset.top) + 'px'

        const itemRect = CanvasView.getItemRect()
        let isExchangeLeft = this.isExchangeLine("left", moveEvent)
        let isExchangeRight = this.isExchangeLine("right", moveEvent)

        if (isExchangeLeft || isExchangeRight) {
            const targetItem = this.arrListData[this.floatingListIndex].items[this.floatingItemIndex]
            this.floatingListIndex += isExchangeLeft ? - 1 : 1
            const nextList = this.arrListData.find(list => list.index === this.floatingListIndex)
            this.floatingItemIndex = nextList.items.length === 0 ? 0 : this.floatingItemIndex
            const lastItemIndex = nextList.items.length
            let index = this.floatingItemIndex < lastItemIndex ? this.floatingItemIndex : lastItemIndex
            this.floatingItemIndex = index

            this.setItem({
                seq: targetItem.seq, listSeq: nextList.seq, index, text: targetItem.text
            })
            this.refresh()
            return
        }

        //check top bottom
        let aboveItemPosition = CanvasView.getItemPosition(this.floatingListIndex, this.floatingItemIndex - 1)
        let belowItemPosition = CanvasView.getItemPosition(this.floatingListIndex, this.floatingItemIndex + 1)
        let isExchangeTop = aboveItemPosition !== null && aboveItemPosition.top + itemRect.height / 2 > moveEvent.clientY
        let isExchangeBottom = belowItemPosition !== null && belowItemPosition.top - itemRect.height / 2 < moveEvent.clientY
        if (isExchangeTop || isExchangeBottom) {
            const listSeq = this.arrListData.find(list => list.index === this.floatingListIndex).seq
            const listInItems = this.arrItemData.filter(item => item.listSeq === listSeq)
            const movingItem = listInItems.find(item => item.index === this.floatingItemIndex)
            this.moveItem({ ...movingItem }, isExchangeTop ? "top" : "bottom")
        }
    }

    /**
     * Floating 리스트 이동 시 핸들러
     * @param moveEvent 마우스 이벤트
     */
    private handleListFloating = (moveEvent: MouseEvent) => {
        const { isListFloating, listFloatingOffset } = this

        const floatingList = document.getElementById('floating-list')

        if (!isListFloating) return
        this.isListFloating = false
        floatingList.style.left = (moveEvent.clientX + listFloatingOffset.left) + 'px'
        floatingList.style.top = (moveEvent.clientY + listFloatingOffset.top) + 'px'

        //check
        let isExchangeLeft = this.isExchangeLine("left", moveEvent)
        let isExchangeRight = this.isExchangeLine("right", moveEvent)
        if (isExchangeLeft || isExchangeRight) {
            this.moveList({ ...this.arrListData[this.floatingListIndex] }, isExchangeLeft ? "left" : "right")
            CanvasView.setFloatingModeList(this.floatingListIndex, "idle")
            CanvasView.setFloatingModeList(this.floatingListIndex + (isExchangeLeft ? -1 : 1), "float")
            this.floatingListIndex = this.floatingListIndex + (isExchangeLeft ? -1 : 1)
        }
        this.isListFloating = true
    }


    /**
     * 리스트 추가 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    private setListAddMode(mode: AddMode) {
        this.addMode = mode
        CanvasView.setListAddMode(mode)
        switch (mode) {
            case AddMode.IDLE:
                setOnListnerbyClass("click", "js-add-list list-wrapper mod-add is-idle", this.handleAddListIdleClick)
                break;
            case AddMode.ADDING:
                setOnListnerbyClass("click", "js-add-list list-wrapper mod-add", preventParentClick)
                setOnListnerbyClass("keypress", "list-name-input", this.handleListNameKeypress)
                setOnListnerbyClass("click", "add-button", this.addListByInputElement)
                setOnListnerbyClass("click", "add-close-button", () => {
                    this.setListAddMode(AddMode.IDLE)
                })
                break;
        }
    }

    /**
     * Board 클릭 리스너
     * 리스트 추가 활성 -> 비활성
     */
    private handleBoardClick = () => {
        document.getElementById("board").addEventListener("click", () => {
            this.lists.forEach(listCtrl => {
                if (listCtrl.addMode === AddMode.IDLE) return
                listCtrl.setItemAddMode(AddMode.IDLE)
            });

            if (this.addMode === AddMode.IDLE) return
            this.setListAddMode(AddMode.IDLE)
            this.addItemListIndex = -1
        })
    }

    /**
     * 리스트 이동
     * @param list 교환 주체가 되는 리스트
     * @param dir 리스트가 옮겨 갈 방향
     */
    private moveList(list: ListData, dir: "left" | "right") {
        list.index = dir === "left" ? list.index - 1 : list.index + 1
        this.setList(list)
        this.refresh()
    }

    /**
     * 아이템 이동
     * @param item 교환 주체가 되는 아이템
     * @param dir 아이템이 옮겨 갈 방향
     */
    private moveItem(item: ItemData, dir: "top" | "bottom") {
        item.index = dir === "top" ? item.index - 1 : item.index + 1
        this.floatingItemIndex = item.index
        this.setItem(item)
        this.refresh()
    }

    /**
     * 리스트명을 작성하는 Element의 정보로 리스트를 추가
     */
    private addListByInputElement = () => {
        const inputElement = document.getElementsByClassName("list-name-input").item(0) as HTMLInputElement
        const inputText = inputElement.value
        inputElement.value = ""
        if (inputText === "") return
        ListModel.addList(inputText, [], this.lists.length).then(response => {
            this.addList(response)
            this.loadFromServer()
        }).catch(reason => {
            handleError(reason)
        })
    }

    /**
     * 리스트 이름 input text 키 리스너
     */
    private handleListNameKeypress = (event: KeyboardEvent) => {
        if (event.key !== "Enter") return
        this.addListByInputElement()

    }

    /**
     * Idle 상태의 리스트 추가 컴포넌트 클릭리스너
     * 리스트 추가 상태로 활성
     */
    private handleAddListIdleClick = (event: MouseEvent) => {
        preventParentClick(event);
        this.setListAddMode(AddMode.ADDING)
    }


    setItemListener(element: HTMLElement, data: ItemData, listIndex: number) {
        const editingTarget = element.getElementsByClassName('float-item-target').item(0)
        editingTarget.addEventListener('mousedown', (downEvent: MouseEvent) => {
            this.isItemFloating = true
            this.floatingListIndex = listIndex
            this.floatingItemIndex = data.index

            const itemPosition = CanvasView.getItemPosition(listIndex, data.index)
            const listPosition = CanvasView.getListPosition(listIndex)
            CanvasView.createFloatingItem(data, {
                left: itemPosition.left + window.scrollX,
                top: itemPosition.top + window.scrollY
            })
            CanvasView.setFloatingModeItem(listIndex, data.index, "float")
            this.itemFloatingOffset = {
                left: itemPosition.left - downEvent.clientX, top: itemPosition.top - downEvent.clientY,
            }
            this.listFloatingOffset = {
                left: listPosition.left - downEvent.clientX, top: listPosition.top - downEvent.clientY,
            }

            document.addEventListener('mousemove', this.handleItemFloating)
            document.addEventListener('mouseup', this.handleItemFloatingEnd)
        })
    }

    private setItem = (newData: ItemData) => {
        let oldData = this.arrItemData.filter(item => item.seq === newData.seq)[0]
        if (!oldData) return
        if (oldData.listSeq !== newData.listSeq) {
            const lastListInItems = this.arrItemData.filter(list => list.listSeq === oldData.listSeq)
            lastListInItems.forEach((item) => {
                if (item.index > oldData.index)
                    item.index -= 1
            })

            const nextListInItems = this.arrItemData.filter(list => list.listSeq === newData.listSeq)
            nextListInItems.forEach((item) => {
                if (item.index >= newData.index)
                    item.index += 1
            })
            oldData.listSeq = newData.listSeq
        }
        if (oldData.index !== newData.index) {
            const replaceTargetItem = this.arrItemData.find(item => item.index === newData.index && item.listSeq === newData.listSeq)
            if (replaceTargetItem !== undefined)
                replaceTargetItem.index = oldData.index
        }
        const keys = Object.keys(newData)
        keys.forEach(key => {
            oldData[key] = newData[key]
        })
    }

    private setList = (newData: ListData) => {
        let oldData = this.arrListData.filter(list => list.seq === newData.seq)[0]
        if (!oldData) return
        if (oldData.index !== newData.index) {
            const replaceTargetList = this.arrListData.find(list => list.index === newData.index)
            replaceTargetList.index = oldData.index
        }
        const keys = Object.keys(newData)
        keys.forEach(key => {
            oldData[key] = newData[key]
        })
    }
}