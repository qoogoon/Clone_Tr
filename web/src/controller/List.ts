import CanvasView from "../view/CanvasView.js"
import CardModel from "../model/CardModel.js"
import { handleError } from "../model/Connect.js"
import { CardData, ListData } from "../data/container/DocumentContainer.js"
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
    cardPositions: ElementPosition[] = []
    addMode: AddMode
    cards: CardData[] = []
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
        this.listData.cards.forEach(card => {
            this.addCard(this.listData.index, card)
        })
        CanvasView.addCardAddElement(newListElement, this.addMode)
        this.setCardAddMode(this.addMode)
    }

    /**
     * 리스트 추가
     * @param data 적용될 데이터 
     * @returns 추가 된 리스트 Element
     */
    private addCard(listIndex: number, data: CardData): HTMLElement {
        this.cards.push(data)
        const newCardElement = CanvasView.addCard(listIndex, data)
        const rect = newCardElement.getBoundingClientRect()
        this.cardPositions.push({
            left: rect.x,
            top: rect.y
        })
        const isExistIndex = this.listData.cards.find(card => card.index === data.index) !== undefined
        if (!isExistIndex)
            this.listData.cards.push(data)
        this.canvasCtrl.setCardListener(newCardElement, data, this.listData.index)
        return newCardElement
    }

    /**
     * 리스트 추가 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    setCardAddMode(mode: AddMode) {
        this.addMode = mode
        CanvasView.setCardAddMode(mode, this.listData.index)
        switch (mode) {
            case AddMode.IDLE:
                const addCard = this.listElement.getElementsByClassName("js-add-card add-card mod-add is-idle").item(0)
                addCard.addEventListener("click", this.handleAddCardIdleClick)
                break;
            case AddMode.ADDING:
                setOnListnerbyClass("click", "js-add-card add-card mod-add", preventParentClick)
                setOnListnerbyClass("keypress", "card-name-input", this.handleListNameKeypress)
                setOnListnerbyClass("click", "add-button", this.addCardByInputElement)
                setOnListnerbyClass("click", "add-close-button", () => {
                    this.setCardAddMode(AddMode.IDLE)
                })
                this.canvasCtrl.addCardListIndex = this.listData.index
                break;
        }
    }

    /**
     * 리스트 이름 input text 키 리스너
     */
    private handleListNameKeypress = (event: KeyboardEvent) => {
        if (event.key !== "Enter") return
        this.addCardByInputElement()
    }

    /**
     * 리스트명을 작성하는 Element의 정보로 리스트를 추가
     */
    private addCardByInputElement = () => {
        const addElement = document.getElementsByClassName("js-add-card").item(this.listData.index) as HTMLInputElement
        const inputElement = addElement.getElementsByClassName("card-name-input").item(0) as HTMLInputElement

        if (inputElement === null) return

        const inputText = inputElement.value
        if (inputText === "") return

        inputElement.value = ""
        CardModel.addCard(inputText, this.cards.length, this.listData.seq).then(response => {
            this.addCard(this.listData.index, response)
            this.canvasCtrl.loadFromServer()
        }).catch((reason) => { handleError(reason) })
    }

    /**
     * Idle 상태의 카드 추가 컴포넌트 클릭리스너
     * 리스트 추가 상태로 활성
     */
    private handleAddCardIdleClick = (event: MouseEvent) => {
        preventParentClick(event);
        this.setCardAddMode(AddMode.ADDING)
    }
}