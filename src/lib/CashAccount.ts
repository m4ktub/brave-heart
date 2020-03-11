import { CashAccounts as BitboxCashAccounts } from "bitbox-sdk";

type PaymentType = "Key Hash" | "Script Hash";

interface CashAccountPaymentData {
  type: PaymentType;
  address: string;
}

export class CashAccount {

  public static RegExp = new RegExp("(.{1,99})#([0-9]{1,7})(\.([0-9]{1,10}))?;?", "u");

  readonly service: BitboxCashAccounts;

  constructor() {
    this.service = new BitboxCashAccounts();
  }

  async resolve(text: string): Promise<string | null> {
    const match = CashAccount.RegExp.exec(text);
    console.log("match", match);
    if (! match) {
      return null;
    }

    const name = match[1];
    const number = Number.parseInt(match[2]);
    const collision = match[4] ? Number.parseInt(match[4]) : null;
    const result = await this.service.lookup(name, number, collision);
    // HACK: Bitbox SDK v8.11 has wrong type for payment field
    const payment = (result.information.payment as any[]) as CashAccountPaymentData[];
    const method = payment.find(method =>method.type == "Key Hash" || method.type == "Script Hash");

    return method?.address || null;
  }

}
