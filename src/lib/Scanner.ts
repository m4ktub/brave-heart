import { Payable } from "./Payable";

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
    scan(document: HTMLDocument): Promise<Payable | null>;

}
