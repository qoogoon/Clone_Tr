import { AddMode } from "../controller/CanvasController.js";
export default class CanvasView {
    /**
     * 보드 초기화
     * 캔버스 컴포넌트, 리스트 추가 컴포넌트
     */
    static initBoard() {
        const boardCanvas = document.getElementById("board-canvas");
        boardCanvas.innerHTML = "";
        this.boardElement = document.createElement("div");
        this.boardElement.id = "board";
        boardCanvas.appendChild(this.boardElement);
        const addListElement = this.getAddElement(AddMode.IDLE, "list");
        this.boardElement.appendChild(addListElement);
    }
    /**
     * 리스트 Element를 Board에 추가
     * @param listData 리스트 데이터
     * @returns 추가 된 리스트 Element
     */
    static addList(listData) {
        const newChild = this.createListElement(listData);
        this.boardElement.insertBefore(newChild, this.boardElement.childNodes.item(listData.index));
        this.listElements.push(newChild);
        return newChild;
    }
    /**
     * 카드 Element를 Board에 추가
     * @param listIndex 부모 리스트 인덱스
     * @param data 추가 할 데이터
     */
    static addCard(listIndex, data) {
        let listElement = document.getElementsByClassName("js-list").item(listIndex);
        const wrapperElement = this.createCardElement(data);
        let cardContainer = listElement.getElementsByClassName("card-container").item(this.UNIQUE);
        const refChild = cardContainer.childNodes.item(data.index);
        if (refChild !== null)
            cardContainer.insertBefore(wrapperElement, cardContainer.childNodes.item(data.index));
        else
            cardContainer.appendChild(wrapperElement);
        return wrapperElement;
    }
    /**
     * 카드 엘레멘트 생성
     * @param data 생성 될 데이터
     */
    static createCardElement(data) {
        const wrapperElement = document.createElement("div");
        wrapperElement.className = "js-card card-wrapper";
        const editingTarget = document.createElement("div");
        editingTarget.className = "float-card-target";
        wrapperElement.appendChild(editingTarget);
        const titleElement = document.createElement("div");
        titleElement.className = "card-title";
        titleElement.innerHTML = data.text;
        wrapperElement.appendChild(titleElement);
        return wrapperElement;
    }
    /**
     * 카드를 추가하는 Element를 부모 리스트 Element에 삽입하기
     * @param parent 삽입 될 부모 리스트 Element
     * @param mode 카드 추가 모드(idle : 추가 컴포넌트 대기상태, adding : 추가 컴포넌트 활성 상태)
     */
    static addCardAddElement(parent, mode) {
        let listElement = this.getElementAtChild(parent, "list");
        let cardContainer = this.getElementAtChild(listElement, "card-container");
        const cardAddElement = this.getAddElement(mode, "card");
        cardAddElement.className = "js-add-card add-card mod-add is-idle";
        cardContainer.appendChild(cardAddElement);
        return cardAddElement;
    }
    /**
     * 대상이 되는 Element 이하의 자식 Elements 얻기
     * @param parent 자식 Element를 얻을 부모 Element
     * @param childClassName 찾을 자식 클래스 이름
     * @returns 부모 이하 특정 자식 class의 Element
     */
    static getElementAtChild(parent, childClassName) {
        let listElement;
        parent.childNodes.forEach((child) => {
            if (child.className === childClassName) {
                listElement = child;
                return;
            }
        });
        return listElement;
    }
    /**
     * 해당 리스트의 위치값 얻기
     * @param listIndex 대상 리스트 인덱스
     * @returns 위치값
     */
    static getListPosition(listIndex) {
        const listElement = document.getElementsByClassName("js-list").item(listIndex);
        if (listElement === null) {
            return null;
        }
        const rect = listElement.getBoundingClientRect();
        return {
            left: rect.x, top: rect.y
        };
    }
    /**
     * 해당 카드의 위치값 얻기
     * @param listIndex 대상 리스트 인덱스
     * @param cardIndex 대상 카드 인덱스
     * @returns 위치값
     */
    static getCardPosition(listIndex, cardIndex) {
        const cardElement = this.getCardElement(listIndex, cardIndex);
        if (cardElement === null)
            return null;
        const rect = cardElement.getBoundingClientRect();
        return {
            left: rect.x, top: rect.y
        };
    }
    /**
     * 해당 리스트의 Element모양 정보 얻기
     * @returns 모양 정보
     */
    static getListRect() {
        const listElements = document.getElementsByClassName("js-list");
        if (listElements.length === 0)
            return null;
        return listElements.item(this.UNIQUE).getBoundingClientRect();
    }
    /**
     * 해당 카드의 Element모양 정보 얻기
     * @returns 모양 정보
     */
    static getCardRect() {
        const cardElements = document.getElementsByClassName("js-card");
        if (cardElements.length === 0)
            return null;
        return cardElements.item(this.UNIQUE).getBoundingClientRect();
    }
    /**
     * 해당 카드의 Element정보 얻기
     * @param listIndex 대상 리스트 인덱스
     * @param cardIndex 대상 카드 인덱스
     * @returns Element 정보
     */
    static getCardElement(listIndex, cardIndex) {
        const listElement = this.getListElement(listIndex);
        if (listElement === null)
            return null;
        const cardElement = listElement.getElementsByClassName("js-card").item(cardIndex);
        if (cardElement === null)
            return null;
        return cardElement;
    }
    /**
     * 해당 리스트의 Element정보 얻기
     * @param listIndex 대상 리스트 인덱스
     * @returns Element 정보
     */
    static getListElement(listIndex) {
        const listElement = document.getElementsByClassName("js-list").item(listIndex);
        if (listElement === null)
            return null;
        return listElement;
    }
    /**
     * 카드 추가 Element의 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    static setCardAddMode(mode, listIndex) {
        const listElement = document.getElementsByClassName("js-list").item(listIndex);
        const addCard = listElement.getElementsByClassName("add-card").item(this.UNIQUE);
        if (addCard !== undefined)
            addCard.remove();
        const cardAddElement = this.addCardAddElement(listElement, mode);
        const input = cardAddElement.getElementsByTagName("input").item(this.UNIQUE);
        if (input !== null)
            input.focus();
    }
    /**
     * 리스트 추가 Element의 모드 설정
     * @param mode idel : 일반 상태, adding : 추가 중 상태
     */
    static setListAddMode(mode) {
        document.getElementsByClassName("js-add-list list-wrapper mod-add").item(this.UNIQUE).remove();
        document.getElementById("board").appendChild(this.getAddElement(mode, "list"));
        const input = document.getElementsByClassName("list-name-input").item(this.UNIQUE);
        if (input !== null)
            input.focus();
    }
    /**
     * 리스트 Element 변경
     * @param from 변경 될 리스트 Element Index
     * @param to 변경 할 리스트 Element Index
     * @returns 변경이 된 List Element
     */
    static replaceList(from, to) {
        const newElement = this.listElements[from].cloneNode(true);
        const oldElement = this.boardElement.childNodes[to];
        this.boardElement.replaceChild(newElement, oldElement);
        this.listElements[from] = oldElement;
        return newElement;
    }
    /**
     * 카드 Element변경
     * @param listIndex 부모 리스트 Index
     * @param from 변경 될 카드 Element Index
     * @param to 변경 할 카드 Index
     * @returns 변경 된 카드 Element
     */
    static replaceCard(listIndex, from, to) {
        const listElement = document.getElementsByClassName("js-list").item(listIndex);
        const newElement = listElement.getElementsByClassName("js-card").item(from).cloneNode(true);
        const cardContainer = listElement.getElementsByClassName("card-container").item(this.UNIQUE);
        const oldElement = cardContainer.childNodes[to];
        cardContainer.replaceChild(newElement, oldElement);
        return newElement;
    }
    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 생성
     * @param listData 표현 될 데이터
     * @param position 랜더링 될 위치
     * @returns 생성 된 리스트
     */
    static createFloatingList(listData, position) {
        const floatingList = this.createListElement(listData);
        floatingList.className = "list-wrapper floating";
        floatingList.id = "floating-list";
        floatingList.style.left = position.left + "px";
        floatingList.style.top = position.top + "px";
        document.getElementsByTagName("body").item(this.UNIQUE).appendChild(floatingList);
        const cardContainer = floatingList.getElementsByClassName("card-container").item(this.UNIQUE);
        listData.cards.forEach(card => {
            const wrapperElement = this.createCardElement(card);
            cardContainer.appendChild(wrapperElement);
        });
        return floatingList;
    }
    /**
     * 카드 순서 변경 시 마우스 Drag로 이동되는 카드 생성
     * @param cardData 표현 될 데이터
     * @param position 랜더링 될 위치
     * @returns 생성 된 카드
     */
    static createFloatingCard(cardData, position) {
        const bodyElement = document.getElementsByTagName("body").item(this.UNIQUE);
        const floatingCard = this.createCardElement(cardData);
        floatingCard.className = "js-card card-wrapper floating";
        floatingCard.id = "floating-card";
        floatingCard.style.left = position.left + "px";
        floatingCard.style.top = position.top + "px";
        bodyElement.appendChild(floatingCard);
        return floatingCard;
    }
    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 제거
     */
    static clearFloatingList() {
        const floatList = document.getElementById("mod-list-float");
        floatList.id = undefined;
        const floatingList = document.getElementById("floating-list");
        if (floatingList === null)
            return;
        floatingList.remove();
    }
    /**
     * 리스트 순서 변경 시 마우스 Drag로 이동되는 리스트 제거
     */
    static clearFloatingCard() {
        const floatCard = document.getElementById("mod-card-float");
        floatCard.id = undefined;
        const floatingList = document.getElementById("floating-card");
        if (floatingList === null)
            return;
        floatingList.remove();
    }
    /**
     * 리스트 이동 모드 설정
     * 클릭&드레그 한 리스트를 이동모드로 전환
     * @param floatingIndex 이동중인 리스트 인덱스
     */
    static setFloatingModeList(floatingIndex, mode) {
        if (floatingIndex === -1)
            return;
        let edittingList;
        switch (mode) {
            case "idle":
                edittingList = document.getElementById("mod-list-float");
                edittingList.id = undefined;
                break;
            case "float":
                edittingList = document.getElementsByClassName("js-list list-wrapper").item(floatingIndex);
                edittingList.id = "mod-list-float";
                break;
        }
    }
    /**
     * 카드 이동 모드 설정
     * 클릭&드레그 한 리스트를 이동모드로 전환
     * @param floatingIndex 이동중인 카드 인덱스
     */
    static setFloatingModeCard(listIndex, cardIndex, mode) {
        if (listIndex === -1 || cardIndex === -1)
            return;
        let edittingCard;
        switch (mode) {
            case "idle":
                edittingCard = document.getElementById("mod-card-float");
                edittingCard.id = undefined;
                break;
            case "float":
                const edittingList = document.getElementsByClassName("js-list list-wrapper").item(listIndex);
                edittingCard = edittingList.getElementsByClassName("js-card card-wrapper").item(cardIndex);
                edittingCard.id = "mod-card-float";
                break;
        }
    }
    //#region get element
    /**
     * 리스트 추가 요소
     * @param mode idle : 추가 대기, adding : 추가 중
     */
    static getAddElement(mode, type) {
        const wrapperElement = document.createElement("div");
        const wrapperClassName = type === "list" ? "js-add-list" : "js-add-card";
        switch (mode) {
            case AddMode.IDLE:
                wrapperElement.className = `list-wrapper mod-add is-idle ${wrapperClassName}`;
                const form = document.createElement("form");
                wrapperElement.appendChild(form);
                const openAddElement = document.createElement("a");
                openAddElement.className = "open-add";
                form.appendChild(openAddElement);
                const placeHolder = document.createElement("span");
                placeHolder.className = "placeholder";
                openAddElement.appendChild(placeHolder);
                const iconAdd = document.createElement("i");
                iconAdd.className = "icon-add fas fa-plus";
                placeHolder.appendChild(iconAdd);
                const placeHoderText = document.createElement("span");
                placeHoderText.innerHTML = "Add another ";
                placeHoderText.innerHTML += type === "list" ? "list" : "card";
                placeHolder.appendChild(placeHoderText);
                break;
            case AddMode.ADDING:
                wrapperElement.className = `js-add-list list-wrapper mod-add ${wrapperClassName}`;
                const listNameInput = document.createElement("input");
                listNameInput.className = type === "list" ? "list-name-input" : "card-name-input";
                listNameInput.placeholder = type === "list" ? "Enter list title..." : "Enter a title for this card...";
                listNameInput.type = "text";
                listNameInput.name = "name";
                listNameInput.autocomplete = "off";
                listNameInput.dir = "auto";
                listNameInput.maxLength = 512;
                listNameInput.autofocus = true;
                wrapperElement.appendChild(listNameInput);
                const listAddControls = document.createElement("div");
                listAddControls.className = type === "list" ? "list-add-controls" : "card-add-controls";
                wrapperElement.appendChild(listAddControls);
                const addButton = document.createElement("input");
                addButton.className = "add-button";
                addButton.type = "submit";
                addButton.value = type === "list" ? "Add List" : "Add Card";
                listAddControls.appendChild(addButton);
                const closeButton = document.createElement("a");
                closeButton.className = "add-close-button fas fa-times";
                listAddControls.appendChild(closeButton);
                break;
        }
        return wrapperElement;
    }
    /**
     * 리스트 요소
     * @param listData 리스트 데이터
     */
    static createListElement(listData) {
        const wrapperElement = document.createElement("div");
        wrapperElement.className = "js-list list-wrapper";
        const listElement = document.createElement("div");
        listElement.className = "list";
        wrapperElement.appendChild(listElement);
        const listHeader = document.createElement("div");
        listHeader.className = "list-header";
        listElement.appendChild(listHeader);
        const editingTarget = document.createElement("div");
        editingTarget.className = "float-list-target";
        listHeader.appendChild(editingTarget);
        const titleElement = document.createElement("div");
        titleElement.className = "list-title";
        titleElement.innerHTML = listData.title;
        listHeader.appendChild(titleElement);
        const cardContainer = document.createElement("div");
        cardContainer.className = "card-container";
        listElement.appendChild(cardContainer);
        return wrapperElement;
    }
}
CanvasView.UNIQUE = 0;
CanvasView.listElements = [];
//# sourceMappingURL=CanvasView.js.map