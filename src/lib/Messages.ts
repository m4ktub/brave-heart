import { Payable } from "./Payable";

export enum MessageType {
    PayableFound = "BH_PAYABLE_FOUND",
    PayableRescan = "BH_PAYABLE_FOUND",
    FetchJson = "BH_FETCH_JSON",
}

export interface Message {
    readonly type: MessageType;
}

export class PayableFoundMessage implements Message {
    readonly type = MessageType.PayableFound;

    constructor(readonly payable: Payable) {
    }

    static carrying(payable: Payable): PayableFoundMessage {
        return new PayableFoundMessage(payable);
    }
}

export class PayableRescanMessage implements Message {
    readonly type = MessageType.PayableRescan;
}

export class FetchJsonMessage implements Message {
    readonly type = MessageType.FetchJson;

    constructor(readonly url: string, readonly options?: RequestInit) {

    }
}
