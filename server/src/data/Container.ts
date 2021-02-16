export interface ListData {
    seq: number
    title: string
    index: number
    items?: ItemData[]
}

export interface ItemData {
    seq: number
    text: string
    index: number
    listSeq: number
}

export interface Response<T> {
    result: "success" | "fail"
    data?: T[] | T
    message?: string
}
