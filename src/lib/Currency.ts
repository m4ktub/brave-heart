export interface CurrencyFormatOptions {
  currency: string;
}

export class Currency {

  /**
   * Ensures the given `value` is a number with a fixed precision. By default
   * two decimals places are used but other decimals places can be provided to
   * get BCH values, for example.
   *
   * @param value the float value
   * @param decimals the number of decimals in the currency value
   */
  static currency(value: number, decimals: number = 2): number {
    return +value.toFixed(decimals);
  }

  /**
   * Calculates the money amount to be proportionally assigned to a given part of a total.
   *
   * This is common calculation that should be reused to have the same result in every
   * place where it is used. The final value will have as little error as possible and a
   * currency precision.
   *
   * If the total is 0 then the proportion will be 0. Signs in either the part or total
   * will be ignored although the sign of the amount will be used.
   *
   * @param amount total amount to split
   * @param part the value of a given part
   * @param total the total value of all parts
   */
  static proportion(amount: number, part: number, total: number): number {
    if (total == 0) {
      return 0;
    }

    return this.currency(amount * Math.abs(part / total));
  }

  /**
   * Formats a given value as a currency, using the browsers default locale.
   *
   * @param value the currency value to format
   * @param options options affecting the format, like the currency
   */
  static format(value: number, options: CurrencyFormatOptions): string {
    const currency = options.currency;
    const bchOptions = {
      currencyDisplay: "code",
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    };

    const finalOptions = Object.assign(
      { style: "currency", currency },
      currency == "BCH" ? bchOptions : {}
    );

    return value.toLocaleString(undefined, finalOptions);
  }

  static code(currency: string) {
    const value = (1).toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumSignificantDigits: 1
    });

    return value.replace("1", "");
  }

}
