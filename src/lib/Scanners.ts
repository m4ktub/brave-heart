import { Content, Account, Payable } from "./Payable";
import * as bchaddr from "bchaddrjs";

/**
 * General regular expression to match Bitcoin Cash addresses.
 * 
 * This matches many strings or ids that are simply base32 enconded. This means
 * every match must be validated.
 */
const cashAddrRegExp = new RegExp("(bitcoincash:)?[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}|(BITCOINCASH:)?[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]{42,}", "g");

/**
 * A scanner is used to extract a payable content from the page.
 * 
 * The scanner may only accept certain pages, that is, may reject a page to allow other
 * scanners to handle it. If the scanner accepts a page it is responsible for scanning
 * and producing a payable content when ascked.
 */
export interface Scanner {

    /**
     * Checks if the given page is acceptable, that is, if the scanner can
     * extract a payable content from the page.
     * 
     * @param document the page to accept
     */
    accepts(document: HTMLDocument): boolean;

    /**
     * Extracts a payable content from the given page.
     * 
     * Although the scanner accepts the page, the page may not contain a payable
     * content. If `null` is return then the page is simply ignored and no other
     * scanner will be asked to scan the page.
     * 
     * @param document the page to process
     */
    scan(document: HTMLDocument): Payable | null;

}

/**
 * A general scanner that looks for addresses in the page content.
 * 
 * The first address found is the address that is used the entire document
 * is considered the content. This means that the page location and title
 * are used.
 */
export class WebsiteScanner implements Scanner {

    accepts(document: HTMLDocument) {
        return true;
    }

    scan(document: HTMLDocument): Payable | null {
        let address = this.scanAddress(document);
        if (!address) {
            return null;
        }
        
        let site = this.scanSite(document);
        let account = this.scanAccount(document);
        let content = this.scanContent(document);
        
        return this.buildPayable(site, account, content, address);
    }
    
    protected scanAddress(document: HTMLDocument): string | null {
        let text = this.scanAddressText(document);
        let candidates = text.match(cashAddrRegExp) || [];
        return candidates.find(bchaddr.isCashAddress) || null;
    }

    protected scanAddressText(document: HTMLDocument) {
        return document.head.innerHTML + document.body.innerHTML;
    }
    
    protected scanSite(document: HTMLDocument): string {
        return document.location.protocol + "//" + document.location.host;
    }
    
    protected scanAccount(document: HTMLDocument): Account | null {
        let id = this.scanAccountId(document);
        let name = this.scanAccountName(document);
        let url = this.scanAccountUrl(document);

        return this.buildAccount(id, name, url)
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

/**
 * An Youtube specific scanner that only looks for addresses in the video description. Videos are
 * associated with their specific channel.
 */
export class YoutubeScanner extends WebsiteScanner implements Scanner {

    private static channelRegExp = new RegExp("https?://.*\\.youtube\\.com/channel/(.*)$");

    accepts(document: HTMLDocument): boolean {
        const hosts = [ "www.youtube.com" ];
        return hosts.indexOf(document.location.host) >= 0;
    }
    
    protected buildPayable(site: string, account: Account, content: Content, address: string) {
        if (account == null) {
            return null;
        }

        return super.buildPayable(site, account, content, address);
    }

    protected scanAddressText(document: HTMLDocument): string {
        const isWatchPage = null != document.querySelector("ytd-app[is-watch-page]");
        if (!isWatchPage) {
            return "";
        }

        let description = document.querySelector<HTMLElement>("div#description")
        if (!description) {
            return "";
        }

        return description.innerText;
    }

    protected scanAccount(document: HTMLDocument): Account | null {
        let accountLink = document.querySelector<HTMLElement>("ytd-channel-name a.yt-simple-endpoint");
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
        let flexy = document.querySelector<HTMLElement>("ytd-watch-flexy");
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

// export instances of scanmers

export let WebsiteScannerInstance = new WebsiteScanner();
export let YoutubeScannerInstance = new YoutubeScanner();
