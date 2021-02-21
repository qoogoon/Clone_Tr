var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function getRequest(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(url + '?' + new URLSearchParams(data))
            .then((response) => {
            if (!response.ok)
                return new Promise((resolve, reject) => reject(response));
            return response.json();
        });
    });
}
export function postRequest(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(url, data, 'post');
    });
}
export function putRequest(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(url, data, 'put');
    });
}
export function deleteRequest(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(url, data, 'delete');
    });
}
function request(url, data, method) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(url, {
            method,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(data),
        }).then(response => response.json());
    });
}
export function handleError(reason) {
    switch (reason.message) {
        case "Failed to fetch":
            alert("서버를 찾을 수 없습니다.");
            return;
        default:
            alert(`error : ${reason.message}`);
            console.error(reason.message);
            return;
    }
}
//# sourceMappingURL=Connect.js.map