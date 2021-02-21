export interface ListData {
    seq: number
    title: string
    cards: CardData[]
    index: number
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
