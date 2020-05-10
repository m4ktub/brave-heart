import { Message } from './Messages';

/**
 * Utility function to avoid console errors.
 *
 * When using the chrome API in firefox, if there's no other frame active
 * (eg. Popup or Options page) then Firefox will produce an error because
 * messages cannot be deliverabed and `lastError` was not checked. Since
 * that situation is expected, this function simply accesses `lastError`
 * and allows suppressing console errors.
 */
const ignoreLastError = () => {
  return chrome.runtime.lastError;
};

type MessageResponse = (response?: any) => void;

function chain(...args: MessageResponse[]) {
  return (response: any) => {
    args.forEach(fn => {
      if (fn) fn(response)
    });
  };
}

class Browser {

  /**
   * The same as `chrome.runtime.sendTabMessage()` but ensures that `lastError` is aways
   * checked. This avoids Firefox from producing error messages in the console for
   * perfectly acceptable situations.
   */
  sendTabMessage(tabId: number, msg: Message, callback?: MessageResponse) {
    chrome.tabs.sendMessage(tabId, msg, chain(ignoreLastError, callback));
  }

  /**
   * The same as `chrome.runtime.sendMessage()` but ensures that `lastError` is aways
   * checked. This avoids Firefox from producing error messages in the console for
   * perfectly acceptable situations.
   */
  sendMessage(msg: Message, callback?: MessageResponse) {
    chrome.runtime.sendMessage(msg, chain(ignoreLastError, callback));
  }

}

export default new Browser();
