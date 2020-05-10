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

/**
 * Flags to determine if the browser is chrome or firefox.
 */
const isChrome = chrome.extension.getURL("").startsWith("chrome");
const isFirefox = chrome.extension.getURL("").startsWith("moz");

// utilities
type MessageResponse = (response?: any) => void;
function chain(...args: MessageResponse[]) {
  return (response: any) => {
    args.forEach(fn => {
      if (fn) fn(response)
    });
  };
}

/**
 * Compatibility class to handle quirks between different browsers.
 *
 * Firefox supports most of the `chrome´ API for extensions but there
 * are some differences. This class is not intended to abstract the
 * `chrome` API but to provide solutions for the existing quirks.
 */
class Browser {

  /**
   * Gets a URL for the favicon of the given url. This uses different methods
   * in different browsers.
   *
   * @param location the url of the page
   */
  getFaviconUrl(location: string) {
    if (isChrome) {
      return `chrome://favicon/size/32/${encodeURI(location)}`;
    } else {
      return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURI(location)}`;
    }
  }

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
