import { Contributable } from "./Contributable";

export enum MessageType {
    ContributableFound = "BH_CONTRIBUTABLE_FOUND",
    ContributableRescan = "BH_CONTRIBUTABLE_FOUND"
}

export interface Message {
    readonly type: MessageType;
}

export class ContributableFoundMessage implements Message {
    readonly type = MessageType.ContributableFound;
    
    constructor(readonly contributable: Contributable) {
    }
    
    static carrying(contributable: Contributable): ContributableFoundMessage {
        return new ContributableFoundMessage(contributable);
    }
}

export class ContributableRescanMessage implements Message {
    readonly type = MessageType.ContributableRescan;
}
