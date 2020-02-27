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
          <button v-on:click.prevent="startPayment" v-bind:disabled="!hasUsage || paying">
            <fa-icon icon="coins"/> Pay
          </button>
        </div>
      </form>
      <usage ref="usage" v-if="hasUsage" v-bind:period="paymentPeriod">
        <template v-slot:details="{ producer, usage }">
          | {{ asCurrency(producerValue(usage, producer)) }}
        </template>
        <template v-slot:actions="{ producer }">
          <a v-on:click="excludeProducer(producer)" class="button action">
            <fa-icon icon="ban"/>
          </a>
        </template>
      </usage>
      <div class="empty" v-else>
        No Bitcoin Cash supporting sites have been visited in the active period.
      </div>
    </div>
    <div class="paymodal" v-if="paying" v-on:click="stopPayment">
      <div class="paybox" v-on:click.stop>
        <div class="paytitle">
          Payment
        </div>
        <div class="paytext">
          To start payment please scan the QR Code with a wallet.
          You can also use one of the buttons below to use a local application.
        </div>
        <div class="qrcontainer">
          <div class="qrcode">
            <img v-on:click="copyPaymentURL" v-bind:src="paymentDataURL">
          </div>
          <div class="qrmessage" v-if="paymentTxId">
            Received!
          </div>
          <div class="qrcopy">
            <input name="qrcopyinput" ref="qrcopyinput" v-bind:value="paymentURL" />
            <span v-show="paymentURLCopied">
              Copied
            </span>
            <button v-on:click="copyPaymentURL">
              <fa-icon icon="copy"/> Click to copy
            </button>
          </div>
        </div>
        <div class="payinfo">
          {{ asCurrency(payment) }} / {{ asCurrency(paymentBCH, "BCH") }}
        </div>
      </div>
    </div> 
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, Settings, UsedPayable } from '../lib/State';
import { UiUsage, UiProducer } from "../lib/Ui";
import { Currency } from "../lib/Currency";
import { TxOut, PaymentService, BitboxPaymentService } from '../lib/Payment';
import * as QRCode from "qrcode";

function flatten<T>(aa: T[][]): T[] {
  return aa.reduce((acc, value) => acc.concat(value));
}

export default {
  data() {
    // initialize persistent state ensuring that a seed is available
    const state = new PersistentState(loaded => {
      if (!loaded.seed) {
        loaded.seed = BitboxPaymentService.generateSeed();
        loaded.save();
      }
    });
    
    return {
      state,
      service: null,
      period: null,
      payment: 5.00,
      paymentBCH: 0.0,
      paying: false,
      paymentURL: "",
      paymentURLCopied: false,
      paymentDataURL: "",
      paymentTxId: null
    }
  },
  mounted() {
    const state: PersistentState = this.state;
    BitboxPaymentService.getRate(state.settings.currency, (rate) => {
      state.settings.rate = rate / 100;
      state.save();
    });
  },
  methods: {
    startPayment() {
      const state: PersistentState = this.state;

      // start payment process
      this.paying = true;

      // get rate and calculate total BCH value
      const rate = state.settings.rate;
      this.paymentBCH = Currency.currency(this.payment / rate, 8);

      // collect all used payables
      const usage = this.paymentUsage as UiUsage;
      let used = flatten(usage.producers.map(p => p.contents));

      // collect outputs for payment
      let outputMap: { [key: string]: TxOut } = {};

      const totalSeconds = usage.seconds;
      used.forEach(u => {
        const address = u.payable.address; 
        const fiatAmount = Currency.proportion(this.payment, u.seconds, totalSeconds);
        const bchAmount = Currency.currency(fiatAmount / rate, 8);

        // save fiat amount now to fix value during payment
        u.paid = fiatAmount;

        if (outputMap.hasOwnProperty(address)) {
          outputMap[address].bchAmount += bchAmount;
        } else {
          outputMap[address] = { address, bchAmount }
        }
      });

      // remove outputs bellow dust level
      let outputs = Object.values(outputMap).filter(o => o.bchAmount > 0.00000546);

      // reuse or instantiate payment service
      const index = state.previousPeriods.length;
      this.service = this.service || new BitboxPaymentService(state.seed, index);

      // request a payment URL for the collected outputs
      this.service.requestPaymentUrl(outputs, (err, url) => {
        this.paymentURL = url;

        // generate qrcode for URL
        QRCode.toDataURL(url, { width: 300 }, (err, dataURL) => {
          this.paymentDataURL = dataURL;
        });

        // wait for payment
        this.service.waitForPaymentToUrl(url, (err, txid) => {
          // save transaction id
          this.paymentTxId = txid;
          
          // mark payment completed
          this.completePayment();

          // rmove modal after a few seconds
          setTimeout(() => {
             this.paying = false;
          }, 1 * 2000);
        });
      });
    },
    stopPayment() {
      const service: PaymentService = this.service;
      service.cancelPaymentToUrl(this.paymentURL, (error) => {
        this.paying = false;
        
        if (error) {
          console.log(error)
        }
      });
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
    producerValue(usage: UiUsage, producer: UiProducer): number {
      return Currency.proportion(this.payment, producer.seconds, usage.seconds);
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
    },
    copyPaymentURL() {
      // get input element
      let input = this.$refs.qrcopyinput as HTMLInputElement;
      
      // make it visible 
      input.style.width = "1px";

      // copy
      input.select();
      document.execCommand("copy", true, null);

      // hide it again
      input.style.width = "0px";
      
      // briefly show copied message
      this.paymentURLCopied = true;
      setTimeout(() => this.paymentURLCopied = false, 5 * 1000);
    }
  },
  computed: {
    paymentPeriod() {
      let state: PersistentState = this.state;
      return this.period || state.currentPeriod;
    },
    paymentUsage() {
      let usage = this.$refs.usage;
      return usage.visibleUsage as UiUsage;
    },
    hasUsage() {
      let period = this.paymentPeriod as Period;
      return Object.keys(period.usage).length > 0;
    }
  }
}
</script>

<style>
</style>
