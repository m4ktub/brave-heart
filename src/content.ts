import { MessageType, Message, PayableFoundMessage } from "./lib/Messages";
import { HeaderScanner } from "./lib/scanners/HeaderScanner";
import { PayButtonScanner } from "./lib/scanners/PayButtonScanner";
import { YoutubeScanner } from "./lib/scanners/YoutubeScanner";
import { SequenceScanner } from "./lib/scanners/SequenceScanner";


// list of scanners to run
const availableScanners = [
    // specific website scanners
    new YoutubeScanner(),
    // generic website scanners
    new SequenceScanner([
        new PayButtonScanner(),
        new HeaderScanner(),
    ]),
];

// register message dispatcher
chrome.runtime.onMessage.addListener(onRuntimeMessage);

// register message dispatcher
function onRuntimeMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    let msg = message as Message;
    switch (msg.type) {
        case MessageType.PayableRescan:
            scan();
            sendResponse(true);
            break;
        default:
            sendResponse(false);
            break;
    }
}

// scan page for payable content
function scan() {
    const scanner = availableScanners.find(m => m.accepts(document));
    if (!scanner) {
        return;
    }

    const payable = scanner.scan(document);
    if (payable != null) {
        chrome.runtime.sendMessage(PayableFoundMessage.carrying(payable));
    }
}

// ensure periodic scan
setInterval(() => scan(), 10000);
