import { Payable } from "./Payable";

export enum MessageType {
    PayableFound = "BH_PAYABLE_FOUND",
    PayableRescan = "BH_PAYABLE_FOUND"
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
