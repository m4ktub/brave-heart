export interface CurrencyFormatOptions {
  currency: string;
}

export class Currency {

  /**
   * Ensures the given `value` is a number with 2 fixed precision of two decimals places.
   * 
   * @param value the float value
   */
  static currency(value: number): number {
    return +value.toFixed(2);
  }

  /**
   * Calculates the money amount to be proportionally assigned to a given part of a total.
   * 
   * This is common calculation that should be reused to have the same result in every
   * place where it is used. The final value will have as little error as possible and a 
   * currency precision.
   * 
   * @param amount total amount to split
   * @param part the value of a given part
   * @param total the total value of all parts
   */
  static proportion(amount: number, part: number, total: number): number {
    return this.currency(amount * part / total);
  }

  /**
   * Formats a given value as a currency, using the browsers default locale.
   * 
   * @param value the currency value to format
   * @param options options affecting the format, like the currency
   */
  static format(value: number, options: CurrencyFormatOptions): string {
    return value.toLocaleString(undefined, { 
      style: "currency", 
      currency: options.currency
    }); 
  }

}
