import { Scanner } from "../Scanner";
import { WebsiteScanner } from "./WebsiteScanner";

/**
 * Extracts address from the first PayButton on the page.
 */
export class PayButtonScanner extends WebsiteScanner implements Scanner {

  private static Selector = "button.pay-button[address]";

  protected scanAddressText(document: HTMLDocument) {
    const button = document.body.querySelector<HTMLButtonElement>(PayButtonScanner.Selector);
    return button ? button.getAttribute("address") : null;
  }

}
