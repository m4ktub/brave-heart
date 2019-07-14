import { Contributable } from "./lib/Contributable";
import { MessageType, Message, ContributableFoundMessage } from "./lib/Messages";
import { WebsiteScannerInstance } from "./lib/Scanners";

// register message dispatcher
chrome.runtime.onMessage.addListener(onRuntimeMessage);

// register message dispatcher
function onRuntimeMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    let msg = message as Message;
    switch (msg.type) {
        case MessageType.ContributableRescan:
            scan();
            sendResponse(true);
            break;
        default:
            console.log("[Brave Heart] Unrecognized message: " + message.id, message);
            sendResponse(false);
            break;
    }
}

// scan page for contributable content
function scan() {
    const available = [ WebsiteScannerInstance ];
    const accepting = available.filter(m => m.accepts(document))
    
    var contributable: Contributable = null;
    for (let scanner of accepting) {
        contributable = scanner.scan(document);
        if (contributable) {
            break;
        }
    }
    
    if (contributable != null) {
        console.log("[Brave Heart] found contributable content: ", contributable);
        chrome.runtime.sendMessage(ContributableFoundMessage.carrying(contributable));
    }
}