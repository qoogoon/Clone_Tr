import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import { AddMode, ElementPosition } from "../controller/CanvasController.js"

export default class CanvasView {
    ONLY_ONE_INDEX = 0
    boardElement: HTMLElement
    listElements: HTMLElement[] = []
    floatingList: HTMLElement

    /**
     * 보드 초기화
     * 캔버스 컴포넌트, 리스트 추가 컴포넌트
     */
    initBoard() {
        const boardCanvas = document.getElementById("board-canvas")
        boardCanvas.innerHTML = ""
        this.boardElement = document.createElement("div")
        this.boardElement.id = "board"
        boardCanvas.appendChild(this.boardElement)
        this.boardElement.appendChild(this.getListAddElement(AddMode.IDLE))
    }

    /**
     * 리스트 Element 추가
     * @param listData 리스트 데이터
     * @returns 추가 된 리스트 Element
     */
    addList(listData: ListData): HTMLElement {
        const newChild = this.getListElement(listData)
        this.boardElement.insertBefore(newChild, this.boardElement.childNodes.item(listData.index))
        this.listElements.push(newChild)
        return newChild
    }

    /**
     * 리스트 추가 Element의 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    setListAddMode(mode: AddMode) {
        document.getElementsByClassName("js-add-list list-wrapper mod-add").item(0).remove()
        document.getElementById("board").appendChild(this.getListAddElement(mode))
    }

    /**
     * 리스트 Element 변경
     * @param from 변경 될 리스트 Element Index
     * @param to 변경 할 리스트 Element Index
     * @returns 변경이 된 List Element
     */
    replaceList(from: number, to: number): HTMLElement {
        const newElement = this.listElements[from].cloneNode(true)
        const oldElement = this.boardElement.childNodes[to]
        this.boardElement.replaceChild(newElement, oldElement)
        this.listElements[from] = oldElement as HTMLElement
        return <HTMLScriptElement>newElement
    }

    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 생성
     * @param listData 표현될 데이터
     * @param position 랜더링 될 위치
     * @returns 생성된 리스트
     */
    createFloatingList(listData: ListData, position: ElementPosition): HTMLElement {
        const floatingList = this.getListElement(listData) as HTMLElement
        floatingList.className = "list-wrapper floating"
        floatingList.id = "floating-list"
        floatingList.style.left = position.left + "px"
        floatingList.style.top = position.top + "px"
        document.getElementsByTagName("body").item(0).appendChild(floatingList)
        this.floatingList = floatingList
        return floatingList
    }

    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 제거
     */
    clearFloatingList() {
        const edittingList = document.getElementById("mod-float")
        edittingList.id = ""
        console.log("clear :", document.getElementById("mod-float"))

        const floatingList = document.getElementById("floating-list")
        if (floatingList === null) return
        floatingList.remove()
    }

    /**
     * 리스트 이동 모드 설정
     * 클릭&드레그 한 리스트를 이동모드로 전환
     * @param floatingIndex 이동중인 리스트 인덱스
     */
    setMoveModeList(floatingIndex: number, mode: "idle" | "float") {
        console.log("set", mode, floatingIndex, document.getElementsByClassName("list-wrapper").item(floatingIndex))
        if (floatingIndex === -1) return
        let edittingList: Element
        try {
            switch (mode) {
                case "idle":
                    edittingList = document.getElementById("mod-float")
                    edittingList.id = undefined
                    console.log("idle : ", floatingIndex, edittingList.id)
                    break;
                case "float":
                    edittingList = document.getElementsByClassName("js-list list-wrapper").item(floatingIndex)
                    edittingList.id = "mod-float"
                    console.log("float : ", floatingIndex, edittingList.id)
                    break;
            }
        } catch (e) {
            console.log(e)
        }
    }

    //#region get element
    /**
     * 리스트 추가 요소
     * @param mode idle : 추가 대기, adding : 추가 중
     */
    private getListAddElement(mode: AddMode): HTMLDivElement {
        const wrapperElement = document.createElement("div")
        switch (mode) {
            case AddMode.IDLE:
                wrapperElement.className = "js-add-list list-wrapper mod-add is-idle"
                const form = document.createElement("form")
                wrapperElement.appendChild(form)

                const openAddListElement = document.createElement("a")
                openAddListElement.className = "open-add-list"
                form.appendChild(openAddListElement)

                const placeHolder = document.createElement("span")
                placeHolder.className = "placeholder"
                openAddListElement.appendChild(placeHolder)

                const iconAdd = document.createElement("i")
                iconAdd.className = "icon-add fas fa-plus"
                placeHolder.appendChild(iconAdd)

                const placeHoderText = document.createElement("span")
                placeHoderText.innerHTML = "Add another list"
                placeHolder.appendChild(placeHoderText)
                break;

            case AddMode.ADDING:
                wrapperElement.className = "js-add-list list-wrapper mod-add"

                const listNameInput = document.createElement("input")
                listNameInput.className = "list-name-input"
                listNameInput.placeholder = "Enter list title..."
                listNameInput.type = "text"
                listNameInput.name = "name"
                listNameInput.autocomplete = "off"
                listNameInput.dir = "auto"
                listNameInput.maxLength = 512;
                listNameInput.autofocus = true
                wrapperElement.appendChild(listNameInput)

                const listAddControls = document.createElement("div")
                listAddControls.className = "list-add-controls"
                wrapperElement.appendChild(listAddControls)

                const addButton = document.createElement("input")
                addButton.className = "list-add-button"
                addButton.type = "submit"
                addButton.value = "Add List"
                listAddControls.appendChild(addButton)

                const closeButton = document.createElement("a")
                closeButton.className = "list-add-close-button fas fa-times"
                listAddControls.appendChild(closeButton)
                break;
        }
        return wrapperElement
    }

    /**
     * 리스트 요소
     * @param listData 리스트 데이터
     */
    private getListElement(listData: ListData): HTMLDivElement {
        const wrapperElement = document.createElement("div")
        wrapperElement.className = "js-list list-wrapper"

        const listElement = document.createElement("div")
        listElement.className = "list"
        wrapperElement.appendChild(listElement)

        const listHeader = document.createElement("div")
        listHeader.className = "list-header"
        listElement.appendChild(listHeader)

        const editingTarget = document.createElement("div")
        editingTarget.className = "editing-target"
        listHeader.appendChild(editingTarget)

        const titleElement = document.createElement("div")
        titleElement.className = "list-title"
        titleElement.innerHTML = listData.title
        listHeader.appendChild(titleElement)
        return wrapperElement
    }

    //#endregion
}