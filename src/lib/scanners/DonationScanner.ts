import { Scanner } from "../Scanner";
import { WebsiteScanner } from "./WebsiteScanner";

/**
 * Extracts address from a region marked for donation by id or class name.
 */
export class DonationScanner extends WebsiteScanner implements Scanner {

  private static Selector = `#donation,#donate,div[class*="donation" i],div[class*="donate" i]`;

  protected scanAddressText(document: HTMLDocument) {
    const el = document.body.querySelector<HTMLElement>(DonationScanner.Selector);
    return el ? el.innerText : null;
  }

}
