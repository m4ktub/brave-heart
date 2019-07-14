import { Content, Account, Contributable } from "./Contributable";

const CashAddrRegExp = new RegExp("(bitcoincash:)?[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}|(BITCOINCASH:)?[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]{42,}", "g");

export interface Scanner {

    accepts(document: HTMLDocument): boolean;
    scan(document: HTMLDocument): Contributable | null;

}

export class WebsiteScanner implements Scanner {

    accepts(document: HTMLDocument) {
        return true;
    }

    scan(document: HTMLDocument): Contributable | null {
        let address = this.scanAddress(document);
        if (!address) {
            return null;
        }
        
        let site = this.scanSite(document);
        let account = this.scanAccount(document);
        let content = this.scanContent(document);
        
        return new Contributable(site, account, content, address);
    }

    protected scanSite(document: HTMLDocument): string {
        return document.location.protocol + "//" + document.location.host;
    }
    
    protected scanAccount(document: HTMLDocument): Account | null {
        return null;
    }

    protected scanContent(document: HTMLDocument): Content {
        let id = this.scanContentId(document);
        let title = this.scanContentTitle(document);
        let url = this.scanContentUrl(document);
        
        return new Content(id, title, url);
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
    
    protected scanAddress(document: HTMLDocument): string | null {
        let text = document.head.innerHTML + document.body.innerHTML;
        let candidates = text.match(CashAddrRegExp) || [];
        return candidates.find(this._isValidAddress) || null;
    }
    
    private _isValidAddress(address: string) {
        // TODO: validate address
        return true;
    }
}

export let WebsiteScannerInstance = new WebsiteScanner();
