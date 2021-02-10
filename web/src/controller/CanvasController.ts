import CanvasView from "../view/CanvasView.js"
import CanvasModel from "../model/CanvasModel.js"
import { ItemData, ListData } from "../data/container/DocumentContainer.js"
import { preventParentClick, setOnListnerbyClass, setOnListnerbyID } from "./ElementListner.js"
export enum AddMode {
    IDLE, ADDING
}
export interface CanvasState {
    addMode: AddMode
    lists: ListData[]
}
export default class CanvasController {
    state: CanvasState
    canvasView: CanvasView
    canvasModel: CanvasModel
    constructor() {
        this.canvasView = new CanvasView();
        this.canvasModel = new CanvasModel();
        this.state = {
            addMode: AddMode.IDLE,
            lists: this.canvasModel.getLists()
        }
        this.createUI()
    }

    /**
     * 데이터 상태 설정
     * 변경 된 데이터에 따라 Model, View 갱신
     * @param state 캔버스 상태 데이터
     */
    setState(state: CanvasState) {
        this.state = state
        this.refreshUI()
    }

    /**
     * UI 생성
     * HTML Render 및 clickListner 정의
     */
    private createUI() {
        this.canvasView.render(this.state)

        switch (this.state.addMode) {
            case AddMode.IDLE:
                this.handleAddListIdleClick()
                break;
            case AddMode.ADDING:
                setOnListnerbyClass("click", "add-list list-wrapper", preventParentClick)
                break;
        }
        this.handleBoardClick()
        this.handleListNameKeypress()
    }

    /**
     * UI 다시 그리기
     */
    private refreshUI() {
        this.canvasView.clear()
        this.createUI()
    }

    /**
     * 리스트 이름 input text 키 리스너
     * 엔터 리스닝 후 리스트 추가 처리
     */
    private handleListNameKeypress() {
        setOnListnerbyClass("keypress", "list-name-input", (event: KeyboardEvent) => {
            if (event.key !== "Enter") return
            const inputText = (document.getElementsByClassName("list-name-input").item(0) as HTMLInputElement).value
            alert(inputText)
        })
    }

    /**
     * Idle 상태의 리스트 추가 컴포넌트 클릭리스너
     * 리스트 추가 상태로 활성
     */
    private handleAddListIdleClick() {
        setOnListnerbyClass("click", "add-list list-wrapper is-idle", (event: MouseEvent) => {
            preventParentClick(event);
            this.setState({ ...this.state, addMode: AddMode.ADDING })
        })
    }

    /**
     * Board 클릭 리스너
     * 리스트 추가 활성 -> 비활성
     */
    private handleBoardClick() {
        setOnListnerbyID("click", "board", (event: MouseEvent) => {
            if (this.state.addMode === AddMode.IDLE) return
            this.setState({ ...this.state, addMode: AddMode.IDLE })
        })
    }
}