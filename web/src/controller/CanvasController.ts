import CanvasView from "../view/CanvasView.js"
import CanvasModel from "../model/CanvasModel.js"
import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import { preventParentClick, setOnListnerbyClass, setOnListnerbyID } from "./ElementListner.js"
export enum AddMode {
    IDLE, ADDING
}
export interface ElementPosition {
    left: number
    top: number
}

export default class CanvasController {
    state: CanvasState
    canvasView: CanvasView
    canvasModel: CanvasModel
    listPositions: ElementPosition[] = []
    listWidth: number
    addMode: AddMode
    lists: ListData[]
    floatingListElement: HTMLElement | null
    listFloatingOffset: ElementPosition = { left: 0, top: 0 }
    isListFloating: boolean = false
    floatingListIndex: number = -1

    constructor() {
        this.canvasView = new CanvasView();
        this.canvasModel = new CanvasModel();
        this.addMode = AddMode.IDLE;
        this.lists = [];
        this.floatingListElement = null
        this.initRender()
    }

    /**
     * 초기 랜더링
     */
    private initRender() {
        this.canvasView.initBoard()

        this.canvasModel.getLists().forEach(list => {
            this.addList(list)
        })
        this.setListAddMode(this.addMode)

        setOnListnerbyID("click", "board", this.handleBoardClick)
    }

    /**
     * 리스트 추가
     * @param data 적용될 데이터 
     * @returns 추가 된 리스트 Element
     */
    private addList(data: ListData): HTMLElement {
        this.lists.push(data)
        const newListElement = this.canvasView.addList(data)
        this.listWidth = newListElement.clientWidth
        const rect = newListElement.getBoundingClientRect()
        console.log(data)
        this.listPositions.push({
            left: rect.x,
            top: rect.y
        })
        this.setListListener(newListElement, data)
        return newListElement
    }

    /**
     * 리스트에 적용 될 리스너 설정
     * @param element 적용 할 List Element
     * @param data 적용 될 데이터 
     */
    private setListListener(element: HTMLElement, data: ListData) {
        const editingTarget = element.getElementsByClassName('editing-target').item(0)
        editingTarget.addEventListener('mousedown', (downEvent: MouseEvent) => {
            this.isListFloating = true
            this.floatingListIndex = data.index
            console.log("down : ", this.floatingListIndex, document.getElementsByClassName("list-wrapper").item(this.floatingListIndex))
            const rect = editingTarget.getBoundingClientRect()
            const position: ElementPosition = { left: rect.x + window.scrollX, top: rect.y + window.scrollY }

            this.canvasView.createFloatingList(data, position)
            this.canvasView.setMoveModeList(data.index, "float")
            this.listFloatingOffset = {
                left: position.left - downEvent.clientX, top: position.top - downEvent.clientY,
            }
            document.addEventListener('mousemove', this.handleListFloating)
            document.addEventListener('mouseup', this.handleListFloatingEnd)
        })
    }

    /**
     * 리스트 추가 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    private setListAddMode(mode: AddMode) {
        this.addMode = mode
        this.canvasView.setListAddMode(mode)
        switch (mode) {
            case AddMode.IDLE:
                setOnListnerbyClass("click", "js-add-list list-wrapper mod-add is-idle", this.handleAddListIdleClick)
                break;
            case AddMode.ADDING:
                setOnListnerbyClass("click", "js-add-list list-wrapper mod-add", preventParentClick)
                setOnListnerbyClass("keypress", "list-name-input", this.handleListNameKeypress)
                setOnListnerbyClass("click", "list-add-button", this.addListByInputElement)
                setOnListnerbyClass("click", "list-add-close-button", () => {
                    this.setListAddMode(AddMode.IDLE)
                })
                break;
        }
    }

    /**
     * 리스트 교환
     * 두 리스트 컴포넌트를 서로 교환
     * @param indexLeft 교환 될 왼쪽 리스트 Index
     * @param indexRight 교환 될 오른쪽 리스트 Index
     */
    private exchangeList(indexLeft: number, indexRight: number) {
        //view 
        const ElementRight = this.canvasView.replaceList(indexLeft, indexRight)
        const ElementLeft = this.canvasView.replaceList(indexRight, indexLeft)

        //model
        const listRight = this.lists.find(list => list.index === indexLeft)
        const listLeft = this.lists.find(list => list.index === indexRight)
        const tmpIndex = listLeft.index
        listLeft.index = listRight.index
        listRight.index = tmpIndex

        //controll
        this.setListListener(ElementRight, listRight)
        this.setListListener(ElementLeft, listLeft)
    }

    /**
     * 리스트명을 작성하는 Element의 정보로 리스트를 추가
     */
    private addListByInputElement = () => {
        const inputText = (document.getElementsByClassName("list-name-input").item(0) as HTMLInputElement).value
        if (inputText === "") return

        const addListData: ListData = {
            index: this.lists.length,
            items: [],
            title: inputText
        }
        this.addList(addListData)
    }

    //#region Handler
    /**
     * Floating 리스트 종료 핸들러
     */
    private handleListFloatingEnd = () => {
        let index = this.floatingListIndex
        console.log("up : ", index)
        this.floatingListIndex = -1
        this.canvasView.clearFloatingList()
        document.removeEventListener('mousemove', this.handleListFloating)
        document.removeEventListener('mouseup', this.handleListFloatingEnd)
        this.isListFloating = false

    }

    /**
     * Floating 리스트 이동 시 핸들러
     * @param moveEvent 마우스 이벤트
     */
    private handleListFloating = (moveEvent: MouseEvent) => {
        const { isListFloating, listFloatingOffset, listPositions, listWidth } = this
        const { lists } = this

        const floatingList = document.getElementById('floating-list')

        if (!isListFloating) return
        this.isListFloating = false
        floatingList.style.left = (moveEvent.clientX + listFloatingOffset.left) + 'px'
        floatingList.style.top = (moveEvent.clientY + listFloatingOffset.top) + 'px'

        //check
        let isExchangeLeft = false
        let isExchangeRight = false
        const isLeftMost = this.floatingListIndex === 0
        const scrollX = this.canvasView.boardElement.scrollLeft
        if (!isLeftMost) {
            const leftExchangeLine = listPositions[this.floatingListIndex - 1].left + listWidth / 3 * 1  //왼쪽 리스트와 교체 기준선
            const elementLeftEdgePos = moveEvent.clientX + listFloatingOffset.left + scrollX                //요소의 왼쪽 모서리 Position + scroll 보정
            isExchangeLeft = leftExchangeLine > elementLeftEdgePos
        }

        const isRigthMost = this.floatingListIndex === listPositions.length - 1
        if (!isRigthMost) {
            const rightExchangeLine = listPositions[this.floatingListIndex + 1].left + listWidth / 3 * 2  //오른쪽 리스트와 교체 기준선
            const elementRightEdgePos = moveEvent.clientX + listWidth + listFloatingOffset.left + scrollX       //요소의 오른쪽 모서리 Position + scroll 보정
            isExchangeRight = rightExchangeLine < elementRightEdgePos
        }

        if (isExchangeLeft) {
            console.log("isExchangeLeft")
            const tmp = lists[this.floatingListIndex]
            lists[this.floatingListIndex] = lists[this.floatingListIndex - 1]
            lists[this.floatingListIndex - 1] = tmp
            this.exchangeList(this.floatingListIndex - 1, this.floatingListIndex)
            this.canvasView.setMoveModeList(this.floatingListIndex, "idle")
            this.canvasView.setMoveModeList(this.floatingListIndex - 1, "float")
            this.floatingListIndex = this.floatingListIndex - 1
        }
        else if (isExchangeRight) {
            console.log("isExchangeRight")
            const tmp = lists[this.floatingListIndex]
            lists[this.floatingListIndex] = lists[this.floatingListIndex + 1]
            lists[this.floatingListIndex + 1] = tmp
            this.exchangeList(this.floatingListIndex, this.floatingListIndex + 1)
            this.canvasView.setMoveModeList(this.floatingListIndex, "idle")
            this.canvasView.setMoveModeList(this.floatingListIndex + 1, "float")
            this.floatingListIndex = this.floatingListIndex + 1
        }
        this.isListFloating = true
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

    /**
     * Board 클릭 리스너
     * 리스트 추가 활성 -> 비활성
     */
    private handleBoardClick = (event: MouseEvent) => {
        if (this.addMode === AddMode.IDLE) return
        this.setListAddMode(AddMode.IDLE)
    }
    //#endregion
}