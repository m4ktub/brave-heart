import { Payable } from "./lib/Payable";
import { MessageType, Message, PayableFoundMessage } from "./lib/Messages";
import { YoutubeScannerInstance, WebsiteScannerInstance, Scanner } from "./lib/Scanners";

// list of scanners to run
const availableScanners = [ YoutubeScannerInstance, WebsiteScannerInstance ];

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
            console.log("[Brave Heart] Unrecognized message: " + message.id, message);
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
        console.log("[Brave Heart] found payable content: ", payable);
        chrome.runtime.sendMessage(PayableFoundMessage.carrying(payable));
    }
}

// ensure periodic scan
setInterval(() => scan(), 10000);
