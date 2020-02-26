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

const Bitbox = {
  Address: new Address(),
  Mnemonic: new Mnemonic(),
  HDNode: new HDNode(),
  BitcoinCash: new BitcoinCash(),
  RawTransactions: new RawTransactions(),
  Price: new Price()
}

export class BitboxPaymentService implements PaymentService {

  private address: string;
  private addressNode: any;
  private outputs: TxOut[];
  private eventSource: EventSource;

  constructor(mnemonic: string, index: number) {
    const seed = Bitbox.Mnemonic.toSeed(mnemonic);
    const root = Bitbox.HDNode.fromSeed(seed);

    this.addressNode = root.derivePath(`m/44'/145'/0'/0/${index}`);
    this.address = Bitbox.HDNode.toCashAddress(this.addressNode);
  }

  static generateSeed(): string {
    const mnemonic = new Mnemonic();
    return mnemonic.generate(128);
  }

  static getRate(currency: string, callback: (rate: number) => void): void {
    Bitbox.Price.current(currency).then(callback);
  }

  private createMempoolQuery(address: string): object {
    return {
      v: 3,
      q: {
        find: {
          "out.e.a": address
        }
      },
      r: {
        "f": `[ .[] | { txid: .tx.h, out: [ .out[] | select(.e.a == \\"${address}\\") | . | { i: .i, value: .e.v } ] }]`
      }
    };
  }

  requestPaymentUrl(outputs: TxOut[], callback: (error: Error, bchUrl: string) => void): void {
    this.outputs = outputs;
    const amount = outputs.reduceRight((acc, output) => acc + output.bchAmount, 0);
    callback(null, `${this.address}?amount=${amount.toFixed(8)}`);
  }

  cancelPaymentToUrl(bchUrl: string, callback: (error: Error) => void): void {
    if (this.eventSource == null) {
      return;
    }

    if (this.eventSource.readyState == this.eventSource.CLOSED) {
      return;
    }

    this.eventSource.close();
  }

  waitForPaymentToUrl(url: string, callback: (error: Error, txId: string) => void): void {
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

      // create tx builder
      const builder = new TransactionBuilder();

      // add inputs to transaction and collect info
      var satoshis = 0;
      var inputCount = 0;

      message.data.forEach((tx: any) => {
        tx.out.forEach((output: any) => {
          builder.addInput(tx.txid, output.i);
          inputCount += 1;
          satoshis += output.value;
        });
      });

      // deduce fees
      const bytes = Bitbox.BitcoinCash.getByteCount({ P2PKH: inputCount }, { P2PKH: this.outputs.length });
      satoshis -= bytes;

      // add outputs and account for dust
      this.outputs.forEach(output => {
        const outValue = Bitbox.BitcoinCash.toSatoshi(output.bchAmount);
        if (satoshis > (outValue + 546)) {
          builder.addOutput(output.address, outValue);
          satoshis -= outValue;
        } else {
          builder.addOutput(output.address, satoshis);
          satoshis = 0;
        }
      });

      // sign transaction
      const keyPair = Bitbox.HDNode.toKeyPair(this.addressNode);
      message.data.forEach((tx: any) => {
        tx.out.forEach((output: any, i) => {
          builder.sign(i, keyPair, undefined, builder.hashTypes.SIGHASH_ALL, output.value);
        });
      });

      // send transaction
      const finalTx = builder.build();
      const hex = finalTx.toHex();

      Bitbox.RawTransactions.sendRawTransaction(hex)
        .then(finalTxId => callback(null, finalTxId))
        .catch(reason => callback(new Error(reason), null));
    };
  }

}
