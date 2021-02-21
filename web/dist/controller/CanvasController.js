var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import CardModel from "../model/CardModel.js";
import ListModel from "../model/ListModel.js";
import { handleError } from "../model/Connect.js";
import CanvasView from "../view/CanvasView.js";
import { preventParentClick, setOnListnerbyClass } from "./ElementListner.js";
import List from "./List.js";
export var AddMode;
(function (AddMode) {
    AddMode[AddMode["IDLE"] = 0] = "IDLE";
    AddMode[AddMode["ADDING"] = 1] = "ADDING";
})(AddMode || (AddMode = {}));
export default class CanvasController {
    constructor() {
        this.addMode = AddMode.IDLE;
        this.isListFloating = false;
        this.isCardFloating = false;
        this.floatingListIndex = -1;
        this.floatingCardIndex = -1;
        this.listFloatingOffset = { left: 0, top: 0 };
        this.cardFloatingOffset = { left: 0, top: 0 };
        this.lists = [];
        this.arrListData = [];
        this.arrCardData = [];
        this.addCardListIndex = -1;
        this.scrollX = 0;
        //#region Handler
        /**
         * Floating 리스트 종료 핸들러
         */
        this.handleListFloatingEnd = () => __awaiter(this, void 0, void 0, function* () {
            this.floatingListIndex = -1;
            CanvasView.clearFloatingList();
            document.removeEventListener('mousemove', this.handleListFloating);
            document.removeEventListener('mouseup', this.handleListFloatingEnd);
            this.isListFloating = false;
            yield ListModel.setLists(this.arrListData).catch((reason) => { handleError(reason); });
            yield CardModel.setCards(this.arrCardData).catch((reason) => { handleError(reason); });
            this.loadFromServer();
        });
        /**
         * Floating 카드 종료 핸들러
         */
        this.handleCardFloatingEnd = () => __awaiter(this, void 0, void 0, function* () {
            this.floatingCardIndex = -1;
            this.floatingListIndex = -1;
            CanvasView.clearFloatingCard();
            document.removeEventListener('mousemove', this.handleCardFloating);
            document.removeEventListener('mouseup', this.handleCardFloatingEnd);
            this.isCardFloating = false;
            yield ListModel.setLists(this.arrListData).catch((reason) => { handleError(reason); });
            yield CardModel.setCards(this.arrCardData).catch((reason) => { handleError(reason); });
            this.loadFromServer();
        });
        /**
         * Floating 리스트 이동 시 핸들러
         * @param moveEvent 마우스 이벤트
         */
        this.handleCardFloating = (moveEvent) => __awaiter(this, void 0, void 0, function* () {
            const { isCardFloating, cardFloatingOffset } = this;
            if (!isCardFloating)
                return;
            if (this.floatingCardIndex === -1)
                return;
            const floatingCard = document.getElementById('floating-card');
            floatingCard.style.left = (moveEvent.clientX + cardFloatingOffset.left) + 'px';
            floatingCard.style.top = (moveEvent.clientY + cardFloatingOffset.top) + 'px';
            const cardRect = CanvasView.getCardRect();
            let isExchangeLeft = this.isExchangeLine("left", moveEvent);
            let isExchangeRight = this.isExchangeLine("right", moveEvent);
            if (isExchangeLeft || isExchangeRight) {
                const targetCard = this.arrListData[this.floatingListIndex].cards[this.floatingCardIndex];
                this.floatingListIndex += isExchangeLeft ? -1 : 1;
                const nextList = this.arrListData.find(list => list.index === this.floatingListIndex);
                this.floatingCardIndex = nextList.cards.length === 0 ? 0 : this.floatingCardIndex;
                const lastCardIndex = nextList.cards.length;
                let index = this.floatingCardIndex < lastCardIndex ? this.floatingCardIndex : lastCardIndex;
                this.floatingCardIndex = index;
                this.setCardData({
                    seq: targetCard.seq, listSeq: nextList.seq, index, text: targetCard.text
                });
                this.refresh();
                return;
            }
            //check top bottom
            let aboveCardPosition = CanvasView.getCardPosition(this.floatingListIndex, this.floatingCardIndex - 1);
            let belowCardPosition = CanvasView.getCardPosition(this.floatingListIndex, this.floatingCardIndex + 1);
            let isExchangeTop = aboveCardPosition !== null && aboveCardPosition.top + cardRect.height / 2 > moveEvent.clientY;
            let isExchangeBottom = belowCardPosition !== null && belowCardPosition.top - cardRect.height / 2 < moveEvent.clientY;
            if (isExchangeTop || isExchangeBottom) {
                const listSeq = this.arrListData.find(list => list.index === this.floatingListIndex).seq;
                const listInCards = this.arrCardData.filter(card => card.listSeq === listSeq);
                const movingCard = listInCards.find(card => card.index === this.floatingCardIndex);
                this.moveCard(Object.assign({}, movingCard), isExchangeTop ? "top" : "bottom");
            }
        });
        /**
         * Floating 리스트 이동 시 핸들러
         * @param moveEvent 마우스 이벤트
         */
        this.handleListFloating = (moveEvent) => {
            const { isListFloating, listFloatingOffset } = this;
            const floatingList = document.getElementById('floating-list');
            if (!isListFloating)
                return;
            this.isListFloating = false;
            floatingList.style.left = (moveEvent.clientX + listFloatingOffset.left) + 'px';
            floatingList.style.top = (moveEvent.clientY + listFloatingOffset.top) + 'px';
            //check
            let isExchangeLeft = this.isExchangeLine("left", moveEvent);
            let isExchangeRight = this.isExchangeLine("right", moveEvent);
            if (isExchangeLeft || isExchangeRight) {
                this.moveList(Object.assign({}, this.arrListData[this.floatingListIndex]), isExchangeLeft ? "left" : "right");
                CanvasView.setFloatingModeList(this.floatingListIndex, "idle");
                CanvasView.setFloatingModeList(this.floatingListIndex + (isExchangeLeft ? -1 : 1), "float");
                this.floatingListIndex = this.floatingListIndex + (isExchangeLeft ? -1 : 1);
            }
            this.isListFloating = true;
        };
        /**
         * Board 클릭 리스너
         * 리스트 추가 활성 -> 비활성
         */
        this.handleBoardClick = () => {
            document.getElementById("board").addEventListener("click", () => {
                this.lists.forEach(listCtrl => {
                    if (listCtrl.addMode === AddMode.IDLE)
                        return;
                    listCtrl.setCardAddMode(AddMode.IDLE);
                });
                if (this.addMode === AddMode.IDLE)
                    return;
                this.setListAddMode(AddMode.IDLE);
                this.addCardListIndex = -1;
            });
        };
        /**
         * 리스트 이름 input text 키 리스너
         */
        this.handleListNameKeypress = (event) => {
            if (event.key !== "Enter")
                return;
            this.addListByInputElement();
            this.refresh();
        };
        /**
         * Idle 상태의 리스트 추가 컴포넌트 클릭리스너
         * 리스트 추가 상태로 활성
         */
        this.handleAddListIdleClick = (event) => {
            preventParentClick(event);
            this.setListAddMode(AddMode.ADDING);
        };
        /**
         * 리스트 또는 카드 컴포넌트가 옆 리스트 컴포넌트로 교체 할 수 있는지
         * @param dir 판별 할 옆 라인의 방향
         * @param moveEvent 마우스 이벤트
         */
        this.isExchangeLine = (dir, moveEvent) => {
            const { listFloatingOffset } = this;
            const listRect = CanvasView.getListRect();
            const targetIndex = dir === "left" ? -1 : 1;
            const listPosition = CanvasView.getListPosition(this.floatingListIndex + targetIndex);
            this.scrollX = CanvasView.boardElement.scrollLeft;
            if (listPosition === null)
                return false;
            const exchangeOffset = listRect.width / 3 * (dir === "left" ? 1 : 2);
            const exchangeLine = listPosition.left + exchangeOffset + this.scrollX;
            const elementLeftEdgePos = moveEvent.clientX + listFloatingOffset.left + this.scrollX + (dir === "right" ? listRect.width : 0); //요소의 모서리 Position + scroll 보정
            return dir === "left" ? exchangeLine > elementLeftEdgePos : exchangeLine < elementLeftEdgePos;
        };
        this.loadFromServer();
    }
    /**
     * 서버로부터 데이터를 로드 후 랜더링.
     */
    loadFromServer() {
        ListModel.getLists().then(lists => {
            this.arrListData = lists;
            this.render(lists);
        }).catch(reason => {
            handleError(reason);
        });
        CardModel.getCards().then(cards => {
            this.arrCardData = cards;
        }).catch(reason => {
            handleError(reason);
        });
    }
    /**
     * 클라이언트 데이터를 가공 후 랜더링.
     */
    refresh() {
        this.arrListData.forEach(list => {
            const cards = this.arrCardData.filter(card => card.listSeq === list.seq);
            cards.sort((a, b) => a.index - b.index);
            list.cards = cards;
        });
        this.render(this.arrListData);
    }
    /**
     * 데이터 랜더링
     * @param arrListData 리스트 및 이하 카드 데이터 배열
     */
    render(arrListData) {
        CanvasView.initBoard();
        CanvasView.boardElement.addEventListener('scroll', (e) => {
            this.scrollX = CanvasView.boardElement.scrollLeft;
        });
        this.lists = [];
        arrListData.sort((a, b) => a.index - b.index).forEach(list => {
            this.addList(list);
        });
        const floatTargetList = CanvasView.getListElement(this.floatingCardIndex);
        const isListFloating = floatTargetList !== null && this.floatingCardIndex === -1;
        if (isListFloating)
            floatTargetList.id = "mod-list-float";
        const floatTargetCard = CanvasView.getCardElement(this.floatingListIndex, this.floatingCardIndex);
        if (floatTargetCard !== null)
            floatTargetCard.id = "mod-card-float";
        this.setListAddMode(this.addMode);
        if (this.addCardListIndex > -1)
            this.lists[this.addCardListIndex].setCardAddMode(AddMode.ADDING);
        this.handleBoardClick();
        CanvasView.boardElement.scrollLeft = this.scrollX;
    }
    /**
     * 리스트 추가
     * @param data 적용될 데이터
     * @returns 추가 된 리스트 Element
     */
    addList(data) {
        const list = new List(data, this);
        this.lists.push(list);
        const newListElement = list.getListElement();
        const isListFloating = this.floatingCardIndex === -1 && this.floatingListIndex === data.index;
        newListElement.id = isListFloating ? "mod-list-float" : undefined;
        this.setListListener(data);
        return newListElement;
    }
    /**
     * 리스트에 적용 될 리스너 설정
     * @param element 적용 할 List Element
     * @param data 적용 될 데이터
     */
    setListListener(data) {
        const listElement = CanvasView.getListElement(data.index);
        const editingTarget = listElement.getElementsByClassName('float-list-target').item(0);
        editingTarget.addEventListener('mousedown', (downEvent) => {
            this.isListFloating = true;
            this.floatingListIndex = data.index;
            const rect = editingTarget.getBoundingClientRect();
            const position = { left: rect.x + window.scrollX, top: rect.y + window.scrollY };
            CanvasView.createFloatingList(data, position);
            CanvasView.setFloatingModeList(data.index, "float");
            this.listFloatingOffset = {
                left: position.left - downEvent.clientX, top: position.top - downEvent.clientY,
            };
            document.addEventListener('mousemove', this.handleListFloating);
            document.addEventListener('mouseup', this.handleListFloatingEnd);
        });
    }
    /**
     * 카드에 적용 될 리스너 설정
     * @param element 적용 할 Item Element
     * @param data 적용 될 데이터
     * @param listIndex 부모 리스트 인덱스
     */
    setCardListener(element, data, listIndex) {
        const editingTarget = element.getElementsByClassName('float-card-target').item(0);
        editingTarget.addEventListener('mousedown', (downEvent) => {
            this.isCardFloating = true;
            this.floatingListIndex = listIndex;
            this.floatingCardIndex = data.index;
            const cardPosition = CanvasView.getCardPosition(listIndex, data.index);
            const listPosition = CanvasView.getListPosition(listIndex);
            CanvasView.createFloatingCard(data, {
                left: cardPosition.left + window.scrollX,
                top: cardPosition.top + window.scrollY
            });
            CanvasView.setFloatingModeCard(listIndex, data.index, "float");
            this.cardFloatingOffset = {
                left: cardPosition.left - downEvent.clientX, top: cardPosition.top - downEvent.clientY,
            };
            this.listFloatingOffset = {
                left: listPosition.left - downEvent.clientX, top: listPosition.top - downEvent.clientY,
            };
            document.addEventListener('mousemove', this.handleCardFloating);
            document.addEventListener('mouseup', this.handleCardFloatingEnd);
        });
    }
    //#endregion
    /**
     * Input Element 정보로 리스트 추가.
     */
    addListByInputElement() {
        const inputElement = document.getElementsByClassName("list-name-input").item(0);
        const inputText = inputElement.value;
        inputElement.value = "";
        if (inputText === "")
            return;
        ListModel.addList(inputText, [], this.lists.length).then(response => {
            this.addList(response);
            this.loadFromServer();
            this.scrollX += CanvasView.getListRect().width;
        }).catch(reason => {
            handleError(reason);
        });
    }
    /**
     * 리스트 추가 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    setListAddMode(mode) {
        this.addMode = mode;
        CanvasView.setListAddMode(mode);
        switch (mode) {
            case AddMode.IDLE:
                setOnListnerbyClass("click", "js-add-list list-wrapper mod-add is-idle", this.handleAddListIdleClick);
                break;
            case AddMode.ADDING:
                setOnListnerbyClass("click", "js-add-list list-wrapper mod-add", preventParentClick);
                setOnListnerbyClass("keypress", "list-name-input", this.handleListNameKeypress);
                setOnListnerbyClass("click", "add-button", this.addListByInputElement);
                setOnListnerbyClass("click", "add-close-button", () => {
                    this.setListAddMode(AddMode.IDLE);
                });
                break;
        }
    }
    /**
     * 리스트 이동
     * @param list 교환 주체가 되는 리스트
     * @param dir 리스트가 옮겨 갈 방향
     */
    moveList(list, dir) {
        list.index = dir === "left" ? list.index - 1 : list.index + 1;
        this.setList(list);
        this.refresh();
    }
    /**
     * 카드 이동
     * @param card 교환 주체가 되는 카드
     * @param dir 카드가 옮겨 갈 방향
     */
    moveCard(card, dir) {
        card.index = dir === "top" ? card.index - 1 : card.index + 1;
        this.floatingCardIndex = card.index;
        this.setCardData(card);
        this.refresh();
    }
    /**
     * 카드 데이터 수정
     * 수정 대상이 되는 데이터 및 그에 따라 연관된 카드 데이터들을 수정.
     * @param editData 수정 할 데이터
     */
    setCardData(editData) {
        let oldData = this.arrCardData.filter(card => card.seq === editData.seq)[0];
        if (!oldData)
            return;
        if (oldData.listSeq !== editData.listSeq) {
            const lastListInCards = this.arrCardData.filter(list => list.listSeq === oldData.listSeq);
            lastListInCards.forEach((card) => {
                if (card.index > oldData.index)
                    card.index -= 1;
            });
            const nextListInCards = this.arrCardData.filter(list => list.listSeq === editData.listSeq);
            nextListInCards.forEach((card) => {
                if (card.index >= editData.index)
                    card.index += 1;
            });
            oldData.listSeq = editData.listSeq;
        }
        if (oldData.index !== editData.index) {
            const replaceTargetCard = this.arrCardData.find(card => card.index === editData.index && card.listSeq === editData.listSeq);
            if (replaceTargetCard !== undefined)
                replaceTargetCard.index = oldData.index;
        }
        const keys = Object.keys(editData);
        keys.forEach(key => {
            oldData[key] = editData[key];
        });
    }
    /**
     * 리스트 데이터 수정
     * 수정 대상이 되는 데이터 및 그에 따라 연관된 리스트 데이터들을 수정.
     * @param editData 수정 할 데이터
     */
    setList(editData) {
        let oldData = this.arrListData.filter(list => list.seq === editData.seq)[0];
        if (!oldData)
            return;
        if (oldData.index !== editData.index) {
            const replaceTargetList = this.arrListData.find(list => list.index === editData.index);
            replaceTargetList.index = oldData.index;
        }
        const keys = Object.keys(editData);
        keys.forEach(key => {
            oldData[key] = editData[key];
        });
    }
}
//# sourceMappingURL=CanvasController.js.map