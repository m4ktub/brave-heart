import { Content, Account, Payable } from "../Payable";
import { Scanner } from "../Scanner";

/**
 * An Read.cash specific scanner that takes the address associated with the
 * upvote button.
 */
export class ReadCashScanner implements Scanner {

  private static RegExpUrl = new RegExp("https://read.cash/(@.*)/(.*)-([0-9a-f]+)(#.*)?$");
  private static RegExpAddress = new RegExp("to-cashaddress=\"([^\"]+)\"");

  accepts(document: HTMLDocument): boolean {
    const hosts = ["read.cash"];
    return hosts.indexOf(document.location.host) >= 0;
  }

  scan(document: HTMLDocument): Promise<Payable | null> {
    const match = ReadCashScanner.RegExpUrl.exec(document.location.href);
    if (!match) {
      return Promise.resolve(null);
    }

    const site = "https://read.cash";

    const accountName = match[1];
    const accountUrl = `${site}/${accountName}`;
    const account = new Account(accountName, accountName, accountUrl);

    const title = document.title;
    const contentPath = match[2]
    const contentRef = match[3];
    const contentId = `/${contentPath}`
    const contentUrl = `${accountUrl}/${contentPath}-${contentRef}`
    const content = new Content(contentId, title, contentUrl);

    return fetch(contentUrl)
      .then(response => response.text())
      .then(text => {
        var match = text.match(ReadCashScanner.RegExpAddress)
        if (!match) {
          return null;
        }

        const address = match[1];
        return new Payable(site, account, content, address);
      });
  }

}
