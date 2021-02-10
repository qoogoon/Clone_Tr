import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import { AddMode, CanvasState } from "../controller/CanvasController.js"

export default class CanvasView {
    ONLY_ONE_INDEX = 0

    render(data: CanvasState) {
        const boardElement = document.createElement("div")
        boardElement.id = "board"
        data.lists.forEach(list => {
            boardElement.appendChild(this.getListElement(list))
        })
        boardElement.appendChild(this.getListAddElement(data.addMode))
        document.getElementById("board-canvas").appendChild(boardElement)
    }

    clear() {
        document.getElementById("board-canvas").innerHTML = ''
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
                wrapperElement.className = "add-list list-wrapper is-idle"


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
                wrapperElement.className = "add-list list-wrapper"

                const listNameInput = document.createElement("input")
                listNameInput.className = "list-name-input"
                listNameInput.placeholder = "Enter list title..."
                listNameInput.type = "text"
                listNameInput.name = "name"
                listNameInput.autocomplete = "off"
                listNameInput.dir = "auto"
                listNameInput.maxLength = 512
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
        wrapperElement.className = "list-wrapper"

        const listElement = document.createElement("div")
        listElement.className = "list"
        wrapperElement.appendChild(listElement)

        const titleElement = document.createElement("div")
        titleElement.className = "list-title"
        titleElement.innerHTML = listData.title

        listElement.appendChild(titleElement)
        return wrapperElement
    }
    //#endregion
}