import {
    Dispatcher,
    FetchJsonMessage,
    MessageType,
    PayableFoundMessage,
    PayableRescanMessage,
    StateUpdateMessage
} from "./lib/Messages";
import { Payable } from "./lib/Payable";
import { State } from "./lib/State";
import Browser from "./lib/Browser";

/**
 * State structure with accumlated usage user options.
 */
var state = new State();

/**
 * Updates the extension's state from a received update.
 *
 * @param items The new state possibly as a plain object
 */
function updateState(items: any) {
    // skip when empty (first load)
    if (!items || !items.state) {
        return;
    }

    // initialize state from stored json
    state.updateFrom(items.state);
}

/**
 * Saves the state to local storage and broadcasts a message with the new state.
 */
function saveState(update?: any) {
    updateState({ state: update });
    chrome.storage.local.set({ state });
    Browser.sendMessage(new StateUpdateMessage(state));
}

/**
 * Internal tracking of the payable found in each tab.
 */
var tabs: { [key: string]: Payable } = {
};

/**
 * Traverse tabs (active and audible ones) and count their usage if
 * there's a payable content associated with them.
 *
 * This function assumes it's called every second.
 */
function monitor() {
    function accumulateTab(tab: chrome.tabs.Tab) {
        let payable = tabs[tab.id];

        if (!payable) {
            return;
        }

        state.currentPeriod.trackUsage(payable, 1);
        saveState();
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
 * Associates the payable content to the tab.
 */
function onPayableFound(tab: chrome.tabs.Tab, payable: Payable) {
    tabs[tab.id] = payable;
}

/**
 * Setups the dispatcher from received message with a respective handler function, that is, to a function
 * that only handles that particular type of message.
 */
const dispatcher = new Dispatcher();

dispatcher.register(MessageType.StateRequest, () => {
    Browser.sendMessage(new StateUpdateMessage(state));
});

dispatcher.register(MessageType.StateUpdate, (msg: StateUpdateMessage) => {
    saveState(msg.state);
});

dispatcher.register(MessageType.PayableFound, (msg: PayableFoundMessage, sender) => {
    onPayableFound(sender.tab, msg.payable);
});

dispatcher.register(MessageType.FetchJson, (msg: FetchJsonMessage, sender, sendResponse) => {
    fetch(msg.url, msg.options)
        .then(response => response.json())
        .then(data => sendResponse({ data }))
        .catch(error => sendResponse({ error }));
});

/**
 * After a tab completes loaded deletes any tracking for the tab and sends a rescan request to the content script.
 */
function onTabUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
    if (changeInfo.status == "complete") {
        // remove current usage associated with tab
        delete tabs[tabId];

        // request scan of new payable
        Browser.sendTabMessage(tabId, new PayableRescanMessage());
    }
}

// register message dispatcher
chrome.runtime.onMessage.addListener(dispatcher.listener());

// monitor when tabs change url to rescan content
chrome.tabs.onUpdated.addListener(onTabUpdated);

// load stored state
chrome.storage.local.get(updateState);

// periodically monitoring usage
setInterval(monitor, 1000);
