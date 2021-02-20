import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import { AddMode, ElementPosition } from "../controller/CanvasController.js"

export default class CanvasView {
    static UNIQUE = 0
    static boardElement: HTMLElement
    static listElements: HTMLElement[] = []

    /**
     * 보드 초기화
     * 캔버스 컴포넌트, 리스트 추가 컴포넌트
     */
    static initBoard() {
        const boardCanvas = document.getElementById("board-canvas")
        boardCanvas.innerHTML = ""
        this.boardElement = document.createElement("div")
        this.boardElement.id = "board"

        boardCanvas.appendChild(this.boardElement)
        const addListElement = this.getAddElement(AddMode.IDLE, "list")
        this.boardElement.appendChild(addListElement)
    }

    /**
     * 리스트 Element 추가
     * @param listData 리스트 데이터
     * @returns 추가 된 리스트 Element
     */
    static addList(listData: ListData): HTMLElement {
        const newChild = this.createListElement(listData)
        this.boardElement.insertBefore(newChild, this.boardElement.childNodes.item(listData.index))
        this.listElements.push(newChild)
        return newChild
    }

    static addItem(listIndex: number, data: ItemData): HTMLElement {
        let listElement: HTMLElement = document.getElementsByClassName("js-list").item(listIndex) as HTMLElement
        const wrapperElement = this.createItemElement(data)
        let itemContainer: HTMLElement = listElement.getElementsByClassName("item-container").item(this.UNIQUE) as HTMLElement
        const refChild = itemContainer.childNodes.item(data.index)
        if (refChild !== null)
            itemContainer.insertBefore(wrapperElement, itemContainer.childNodes.item(data.index))
        else
            itemContainer.appendChild(wrapperElement)
        return wrapperElement
    }

    static createItemElement(data: ItemData): HTMLElement {
        const wrapperElement = document.createElement("div")
        wrapperElement.className = "js-item item-wrapper"

        const editingTarget = document.createElement("div")
        editingTarget.className = "float-item-target"
        wrapperElement.appendChild(editingTarget)

        const titleElement = document.createElement("div")
        titleElement.className = "item-title"
        titleElement.innerHTML = data.text
        wrapperElement.appendChild(titleElement)
        return wrapperElement
    }


    static addItemAddElement(parent: HTMLElement, mode: AddMode): HTMLElement {
        let listElement: HTMLElement = this.getElementAtChild(parent, "list")
        let itemContainer: HTMLElement = this.getElementAtChild(listElement, "item-container")
        const itemAddElement = this.getAddElement(mode, "item")
        itemAddElement.className = "js-add-item add-item mod-add is-idle"
        itemContainer.appendChild(itemAddElement)
        return itemAddElement
    }

    static getElementAtChild(parent: HTMLElement, className: string): HTMLElement {
        let listElement: HTMLElement
        parent.childNodes.forEach((child: HTMLElement) => {
            if (child.className === className) {
                listElement = child
                return
            }
        })
        return listElement
    }

    static getListPosition(listIndex: number): ElementPosition | null {
        const listElement = document.getElementsByClassName("js-list").item(listIndex)
        if (listElement === null) {
            return null
        }
        const rect = listElement.getBoundingClientRect()
        return {
            left: rect.x, top: rect.y
        }
    }
    static getItemPosition(listIndex: number, itemIndex: number): ElementPosition | null {
        const itemElement = this.getItemElement(listIndex, itemIndex)
        if (itemElement === null) return null
        const rect = itemElement.getBoundingClientRect()
        return {
            left: rect.x, top: rect.y
        }
    }

    static getListRect(): DOMRect | null {
        const listElements = document.getElementsByClassName("js-list")
        if (listElements.length === 0) return null
        return listElements.item(this.UNIQUE).getBoundingClientRect()
    }

    static getItemRect(): DOMRect {
        const itemElements = document.getElementsByClassName("js-item")
        if (itemElements.length === 0) return null
        return itemElements.item(this.UNIQUE).getBoundingClientRect()
    }

    static getItemElement(listIndex: number, itemIndex: number): HTMLElement | null {
        const listElement = this.getListElement(listIndex)
        if (listElement === null) return null
        const itemElement = listElement.getElementsByClassName("js-item").item(itemIndex)
        if (itemElement === null) return null
        return itemElement as HTMLElement
    }

    static getListElement(listIndex: number): HTMLElement | null {
        const listElement = document.getElementsByClassName("js-list").item(listIndex)
        if (listElement === null) return null
        return listElement as HTMLElement
    }


    /**
     * 아이템 추가 Element의 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    static setItemAddMode(mode: AddMode, listIndex: number) {
        const listElement = document.getElementsByClassName("js-list").item(listIndex) as HTMLElement
        const addItem = listElement.getElementsByClassName("add-item").item(this.UNIQUE)
        if (addItem !== undefined) addItem.remove()
        const itemAddElement = this.addItemAddElement(listElement, mode)
        const input = itemAddElement.getElementsByTagName("input").item(this.UNIQUE)
        if (input !== null)
            input.focus()
    }


    /**
     * 리스트 추가 Element의 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    static setListAddMode(mode: AddMode) {
        document.getElementsByClassName("js-add-list list-wrapper mod-add").item(this.UNIQUE).remove()
        document.getElementById("board").appendChild(this.getAddElement(mode, "list"))
        const input = document.getElementsByClassName("list-name-input").item(this.UNIQUE) as HTMLElement
        if (input !== null)
            input.focus()
    }

    /**
     * 리스트 Element 변경
     * @param from 변경 될 리스트 Element Index
     * @param to 변경 할 리스트 Element Index
     * @returns 변경이 된 List Element
     */
    static replaceList(from: number, to: number): HTMLElement {
        const newElement = this.listElements[from].cloneNode(true)
        const oldElement = this.boardElement.childNodes[to]
        this.boardElement.replaceChild(newElement, oldElement)
        this.listElements[from] = oldElement as HTMLElement
        return <HTMLScriptElement>newElement
    }

    static replaceItem(listIndex: number, from: number, to: number): HTMLElement {
        const listElement = document.getElementsByClassName("js-list").item(listIndex)
        const newElement = listElement.getElementsByClassName("js-item").item(from).cloneNode(true)
        const itemContainer = listElement.getElementsByClassName("item-container").item(this.UNIQUE)
        const oldElement = itemContainer.childNodes[to]
        itemContainer.replaceChild(newElement, oldElement)
        return <HTMLScriptElement>newElement
    }
    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 생성
     * @param listData 표현될 데이터
     * @param position 랜더링 될 위치
     * @returns 생성된 리스트
     */
    static createFloatingList(listData: ListData, position: ElementPosition): HTMLElement {
        const floatingList = this.createListElement(listData) as HTMLElement
        floatingList.className = "list-wrapper floating"
        floatingList.id = "floating-list"
        floatingList.style.left = position.left + "px"
        floatingList.style.top = position.top + "px"
        document.getElementsByTagName("body").item(this.UNIQUE).appendChild(floatingList)

        const itemContainer = floatingList.getElementsByClassName("item-container").item(this.UNIQUE)
        listData.items.forEach(item => {
            const wrapperElement = this.createItemElement(item)
            itemContainer.appendChild(wrapperElement)
        })
        return floatingList
    }

    static createFloatingItem(itemData: ItemData, position: ElementPosition): HTMLElement {
        const bodyElement = document.getElementsByTagName("body").item(this.UNIQUE)
        const floatingItem = this.createItemElement(itemData) as HTMLElement
        floatingItem.className = "js-item item-wrapper floating"
        floatingItem.id = "floating-item"
        floatingItem.style.left = position.left + "px"
        floatingItem.style.top = position.top + "px"
        bodyElement.appendChild(floatingItem)
        return floatingItem
    }

    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 제거
     */
    static clearFloatingList() {
        const floatList = document.getElementById("mod-list-float")
        floatList.id = undefined
        const floatingList = document.getElementById("floating-list")
        if (floatingList === null) return
        floatingList.remove()
    }

    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 제거
     */
    static clearFloatingItem() {
        const floatItem = document.getElementById("mod-item-float")
        floatItem.id = undefined
        const floatingList = document.getElementById("floating-item")
        if (floatingList === null) return
        floatingList.remove()
    }

    /**
     * 리스트 이동 모드 설정
     * 클릭&드레그 한 리스트를 이동모드로 전환
     * @param floatingIndex 이동중인 리스트 인덱스
     */
    static setFloatingModeList(floatingIndex: number, mode: "idle" | "float") {
        if (floatingIndex === -1) return
        let edittingList: Element
        switch (mode) {
            case "idle":
                edittingList = document.getElementById("mod-list-float")
                edittingList.id = undefined
                break;
            case "float":
                edittingList = document.getElementsByClassName("js-list list-wrapper").item(floatingIndex)
                edittingList.id = "mod-list-float"
                break;
        }
    }

    static setFloatingModeItem(listIndex: number, itemIndex, mode: "idle" | "float") {
        if (listIndex === -1 || itemIndex === -1) return
        let edittingItem: Element
        switch (mode) {
            case "idle":
                edittingItem = document.getElementById("mod-item-float")
                edittingItem.id = undefined
                break;
            case "float":
                const edittingList = document.getElementsByClassName("js-list list-wrapper").item(listIndex)
                edittingItem = edittingList.getElementsByClassName("js-item item-wrapper").item(itemIndex)
                edittingItem.id = "mod-item-float"
                break;
        }
    }

    //#region get element
    /**
     * 리스트 추가 요소
     * @param mode idle : 추가 대기, adding : 추가 중
     */
    private static getAddElement(mode: AddMode, type: "list" | "item"): HTMLDivElement {
        const wrapperElement = document.createElement("div")
        const wrapperClassName = type === "list" ? "js-add-list" : "js-add-item"
        switch (mode) {
            case AddMode.IDLE:
                wrapperElement.className = `list-wrapper mod-add is-idle ${wrapperClassName}`

                const form = document.createElement("form")
                wrapperElement.appendChild(form)

                const openAddElement = document.createElement("a")
                openAddElement.className = "open-add"
                form.appendChild(openAddElement)

                const placeHolder = document.createElement("span")
                placeHolder.className = "placeholder"
                openAddElement.appendChild(placeHolder)

                const iconAdd = document.createElement("i")
                iconAdd.className = "icon-add fas fa-plus"
                placeHolder.appendChild(iconAdd)

                const placeHoderText = document.createElement("span")
                placeHoderText.innerHTML = "Add another "
                placeHoderText.innerHTML += type === "list" ? "list" : "item"
                placeHolder.appendChild(placeHoderText)
                break;

            case AddMode.ADDING:
                wrapperElement.className = `js-add-list list-wrapper mod-add ${wrapperClassName}`

                const listNameInput = document.createElement("input")
                listNameInput.className = type === "list" ? "list-name-input" : "item-name-input"
                listNameInput.placeholder = type === "list" ? "Enter list title..." : "Enter a title for this card..."
                listNameInput.type = "text"
                listNameInput.name = "name"
                listNameInput.autocomplete = "off"
                listNameInput.dir = "auto"
                listNameInput.maxLength = 512;
                listNameInput.autofocus = true
                wrapperElement.appendChild(listNameInput)

                const listAddControls = document.createElement("div")
                listAddControls.className = type === "list" ? "list-add-controls" : "item-add-controls"
                wrapperElement.appendChild(listAddControls)

                const addButton = document.createElement("input")
                addButton.className = "add-button"
                addButton.type = "submit"
                addButton.value = type === "list" ? "Add List" : "Add Card"
                listAddControls.appendChild(addButton)

                const closeButton = document.createElement("a")
                closeButton.className = "add-close-button fas fa-times"
                listAddControls.appendChild(closeButton)
                break;
        }
        return wrapperElement
    }

    /**
     * 리스트 요소
     * @param listData 리스트 데이터
     */
    private static createListElement(listData: ListData): HTMLDivElement {
        const wrapperElement = document.createElement("div")
        wrapperElement.className = "js-list list-wrapper"

        const listElement = document.createElement("div")
        listElement.className = "list"
        wrapperElement.appendChild(listElement)

        const listHeader = document.createElement("div")
        listHeader.className = "list-header"
        listElement.appendChild(listHeader)

        const editingTarget = document.createElement("div")
        editingTarget.className = "float-list-target"
        listHeader.appendChild(editingTarget)

        const titleElement = document.createElement("div")
        titleElement.className = "list-title"
        titleElement.innerHTML = listData.title
        listHeader.appendChild(titleElement)

        const itemContainer = document.createElement("div")
        itemContainer.className = "item-container"
        listElement.appendChild(itemContainer)

        return wrapperElement
    }
    //#endregion
}