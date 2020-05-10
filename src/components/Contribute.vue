<template>
  <div class="contribute">
    <h1 class="header">
      <span v-if="paymentPeriod.paid">
        {{ t("contribute_header_paid") }} {{ asCurrency(payment) }}
        (<a target="_blank" v-bind:href="'https://blockchair.com/bitcoin-cash/transaction/' + paymentTxId">{{ t("contribute_title_view_tx") }}</a>)
      </span>
      <span v-else>{{ t("contribute_header_normal") }}</span>
    </h1>
    <div class="body">
      <form class="payment" v-if="!paymentPeriod.paid">
        <fieldset>
          <legend>{{ t("contribute_amount_label") }}</legend>
          <button v-on:click.prevent="payment = 1.00">{{ asCurrency(1) }}</button>
          <button v-on:click.prevent="payment = 2.00">{{ asCurrency(2) }}</button>
          <button v-on:click.prevent="payment = 5.00">{{ asCurrency(5) }}</button>
          <button v-on:click.prevent="payment = 10.00">{{ asCurrency(10) }}</button>
          <button v-on:click.prevent="payment = 20.00">{{ asCurrency(20) }}</button>
          <strong>{{ currencyCode }}</strong><input type="number" min="1.00" step="0.10" v-model.number="payment"
                  placeholder="0.00"/>
        </fieldset>
        <div class="actions">
          <button v-on:click.prevent="startPayment" v-bind:disabled="!hasUsage || paying">
            <fa-icon icon="coins"/> {{ t("contribute_pay") }}
          </button>
        </div>
      </form>
      <usage ref="manualUsage" v-if="hasUsage" v-bind:state="state" v-bind:period="paymentPeriod" show="manual">
        <template v-slot:details="{ producer }">
          | {{ currencyCode }}<input type="number" min="0.00" step="0.10" placeholder="0.00"
                                     v-model.number="producer.paid" 
                                     v-bind:disabled="paymentPeriod.paid"
                                     v-on:change="save"/>
        </template>
        <template v-slot:actions="{ producer, usage }">
          <a v-on:click="toggleManual(usage, producer)"
             v-bind:class="{ button: true, action: true, active: producer.manual }"
             v-bind:title="producer.manual ? t('action_toggle_automatic') : t('action_toggle_manual')">
            <fa-icon icon="pencil-alt"/>
          </a>
          <a v-on:click="excludeProducer(producer)" class="button action" v-bind:title="t('action_ban')">
            <fa-icon icon="ban"/>
          </a>
        </template>
      </usage>
      <usage ref="autoUsage" v-if="hasUsage" v-bind:state="state" v-bind:period="paymentPeriod" show="automatic">
        <template v-slot:details="{ producer, usage }">
          | {{ asCurrency(producerValue(usage, producer)) }}
        </template>
        <template v-slot:actions="{ producer, usage }">
          <a v-on:click="toggleManual(usage, producer)"
             v-bind:class="{ button: true, action: true, active: producer.manual }"
             v-bind:title="producer.manual ? t('action_toggle_automatic') : t('action_toggle_manual')"
             >
            <fa-icon icon="pencil-alt"/>
          </a>
          <a v-on:click="excludeProducer(producer)" class="button action" v-bind:title="t('action_ban')">
            <fa-icon icon="ban"/>
          </a>
        </template>
      </usage>
      <div class="empty" v-else>
        {{ t("contribute_empty") }}
      </div>
    </div>
    <div class="paymodal" v-if="paying" v-on:click="stopPayment">
      <div class="paybox" v-on:click.stop>
        <div class="paytitle">
          {{ t("contribute_pay_title") }}
        </div>
        <div class="paytext">
          {{ t("contribute_pay_text") }}
        </div>
        <div class="qrcontainer">
          <div class="qrcode">
            <img v-on:click="copyPaymentURL" v-bind:src="paymentDataURL">
          </div>
          <div class="qrmessage" v-if="paymentTxId">
            {{ t("contribute_pay_received") }}
          </div>
          <div class="qrcopy">
            <input name="qrcopyinput" ref="qrcopyinput" v-bind:value="paymentURL" />
            <span v-show="paymentURLCopied">
              {{ t("contribute_pay_copy_message") }}
            </span>
            <button v-on:click="copyPaymentURL">
              <fa-icon icon="copy"/> {{ t("contribute_pay_copy") }}
            </button>
          </div>
        </div>
        <div class="payinfo">
          {{ asCurrency(finalPayment) }} / {{ asCurrency(paymentBCH, "BCH") }}
        </div>
      </div>
    </div> 
  </div>
</template>

<script lang="ts">
import { State, Period, Settings, UsedPayable } from '../lib/State';
import { UiUsage, UiProducer } from "../lib/Ui";
import { Currency } from "../lib/Currency";
import { TxOut, PaymentService, BitboxPaymentService } from '../lib/Payment';
import { I18n } from '../lib/I18n';
import * as QRCode from "qrcode";
import { StateRequestMessage, MessageType, StateUpdateMessage, Message } from '../lib/Messages';

var state = new State();

chrome.runtime.sendMessage(new StateRequestMessage());
chrome.runtime.onMessage.addListener(onRuntimeMessage);

function onRuntimeMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    let msg = message as Message;
    switch (msg.type) {
        case MessageType.StateUpdate:
            let stateMsg = msg as StateUpdateMessage;
            state.updateFrom(stateMsg.state);

            if (!state.seed) {
              state.seed = BitboxPaymentService.generateSeed();
              chrome.runtime.sendMessage(new StateUpdateMessage(state));
            }
            break;
    }
}

function getRate() {
  if (Object.keys(state.currentPeriod.usage).length) {
    console.log("getting rate... abort")
    setTimeout(getRate, 1000);
  }

  console.log("getting rate... proceed")
  BitboxPaymentService.getRate(state.settings.currency, (rate) => {
    console.log("getting rate... done")
    state.settings.rate = rate / 100;
    chrome.runtime.sendMessage(new StateUpdateMessage(state));
  });
}

getRate();

function flatten<T>(aa: T[][]): T[] {
  return aa.reduce((acc, value) => acc.concat(value));
}

export default {
  data() {
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
    };
  },
  mounted() {
    // set page title
    document.title = I18n.translate("contribute_title", [I18n.translate("manifest_short_name")]);
  },
  methods: {
    startPayment() {
      const state: State = this.state;

      // start payment process
      this.paying = true;

      // get rate and calculate total BCH value
      const rate = state.settings.rate;
      this.paymentBCH = Currency.currency(this.finalPayment / rate, 8);

      // collect all used payables
      const usage = this.paymentUsage as UiUsage;
      const used = flatten(usage.producers.map(p => p.contents));
      const manual = usage.manualTotals();

      // collect outputs for payment
      let outputMap: { [key: string]: TxOut } = {};

      const totalSeconds = usage.seconds;
      used.forEach(u => {
        // calculate proportional fiat amount, when not manual
        if (!u.manual) {
          const value = Math.max(0, this.finalPayment - manual.paid);
          u.paid = Currency.proportion(value, u.seconds, totalSeconds);
        }

        // calculate BCH amount
        const bchAmount = Currency.currency(u.paid / rate, 8);
        
        // add value to outputs, possibly accumulating in an existing address
        const address = u.payable.address; 
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
      let state: State = this.state;

      // save period to lock ui (see `.paymentPeriod´)
      this.period = state.currentPeriod;

      // mark period as paid
      state.currentPeriod.paid = true;

      // start a new blank period 
      state.startNewPeriod();

      // copy manual constributions into the next period
      let oldPeriod = state.previousPeriods[state.previousPeriods.length - 1];
      let newPeriod = state.currentPeriod;

      Object.values(oldPeriod.usage)
        .filter(u => u.manual)
        .forEach(u => {
          const newUsage = newPeriod.trackUsage(u.payable);
          newUsage.manual = true;
          newUsage.paid = u.paid;
        });

      // save state
      chrome.runtime.sendMessage(new StateUpdateMessage(state));
    },
    producerValue(usage: UiUsage, producer: UiProducer): number {
      const manual = usage.manualTotals();
      const value = Math.max(0, this.payment - manual.paid);
      return Currency.proportion(value, producer.seconds, usage.seconds - manual.seconds);
    },
    asCurrency(value: number, code?: string) {
      let state: State = this.state;
      let currency = code ? code : state.settings.currency;
      return Currency.format(value, { currency });
    },
    excludeProducer(producer: UiProducer) {
      let state: State = this.state;
      if (state.settings.excludedUrls.indexOf(producer.url) < 0) {
        state.settings.excludedUrls.push(producer.url);
      }
      chrome.runtime.sendMessage(new StateUpdateMessage(state));
    },
    toggleManual(usage: UiUsage, producer: UiProducer) {
      let state: State = this.state;
      
      if (producer.manual) {
        // make automatic, reset paid valie
        producer.paid = 0;
        producer.manual = false;
      } else {
        // make manual, start with automatic paid value
        producer.paid = this.producerValue(usage, producer);
        producer.manual = true;
      }

      chrome.runtime.sendMessage(new StateUpdateMessage(state));
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
    },
    save() {
      let state: State = this.state;
      chrome.runtime.sendMessage(new StateUpdateMessage(state));
    },
    t(key: string) {
      return I18n.translate(key);
    }
  },
  computed: {
    paymentPeriod() {
      let state: State = this.state;
      return this.period || state.currentPeriod;
    },
    paymentUsage() {
      let usage = this.$refs.autoUsage;
      return usage.visibleUsage as UiUsage;
    },
    hasUsage() {
      let period = this.paymentPeriod as Period;
      return Object.keys(period.usage).length > 0;
    },
    currencyCode() {
      let state: State = this.state;
      return Currency.code(state.settings.currency);
    },
    finalPayment() {
      const usage = this.paymentUsage as UiUsage;
      const manual = usage.manualTotals();
      
      const allAuto = usage.producers.every(p => p.manual);
      if (allAuto) {
        return manual.paid;
      } else {
        return Math.max(manual.paid, this.payment);
      }
    }
  }
}
</script>

<style>
</style>
