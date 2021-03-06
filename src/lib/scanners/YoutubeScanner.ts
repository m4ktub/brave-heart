import { Content, Account } from "../Payable";
import { Scanner } from "../Scanner";
import { WebsiteScanner } from "./WebsiteScanner";

/**
 * An Youtube specific scanner that only looks for addresses in the video description. Videos are
 * associated with their specific channel.
 */
export class YoutubeScanner extends WebsiteScanner implements Scanner {

    private static channelRegExp = new RegExp("https?://.*\\.youtube\\.com/channel/(.*)$");
    private static queryWatchPage = "ytd-app[is-watch-page]";
    private static queryDescription = "ytd-video-secondary-info-renderer #description";
    private static queryChannelLink = "ytd-video-secondary-info-renderer ytd-channel-name a.yt-simple-endpoint";
    private static queryViewer = "ytd-watch-flexy";

    accepts(document: HTMLDocument): boolean {
        const hosts = ["www.youtube.com"];
        return hosts.indexOf(document.location.host) >= 0;
    }

    protected buildPayable(site: string, account: Account, content: Content, address: string) {
        if (account == null) {
            return null;
        }

        return super.buildPayable(site, account, content, address);
    }

    protected scanAddressText(document: HTMLDocument): string {
        const isWatchPage = null != document.querySelector(YoutubeScanner.queryWatchPage);
        if (!isWatchPage) {
            return "";
        }

        let description = document.querySelector<HTMLElement>(YoutubeScanner.queryDescription);
        if (!description) {
            return "";
        }

        return description.innerText;
    }

    protected scanAccount(document: HTMLDocument): Account | null {
        let accountLink = document.querySelector<HTMLElement>(YoutubeScanner.queryChannelLink);
        if (!accountLink) {
            return null;
        }

        let url = accountLink["href"];
        let idMatch = YoutubeScanner.channelRegExp.exec(url);
        if (!idMatch) {
            return null;
        }

        let id = idMatch[1];
        let name = accountLink.innerText;
        return super.buildAccount(id, name, url);
    }

    protected scanContentId(document: HTMLDocument): string {
        let flexy = document.querySelector<HTMLElement>(YoutubeScanner.queryViewer);
        return flexy.getAttribute("video-id");
    }

    protected scanContentTitle(document: HTMLDocument): string {
        return document.querySelector<HTMLElement>("h1.title").innerText;
    }

    protected scanContentUrl(document: HTMLDocument): string {
        let id = this.scanContentId(document);
        return `https://www.youtube.com/watch?v=${id}`;
    }

}
