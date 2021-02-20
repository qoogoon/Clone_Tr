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

export interface ResponseServer<T> {
    ok: boolean
    data?: T[] | T
    serverMessage?: string
}
