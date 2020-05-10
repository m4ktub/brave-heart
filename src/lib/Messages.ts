import { Payable } from "./Payable";
import { State } from "./State"

export enum MessageType {
    PayableFound = "BH_PAYABLE_FOUND",
    PayableRescan = "BH_PAYABLE_FOUND",
    FetchJson = "BH_FETCH_JSON",
    StateRequest = "BH_STATE_REQUEST",
    StateUpdate = "BH_STATE_UPDATE"
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

export class StateRequestMessage implements Message {
    readonly type = MessageType.StateRequest;

    constructor() {

    }
}

export class StateUpdateMessage implements Message {
    readonly type = MessageType.StateUpdate;

    constructor(readonly state: State) {

    }
}
