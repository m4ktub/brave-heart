import { Scanner } from "../Scanner";
import { WebsiteScanner } from "./WebsiteScanner";

/**
 * Extracts address from a specific header in the page.
 */
export class HeaderScanner extends WebsiteScanner implements Scanner {

  static HeaderMetaName = "bch:donate";
  private static HeaderMetaSelector = `meta[name='${HeaderScanner.HeaderMetaName}']`;

  protected scanAddressText(document: HTMLDocument) {
    const meta = document.head.querySelector<HTMLMetaElement>(HeaderScanner.HeaderMetaSelector);
    return meta ? meta.content : null;
  }

}
