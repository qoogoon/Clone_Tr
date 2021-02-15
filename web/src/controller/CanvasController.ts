import CanvasModel from "../model/CanvasModel.js"
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
    constructor() {
        this.refresh()
    }

    refresh() {
        const arrListData = CanvasModel.getLists()
        this.render(arrListData)
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
    private handleListFloatingEnd = () => {
        this.floatingListIndex = -1
        CanvasView.clearFloatingList()
        document.removeEventListener('mousemove', this.handleListFloating)
        document.removeEventListener('mouseup', this.handleListFloatingEnd)
        this.isListFloating = false
    }

    /**
     * Floating 아이템 종료 핸들러
     */
    private handleItemFloatingEnd = () => {
        this.floatingItemIndex = -1
        this.floatingListIndex = -1
        CanvasView.clearFloatingItem()
        document.removeEventListener('mousemove', this.handleItemFloating)
        document.removeEventListener('mouseup', this.handleItemFloatingEnd)
        this.isItemFloating = false
    }

    /**
     * Floating 리스트 이동 시 핸들러
     * @param moveEvent 마우스 이벤트
     */
    private handleItemFloating = (moveEvent: MouseEvent) => {
        const { isItemFloating, itemFloatingOffset, listFloatingOffset } = this
        if (!isItemFloating) return
        if (this.floatingItemIndex === -1) return

        const itemRect = CanvasView.getItemRect()
        const listRect = CanvasView.getListRect()
        const floatingItem = document.getElementById('floating-item')
        floatingItem.style.left = (moveEvent.clientX + itemFloatingOffset.left) + 'px'
        floatingItem.style.top = (moveEvent.clientY + itemFloatingOffset.top) + 'px'

        let isExchangeLeft = false
        let isExchangeRight = false
        const leftListPosition = CanvasView.getListPosition(this.floatingListIndex - 1)
        const rightListPosition = CanvasView.getListPosition(this.floatingListIndex + 1)
        const scrollX = CanvasView.boardElement.scrollLeft

        if (leftListPosition !== null) {
            const leftExchangeLine = leftListPosition.left + listRect.width / 3 * 1  //왼쪽 리스트와 교체 기준선
            const elementLeftEdgePos = moveEvent.clientX + listFloatingOffset.left + scrollX                //요소의 왼쪽 모서리 Position + scroll 보정
            isExchangeLeft = leftExchangeLine > elementLeftEdgePos
        }

        if (rightListPosition !== null) {
            const rightExchangeLine = rightListPosition.left + listRect.width / 3 * 2  //오른쪽 리스트와 교체 기준선
            const elementRightEdgePos = moveEvent.clientX + listRect.width + listFloatingOffset.left + scrollX       //요소의 오른쪽 모서리 Position + scroll 보정
            isExchangeRight = rightExchangeLine < elementRightEdgePos
        }

        if (isExchangeLeft || isExchangeRight) {
            const targetItem = CanvasModel.getItem(this.floatingListIndex, this.floatingItemIndex)
            this.floatingListIndex = isExchangeLeft ? this.floatingListIndex - 1 : this.floatingListIndex + 1
            const nextList = CanvasModel.getLists().find(list => list.index === this.floatingListIndex)
            this.floatingItemIndex = nextList.items.length === 0 ? 0 : this.floatingItemIndex
            const lastItemIndex = nextList.items.length
            let index = this.floatingItemIndex < lastItemIndex ? this.floatingItemIndex : lastItemIndex
            this.floatingItemIndex = index
            CanvasModel.setItem({
                seq: targetItem.seq,
                listSeq: nextList.seq,
                index,
                text: targetItem.text
            })
            this.refresh()
            return
        }

        //check top bottom
        let aboveItemPosition = CanvasView.getItemPosition(this.floatingListIndex, this.floatingItemIndex - 1)
        let belowItemPosition = CanvasView.getItemPosition(this.floatingListIndex, this.floatingItemIndex + 1)
        let isExchangeTop = aboveItemPosition !== null && aboveItemPosition.top + itemRect.height / 2 > moveEvent.clientY
        let isExchangeBottom = belowItemPosition !== null && belowItemPosition.top - itemRect.height / 2 < moveEvent.clientY
        if (isExchangeTop) {
            let topIndex = this.floatingItemIndex - 1
            let bottomIndex = this.floatingItemIndex
            this.floatingItemIndex = topIndex
            this.exchangeItem(this.floatingListIndex, topIndex, bottomIndex)
        }
        else if (isExchangeBottom) {
            let topIndex = this.floatingItemIndex
            let bottomIndex = this.floatingItemIndex + 1
            this.floatingItemIndex = bottomIndex
            this.exchangeItem(this.floatingListIndex, topIndex, bottomIndex)
        }
    }

    /**
     * Floating 리스트 이동 시 핸들러
     * @param moveEvent 마우스 이벤트
     */
    private handleListFloating = (moveEvent: MouseEvent) => {
        const { isListFloating, listFloatingOffset } = this
        const listWidth = CanvasView.getListRect().width
        const { lists } = this

        const floatingList = document.getElementById('floating-list')

        if (!isListFloating) return
        this.isListFloating = false
        floatingList.style.left = (moveEvent.clientX + listFloatingOffset.left) + 'px'
        floatingList.style.top = (moveEvent.clientY + listFloatingOffset.top) + 'px'

        //check
        let isExchangeLeft = false
        let isExchangeRight = false
        const leftListPosition = CanvasView.getListPosition(this.floatingListIndex - 1)
        const rightListPosition = CanvasView.getListPosition(this.floatingListIndex + 1)
        const scrollX = CanvasView.boardElement.scrollLeft
        if (leftListPosition !== null) {
            const leftExchangeLine = leftListPosition.left + listWidth / 3 * 1  //왼쪽 리스트와 교체 기준선
            const elementLeftEdgePos = moveEvent.clientX + listFloatingOffset.left + scrollX                //요소의 왼쪽 모서리 Position + scroll 보정
            isExchangeLeft = leftExchangeLine > elementLeftEdgePos
        }

        if (rightListPosition !== null) {
            const rightExchangeLine = rightListPosition.left + listWidth / 3 * 2  //오른쪽 리스트와 교체 기준선
            const elementRightEdgePos = moveEvent.clientX + listWidth + listFloatingOffset.left + scrollX       //요소의 오른쪽 모서리 Position + scroll 보정
            isExchangeRight = rightExchangeLine < elementRightEdgePos
        }

        if (isExchangeLeft) {
            console.log("isExchangeLeft")
            this.exchangeList(this.floatingListIndex - 1, this.floatingListIndex)
            CanvasView.setFloatingModeList(this.floatingListIndex, "idle")
            CanvasView.setFloatingModeList(this.floatingListIndex - 1, "float")
            this.floatingListIndex = this.floatingListIndex - 1
        }
        else if (isExchangeRight) {
            console.log("isExchangeRight")
            this.exchangeList(this.floatingListIndex, this.floatingListIndex + 1)
            CanvasView.setFloatingModeList(this.floatingListIndex, "idle")
            CanvasView.setFloatingModeList(this.floatingListIndex + 1, "float")
            this.floatingListIndex = this.floatingListIndex + 1
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
        })
    }



    /**
     * 리스트 교환
     * 두 리스트 컴포넌트를 서로 교환
     * @param indexLeft 교환 될 왼쪽 리스트 Index
     * @param indexRight 교환 될 오른쪽 리스트 Index
     */
    private exchangeList(indexLeft: number, indexRight: number) {
        //서버 적용 시 
        // const listRight = CanvasModel.getList(indexRight)
        // const listLeft = CanvasModel.getList(indexLeft)
        // CanvasModel.replaceList(listLeft, listRight)
        // CanvasModel.replaceList(listRight, listLeft)

        const listRight = this.lists.find(list => list.listData.index === indexLeft)
        const listLeft = this.lists.find(list => list.listData.index === indexRight)
        const tmpIndex = listLeft.listData.index
        listLeft.listData.index = listRight.listData.index
        listRight.listData.index = tmpIndex
        this.refresh()
    }

    private exchangeItem(listIndex: number, indexTop: number, indexBottom: number) {
        if (listIndex === -1 || indexTop === -1 || indexBottom === -1) return
        const listData = CanvasModel.getLists().find(list => list.index === listIndex)
        const topItemData = listData.items.find(item => item.index === indexTop)
        const bottomItemData = listData.items.find(item => item.index === indexBottom)
        const tmpIndex = topItemData.index
        CanvasModel.setItem({ ...topItemData, index: bottomItemData.index })
        CanvasModel.setItem({ ...bottomItemData, index: tmpIndex })
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
        const addListData: ListData = CanvasModel.addList(inputText, [], this.lists.length)
        this.addList(addListData)
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
}