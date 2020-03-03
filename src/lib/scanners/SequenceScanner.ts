import { Payable } from "../Payable";
import { Scanner } from "../Scanner";

/**
 * Tries a series of scanners in sequence and returns the first matching result.
 */
export class SequenceScanner implements Scanner {
  constructor(readonly sequence: Scanner[]) {}

  accepts(document: HTMLDocument): boolean {
    return this.sequence.some(scanner => scanner.accepts(document));
  }

  scan(document: HTMLDocument): Promise<Payable | null> {
    // auxiliary function to iterate scanners and promises
    function first(scanners: Scanner[], resolveTo: (value: Payable) => void): void {
      if (scanners.length == 0) {
        resolveTo(null);
      } else {
        const head = scanners[0];
        const rest = scanners.slice(1);

        head.scan(document).then(payable => {
          if (payable != null) {
            resolveTo(payable);
          } else {
            first(rest, resolveTo);
          }
        });
      }
    }

    // get only scanners accepting docment
    const accepting = this.sequence.filter(scanner => scanner.accepts(document));

    // return promise encapsulating iterating over accepting scanners
    return new Promise(resolve => {
      first(accepting, resolve);
    });
  }
}
