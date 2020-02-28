import { Payable } from "../Payable";
import { Scanner } from "../Scanner";
import { WebsiteScanner } from "./WebsiteScanner";

/**
 * Tries a series of scanners in sequence and returns the first matching result.
 */
export class SequenceScanner implements Scanner {

  constructor(readonly sequence: Scanner[]) {
  }

  accepts(document: HTMLDocument): boolean {
    return this.sequence.some(scanner => scanner.accepts(document));
  }

  scan(document: HTMLDocument): Payable {
    let result = null;

    const accepting = this.sequence.filter(scanner => scanner.accepts(document));
    for (const scanner of accepting) {
      result = scanner.scan(document);
      if (result != null) {
        break;
      }
    }

    return  result;
  }

}
