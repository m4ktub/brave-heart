import { Content, Account, Payable } from "../Payable";
import { Scanner } from "../Scanner";
import * as bchaddr from "bchaddrjs";

/**
 * A general scanner that looks for addresses in the page content.
 *
 * The first address found is the address that is used the entire document
 * is considered the content. This means that the page location and title
 * are used.
 */
export class WebsiteScanner implements Scanner {

  private static CashAddrRegExp = new RegExp("(bitcoincash:)?[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}|(BITCOINCASH:)?[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]{42,}", "g");

  accepts(document: HTMLDocument) {
    return true;
  }

  async scan(document: HTMLDocument): Promise<Payable | null> {
    return this.scanAddress(document).then(address => {
      if (!address) {
        return null;
      }

      let site = this.scanSite(document);
      let account = this.scanAccount(document);
      let content = this.scanContent(document);

      return this.buildPayable(site, account, content, address);
    });
  }

  protected async scanAddress(document: HTMLDocument): Promise<string | null> {
    let text = this.scanAddressText(document) || "";
    let candidates = text.match(WebsiteScanner.CashAddrRegExp) || [];
    return candidates.find(bchaddr.isCashAddress) || null;
  }

  protected scanAddressText(document: HTMLDocument): string {
    return document.head.innerHTML + document.body.innerHTML;
  }

  protected scanSite(document: HTMLDocument): string {
    return document.location.protocol + "//" + document.location.host;
  }

  protected scanAccount(document: HTMLDocument): Account | null {
    let id = this.scanAccountId(document);
    let name = this.scanAccountName(document);
    let url = this.scanAccountUrl(document);

    return this.buildAccount(id, name, url);
  }

  protected scanAccountId(document: HTMLDocument): string {
    return null;
  }

  protected scanAccountName(document: HTMLDocument): string {
    return null;
  }

  protected scanAccountUrl(document: HTMLDocument): string {
    return null;
  }

  protected buildAccount(id: any, name: any, url: any): Account | null {
    if (id == null || name == null || url == null) {
      return null;
    }

    return new Account(id, name, url);
  }

  protected scanContent(document: HTMLDocument): Content {
    let id = this.scanContentId(document);
    let title = this.scanContentTitle(document);
    let url = this.scanContentUrl(document);

    return this.buildContent(id, title, url);
  }

  protected scanContentId(document: HTMLDocument): string {
    return document.location.pathname + document.location.search;
  }

  protected scanContentTitle(document: HTMLDocument): string {
    return document.title;
  }

  protected scanContentUrl(document: HTMLDocument): string {
    return document.location.href.replace(/#.*/, "");
  }

  public buildContent(id: string, title: string, url: string): Content {
    if (id == null || title == null || url == null) {
      return null;
    }

    return new Content(id, title, url);
  }

  protected buildPayable(site: string, account: Account, content: Content, address: string) {
    if (site == null || content == null || address == null) {
      return null;
    }

    return new Payable(site, account, content, address);
  }

}
