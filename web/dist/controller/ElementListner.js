/**
 * 특정 ID를 갖은 Element 리스너 설정
 * @param eventName 이벤트 이름
 * @param idName id 이름
 * @param listener 리스닝 메소드
 */
export function setOnListnerbyID(eventName, idName, listener) {
    document.getElementById(idName).addEventListener(eventName, listener);
}
/**
 * 클래스 명을 갖은 Elements 리스너 설정
 * @param eventName 이벤트 이름
 * @param className class 이름
 * @param listener 리스닝 메소드
 */
export function setOnListnerbyClass(eventName, className, listener) {
    const classElements = document.getElementsByClassName(className);
    for (let i = 0; i < classElements.length; i++) {
        classElements.item(i).addEventListener(eventName, listener);
    }
}
/**
 * 부모 마우스 클릭 방지
 * @param event 마우스 이벤트
 */
export function preventParentClick(event) { event.stopPropagation(); }
//# sourceMappingURL=ElementListner.js.map