export interface ListData {
    seq: number
    title: string
    items: ItemData[]
    index: number
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
