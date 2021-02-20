
export async function getRequest(url: string, data?: any): Promise<any> {
    return fetch(url + '?' + new URLSearchParams(data))
        .then((response) => {
            if (!response.ok) return new Promise((resolve, reject) => reject(response))
            return response.json()
        })
}

export async function postRequest(url: string, data: any): Promise<any> {
    return request(url, data, 'post')
}

export async function putRequest(url: string, data: any): Promise<any> {
    return request(url, data, 'put')
}

export async function deleteRequest(url: string, data: any): Promise<any> {
    return request(url, data, 'delete')
}

async function request(url: string, data: any, method: string): Promise<any> {
    return fetch(url, {
        method,
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data),
    }).then(response => response.json());
}

export function handleError(reason: any) {
    switch (reason.message) {
        case "Failed to fetch":
            alert("서버를 찾을 수 없습니다.")
            return
        default:
            alert(`error : ${reason.message}`)
            console.error(reason.message)
            return
    }
}