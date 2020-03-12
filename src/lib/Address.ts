import { CashAccount } from './CashAccount';
import { asyncMapFind } from "./Functions";
import { Address as BitboxAddress } from 'bitbox-sdk';

export type Address = string;

export class AddressExtractor {

  private static AddrRegExp = new RegExp("(bitcoincash:)?[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}|(BITCOINCASH:)?[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]{42,}", "g");
  private static AccountRegExp = new RegExp(CashAccount.RegExp, "g");
  private static CashAccountResolver = new CashAccount();
  private static AddressUtil = new BitboxAddress();

 async extract(text: string): Promise<Address> {
    const addressMatches = text.match(AddressExtractor.AddrRegExp) || [];
    const address = addressMatches.find(AddressExtractor.AddressUtil.isCashAddress) || null;
    if (address) {
      return address;
    }

    const accountMatches = text.match(AddressExtractor.AccountRegExp) || [];
    const resolveAccount = (text: string) => AddressExtractor.CashAccountResolver.resolve(text);
    const notNull = (address: Address) => address != null;
    return asyncMapFind(accountMatches, resolveAccount, notNull);
  }

}
