import {
  Address,
  BitcoinCash,
  HDNode,
  Mnemonic,
  Price,
  RawTransactions,
  TransactionBuilder,
} from "bitbox-sdk";

export interface TxOut {
  address: string,
  bchAmount: number
}

interface TxIn {
  txid: string,
  index: number,
  satoshis: number
}

export interface PaymentService {
  requestPaymentUrl(outputs: TxOut[], callback: (error: Error, bchUrl: string) => void): void;
  waitForPaymentToUrl(bchUrl: string, callback: (error: Error, txId: string) => void): void;
  cancelPaymentToUrl(bchUrl: string, callback: (error: Error) => void): void;
}

export class MockPaymentService implements PaymentService {
  requestPaymentUrl(outputs: TxOut[], callback: (error: Error, bchUrl: string) => void): void {
    callback(null, "bitcoincash:qz6tuqwe2xz3rvp9h8zlpjg86x4xmy4u5v48ue2k96?amount=0.001");
  }

  waitForPaymentToUrl(url: string, callback: (error: Error, txId: string) => void): void {
    setTimeout(() => {
      callback(null, "008594d81e503033791d569e28ad16d62947d26a2c0f3ce06aaf79cf4eadd74c");
    }, 10 * 1000);
  }

  cancelPaymentToUrl(bchUrl: string, callback: (error: Error) => void): void {
  }

}

class BasePaymentService implements PaymentService {

  protected address: string;
  protected outputs: TxOut[];
  protected eventSource: EventSource;

  constructor(address: string) {
    this.address = address;
  }

  requestPaymentUrl(outputs: TxOut[], callback: (error: Error, bchUrl: string) => void): void {
    // fix: sometimes scanners unsupported addresses and we must ensure those ignored
    this.outputs = outputs.filter(o => this.isAddressAccepted(o.address));

    const amount = this.outputs.reduceRight((acc, output) => acc + output.bchAmount, 0);
    callback(null, `${this.address}?amount=${amount.toFixed(8)}`);
  }

  protected isAddressAccepted(address: string): boolean {
    return true;
  }

  protected createMempoolQuery(address: string): object {
    const noPrefixAddress = address.split(":").pop();
    return {
      v: 3,
      q: {
        find: {
          "out.e.a": noPrefixAddress
        }
      },
      r: {
        "f": `[ .[] | { txid: .tx.h, out: [ .out[] | select(.e.a == \"${noPrefixAddress}\") | . | { i: .i, value: .e.v } ] }]`
      }
    };
  }

  waitForPaymentToUrl(bchUrl: string, callback: (error: Error, txId: string) => void): void {
    const address = Bitbox.Address.toCashAddress(this.address, false);
    const query = this.createMempoolQuery(address);

    const base64Query = btoa(JSON.stringify(query));
    this.eventSource = new EventSource(`https://bitsocket.bch.sx/s/${base64Query}`);
    this.eventSource.onmessage = (ev: MessageEvent) => {
      // parse data string
      const message = JSON.parse(ev.data);

      // check message
      if (message.type !== "mempool" || message.data.length == 0) {
        return;
      }

      // close event source
      this.eventSource.close();

      // parse transactions into array of TxIn
      const inputs = message.data.flatMap((tx: any) => {
        return tx.out.map((output: any): TxIn => {
          return {
            txid: tx.txid,
            index: output.i,
            satoshis: output.value
          }
        });
      });

      // build final transaction
      try {
        this.doFinalPayment(inputs, callback);
      } catch (e) {
        callback(new Error(e), null);
      }
    };
  }

  protected doFinalPayment(utxos: TxIn[], callback: (error: Error, txId: string) => void): void {
    throw new Error("Method not implemented.");
  }

  cancelPaymentToUrl(bchUrl: string, callback: (error: Error) => void): void {
    if (this.eventSource != null) {
      this.eventSource.close();
    }

    callback(null);
  }

}

const Bitbox = {
  Address: new Address(),
  Mnemonic: new Mnemonic(),
  HDNode: new HDNode(),
  BitcoinCash: new BitcoinCash(),
  RawTransactions: new RawTransactions(),
  Price: new Price()
}

export class BitboxPaymentService extends BasePaymentService {

  private addressNode: any;

  constructor(mnemonic: string, index: number) {
    const seed = Bitbox.Mnemonic.toSeed(mnemonic);
    const root = Bitbox.HDNode.fromSeed(seed);
    const addressNode = root.derivePath(`m/44'/145'/0'/0/${index}`);
    const address = Bitbox.HDNode.toCashAddress(addressNode);

    super(address);
    this.addressNode = addressNode;
  }

  static generateSeed(): string {
    const mnemonic = new Mnemonic();
    return mnemonic.generate(128);
  }

  static getRate(currency: string, callback: (rate: number) => void): void {
    Bitbox.Price.current(currency).then(callback);
  }

  protected isAddressAccepted(address: string): boolean {
    return Bitbox.Address.detectAddressNetwork(address) === "mainnet";
  }

  protected doFinalPayment(utxos: TxIn[], callback: (error: Error, txId: string) => void): void {
    // create tx builder
    const builder = new TransactionBuilder();

    // add inputs to transaction and collect info
    var satoshis = 0;
    var inputCount = 0;

    utxos.forEach(utxo => {
        builder.addInput(utxo.txid, utxo.index);
        inputCount += 1;
        satoshis += utxo.satoshis;
    });

    // deduce fees
    const bytes = Bitbox.BitcoinCash.getByteCount({ P2PKH: inputCount }, { P2PKH: this.outputs.length });
    satoshis -= bytes;

    // add outputs to transaction
    this.outputs.forEach(output => {
      // fix: the BCH amount can be inexact (more than 8 decimal places)
      //      and the conversion to satoshis may result in a decimal number.
      //      Rounding ensures we are dealing with a whole number of satoshis.
      const outValue = Math.round(Bitbox.BitcoinCash.toSatoshi(output.bchAmount));

      // check if the remaining value will be above dust
      if (satoshis > (outValue + 546)) {
        builder.addOutput(output.address, outValue);
        satoshis -= outValue;
      } else if (satoshis > 0) {
        builder.addOutput(output.address, satoshis);
        satoshis = 0;
      }
    });

    // sign transaction
    const keyPair = Bitbox.HDNode.toKeyPair(this.addressNode);
    utxos.forEach((utxo, i) => {
      builder.sign(i, keyPair, undefined, builder.hashTypes.SIGHASH_ALL, utxo.satoshis);
    });

    // send transaction
    const finalTx = builder.build();
    const hex = finalTx.toHex();

    Bitbox.RawTransactions.sendRawTransaction(hex)
      .then(finalTxId => callback(null, finalTxId))
      .catch(reason => callback(new Error(reason), null));
  }

}
