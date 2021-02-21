export interface ListData {
    seq: number
    title: string
    index: number
    cards?: CardData[]
}

export interface CardData {
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
