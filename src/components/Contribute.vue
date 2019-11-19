<template>
  <div class="contribute">
    <h1 class="header">
      <span v-if="paymentPeriod.paid">
        Contributed {{ asCurrency(payment) }}
        (<a target="_blank" v-bind:href="'https://blockchair.com/bitcoin-cash/transaction/' + paymentTxId">view transaction</a>)
      </span>
      <span v-else>Contribute</span>
    </h1>
    <div class="body">
      <form class="payment" v-if="!paymentPeriod.paid">
        <fieldset>
          <legend>Amount</legend>
          <button v-on:click.prevent="payment = 1.00">{{ asCurrency(1) }}</button>
          <button v-on:click.prevent="payment = 2.00">{{ asCurrency(2) }}</button>
          <button v-on:click.prevent="payment = 5.00">{{ asCurrency(5) }}</button>
          <button v-on:click.prevent="payment = 10.00">{{ asCurrency(10) }}</button>
          <button v-on:click.prevent="payment = 20.00">{{ asCurrency(20) }}</button>
          <strong>$</strong><input type="number" min="1.00" step="0.10" v-model.number="payment"
                  placeholder="0.00"/>
        </fieldset>
        <div class="actions">
          <button v-on:click.prevent="startPayment" v-bind:disabled="paying">
            <fa-icon icon="coins"/> Pay
          </button>
        </div>
      </form>
      <usage v-bind:period="paymentPeriod">
        <template v-slot:details="{ producer }">
          | {{ asCurrency(producerValue(producer)) }}
        </template>
        <template v-slot:actions="{ producer }">
          <a v-on:click="excludeProducer(producer)" class="button action">
            <fa-icon icon="ban"/>
          </a>
        </template>
      </usage>
    </div>
    <div class="paymodal" v-if="paying" v-on:click="stopPayment">
      <div class="paybox" v-on:click.stop>
        <div class="paytitle">
          Payment
        </div>
        <div clas="paytext">
          Scan the QR Code with a wallet supporting payment codes (BIP70) and complete payment.
          You can also use one of the buttons below to use a local application.
        </div>
        <div class="qrcontainer">
          <div class="qrcode">
            <img v-bind:src="paymentDataURL">
          </div>
          <div class="qrmessage" v-if="paymentTxId">
            Received!
          </div>
        </div>
        <div class="payinfo">
          {{ asCurrency(payment) }} = {{ asCurrency(paymentBCH, "BCH") }}
        </div>
        <div class="paybuttons">
          <button>
            Pay with Regular Wallet
          </button>
          <button>
            Pay with Badger Wallet
          </button>
          <button>
            Copy Payment Address
          </button>
        </div>
      </div>
    </div> 
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, Settings, UsedPayable } from '../lib/State';
import { UiUsage, UiProducer } from "../lib/Ui";
import { Currency } from '../lib/Currency';
import * as QRCode from "qrcode";

interface TxOut {
  address: string,
  bchAmount: number
}

function requestPaymentURL(outputs: TxOut[], callback: (Error, string) => void) {
  callback(null, "bitcoincash:?r=http://pay.m4ktub.ws/r/afA3rGvdd");
}

function waitForPaymentToURL(url: string, callback: (boolean, string) => void) {
  setTimeout(() => {
    callback(true, "008594d81e503033791d569e28ad16d62947d26a2c0f3ce06aaf79cf4eadd74c");
  }, 60 * 1000);
}

function flatten<T>(aa: T[][]): T[] {
  return aa.reduce((acc, value) => acc.concat(value));
}

export default {
  data() {
    return {
      state: new PersistentState(),
      period: null,
      payment: 5.00,
      paymentBCH: null,
      paying: false,
      paymentDataURL: "",
      paymentTxId: null
    }
  },
  methods: {
    async startPayment() {
      const state: PersistentState = this.state;

      // start payment process
      this.paying = true;

      // get rate and calculate total BCH value
      const rate = state.settings.rate;
      this.paymentBCH = Currency.currency(rate * this.payment, 8);

      // collect all used payables
      const usage = this.paymentUsage as UiUsage;
      let used = flatten(usage.producers.map(p => p.contents));

      // collect outputs for payment
      let outputs = [] as TxOut[];

      const totalSeconds = usage.seconds;
      used.forEach(u => {
        const address = u.payable.address; 
        const fiatAmount = Currency.proportion(this.payment, u.seconds, totalSeconds);
        const bchAmount = Currency.currency(rate * fiatAmount, 8);

        // save fiat amount now to fix value during payment
        u.paid = fiatAmount;

        outputs.push({ address, bchAmount });
      });

      // remove outputs bellow dust level
      outputs = outputs.filter(o => o.bchAmount > 0.00000546);

      // request a payment URL for the collected outputs
      requestPaymentURL(outputs, (err, url) => {
        // generate qrcode for URL
        QRCode.toDataURL(url, (err, dataURL) => {
          this.paymentDataURL = dataURL;
        });

        // wait for payment
        waitForPaymentToURL(url, (err, txid) => {
          this.paymentTxId = txid;
          
          state.currentPeriod.paid = true;
          //this.completePayment();

          setTimeout(() => {
            this.paying = false;
          }, 1 * 2000);
        });
      });
    },
    stopPayment() {
      this.paying = false;
    },
    completePayment() {
      let state: PersistentState = this.state;

      // save period to lock ui (see `.paymentPeriod´)
      this.period = state.currentPeriod;

      // mark period as paid
      state.currentPeriod.paid = true;

      // start a new blank period and save state
      state.startNewPeriod();
      state.save();
    },
    producerValue(producer: UiProducer): number {
      let usage = this.paymentUsage as UiUsage;
      let total = usage.seconds;
      return Currency.proportion(this.payment, producer.seconds, total);
    },
    asCurrency(value: number, code?: string) {
      let state: PersistentState = this.state;
      let currency = code ? code : state.settings.currency;
      return Currency.format(value, { currency });
    },
    excludeProducer(producer: UiProducer) {
      let state: PersistentState = this.state;
      if (state.settings.excludedUrls.indexOf(producer.url) < 0) {
        state.settings.excludedUrls.push(producer.url);
      }
      state.save();
    }
  },
  computed: {
    paymentPeriod() {
      let state: PersistentState = this.state;
      return this.period || state.currentPeriod;
    },
    paymentUsage() {
      let state: PersistentState = this.state;
      let period: Period = this.paymentPeriod;
      return new UiUsage(period.usage, state.settings);
    }
  }
}
</script>

<style>
</style>
