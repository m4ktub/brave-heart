
export interface CurrencyOptions {
  currency: string;
}

export class Currency {

  constructor(private options: CurrencyOptions) {
  }

  /**
   * Ensures the given `value` is a number with 2 fixed precision of two decimals places.
   * 
   * @param value the float value
   */
  currency(value: number): number {
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
  proportion(amount: number, part: number, total: number): number {
    return this.currency(amount * part / total);
  }

  /**
   * Formats a given value as a currency, using the browsers default locale.
   * 
   * @param value the currency value to format
   */
  format(value: number): string {
    return value.toLocaleString(undefined, { style: "currency", currency: this.options.currency }); 
  }

}