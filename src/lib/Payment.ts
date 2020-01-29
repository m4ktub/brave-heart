export interface TxOut {
  address: string,
  bchAmount: number
}

export interface PaymentService {
  requestPaymentUrl(outputs: TxOut[], callback: (error: Error, bchUrl: string) => void): void;
  waitForPaymentToUrl(url: string, callback: (error: Error, txId: string) => void): void;
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

}
