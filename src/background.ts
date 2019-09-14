import { 
    MessageType,
    Message,
    ContributableFoundMessage,
    ContributableRescanMessage
} from "./lib/Messages";
import { Contributable } from "./lib/Contributable";
import { PersistentState } from "./lib/State";
 
/**
 * Persistent state with usage during current period and user options.
 */
var state = new PersistentState();

/**
 * Internal tracking of the contributable found in each tab.
 */
var tabs: { [key: string]: Contributable } = {
};

/**
 * Traverse tabs (active and audible ones) and count their usage if
 * there's a contributable content associated with them.
 *
 * This function assumes it's called every second.
 */
function monitor() {
    function accumulateTab(tab: chrome.tabs.Tab) {
        let contributable = tabs[tab.id];
        
        if (!contributable) {
            return;
        }
        
        state.currentPeriod.trackUsage(contributable, 1);
        state.save();
    }
    
    chrome.windows.getLastFocused((window: chrome.windows.Window) => {
        chrome.tabs.query({ active: true, windowId: window.id }, (activeTabs: chrome.tabs.Tab[]) => {
            // accumulate usage in active tab, if window is focused
            let accounted: chrome.tabs.Tab[] = [];
            if (window.focused) {
                activeTabs.forEach(accumulateTab);
                accounted = activeTabs;
            }
            
            // find tabs with sound
            chrome.tabs.query({ audible: true }, (audibleTabs: chrome.tabs.Tab[]) => {
                const notAccounted = (tab: chrome.tabs.Tab) => accounted.find(t => t.id == tab.id) == undefined;
                const notMuted = (tab: chrome.tabs.Tab) => !(tab.mutedInfo || { muted: false }).muted;

                // accumulate usage in audible, not active, not muted tabs
                audibleTabs.filter(notAccounted).filter(notMuted).forEach(accumulateTab);
            });
        });
    });
}

/**
 * Associates the contributable content to the tab.
 */
function onContributableFound(tab: chrome.tabs.Tab, contributable: Contributable) {
    tabs[tab.id] = contributable;
}

/**
 * Dispatches each received message to the respective function, that is, to a function that only
 * handles that particular type of message. It also ensures that `sendResponse` is called with
 * `true` when the message is processed or `false` if the message is not processed.
 */
function onRuntimeMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    let msg = message as Message;
    switch (msg.type) {
        case MessageType.ContributableFound:
            let contributableMsg = msg as ContributableFoundMessage;
            onContributableFound(sender.tab, contributableMsg.contributable);
            sendResponse(true);
            break;
        default:
            console.log("Unrecognized message: " + message.id, message);
            sendResponse(false);
            break;
    }
}

/**
 * After a tab completes loaded deletes any tracking for the tab and sends a rescan request to the content script.
 */
function onTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    if (changeInfo.status == "complete") {
        // remove current usage associated with tab
        delete tabs[tabId];
        
        // request scan of new contributable
        chrome.tabs.sendMessage(tabId, new ContributableRescanMessage());
    }
}

// register message dispatcher
chrome.runtime.onMessage.addListener(onRuntimeMessage);

// monitor when tabs change url to rescan content
chrome.tabs.onUpdated.addListener(onTabUpdated);

// periodically monitoring usage
setInterval(monitor, 1000);
