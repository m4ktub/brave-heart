import { Payable } from "../Payable";
import { Scanner } from "../Scanner";
import { asyncMapFind } from "../Functions";

/**
 * Tries a series of scanners in sequence and returns the first matching result.
 */
export class SequenceScanner implements Scanner {
  constructor(readonly sequence: Scanner[]) {}

  accepts(document: HTMLDocument): boolean {
    return this.sequence.some(scanner => scanner.accepts(document));
  }

  scan(document: HTMLDocument): Promise<Payable | null> {
    // get only scanners accepting docment
    const accepting = this.sequence.filter(scanner =>
      scanner.accepts(document)
    );

    // return promise encapsulating iterating over accepting scanners
    const scanDocument = (scanner: Scanner) => scanner.scan(document);
    const notNull = (payable: Payable) => payable != null;
    return asyncMapFind(accepting, scanDocument, notNull);
  }
}
