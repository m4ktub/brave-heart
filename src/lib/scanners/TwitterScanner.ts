import { Content, Account, Payable } from '../Payable';
import { Scanner } from "../Scanner";
import { AddressExtractor } from '../Address';
import { FetchJsonMessage } from '../Messages';

/**
 * A Twitter specific scanner that uses the profile's description as a source of
 * a donation address.
 */
export class TwitterScanner implements Scanner {

  private static BearerCode = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
  private static StatusRegExp = new RegExp("https://twitter\\.com/([^/]+)/status/([0-9]+)(\\?.*)?");
  private readonly addressExtractor = new AddressExtractor();

  accepts(document: HTMLDocument): boolean {
    const hosts = ["twitter.com"];
    return hosts.indexOf(document.location.host) >= 0;
  }

  async scan(document: HTMLDocument): Promise<Payable | null> {
    // check url matches
    const url = this.getUrlComponents(document);
    if (!url) {
      return null;
    }

    // build account and content/tweet objects
    const site = "https://twitter.com";

    const accountName = `@${url.screenName}`;
    const accountUrl = `${site}/${url.screenName}`;
    const account = new Account(accountName, accountName, accountUrl);

    const title = document.title;
    const contentId = url.tweetId
    const contentUrl = `${accountUrl}/status/${contentId}`
    const content = new Content(contentId, title, contentUrl);

    // create fetch message to send to background
    const fetchMessage = new FetchJsonMessage(`https://api.twitter.com/1.1/users/show.json?screen_name=${url.screenName}`, {
      credentials: "omit",
      headers: {
        'Authorization': `Bearer ${TwitterScanner.BearerCode}`
      },
    });

    try {
      // fetch account info
      const json = await new Promise<any>(resolve => chrome.runtime.sendMessage(fetchMessage, resolve));
      if (json.error) {
        return null;
      }

      // extract address from user information
      const user = json.data;
      const text = `${user.name} ${user.location} ${user.description}`;
      const address = await this.addressExtractor.extract(text);
      if (!address) {
        return null;
      }

      // return payable
      return new Payable(site, account, content, address);
    } catch {
      return null;
    }
  }

  private getUrlComponents(document: HTMLDocument) {
    const url = document.location.href;
    const urlMatch = TwitterScanner.StatusRegExp.exec(url);
    if (!urlMatch) {
      return null;
    }

    return { screenName: urlMatch[1], tweetId: urlMatch[2] };
  }

}
