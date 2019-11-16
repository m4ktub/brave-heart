<template>
  <div class="contribute">
    <h1 class="header">
      <span v-if="paymentPeriod.paid">Contributed {{ payment | asCurrency }}</span>
      <span v-else>Contribute</span>
    </h1>
    <div class="body">
      <form class="payment" v-if="!paymentPeriod.paid">
        <fieldset>
          <legend>Amount</legend>
          <button v-:click.prevent="payment = 1.00">{{ 1 | asCurrency }}</button>
          <button v-on:click.prevent="payment = 2.00">{{ 2 | asCurrency }}</button>
          <button v-on:click.prevent="payment = 5.00">{{ 5 | asCurrency }}</button>
          <button v-on:click.prevent="payment = 10.00">{{ 10 | asCurrency }}</button>
          <button v-on:click.prevent="payment = 20.00">{{ 20 | asCurrency }}</button>
          <strong>$</strong><input type="number" min="1.00" step="0.10" v-model.number="payment"
                  placeholder="0.00"/>
        </fieldset>
        <div class="actions">
          <button v-on:click="pay">
            <fa-icon icon="coins"/> Pay
          </button>
        </div>
      </form>
      <usage v-bind:period="paymentPeriod">
        <template v-slot:details="{ producer }">
          | {{ producerValue(producer) | asCurrency }}
        </template>
        <template v-slot:actions="{ producer }">
          <a v-on:click="excludeProducer(producer)" class="button action">
            <fa-icon icon="ban"/>
          </a>
        </template>
      </usage>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, Settings } from "../lib/State";
import { UiUsage, UiProducer } from "../lib/Ui";
import { Currency } from '../lib/Currency';

const currency = new Currency({ currency: 'USD' });

export default {
  data() {
    return {
      state: new PersistentState(),
      payment: 5.00
    }
  },
  methods: {
    pay() {
      let state: PersistentState = this.state;
      this.period = state.currentPeriod;
      state.currentPeriod.paid = true;
      state.startNewPeriod();
      state.save();
    },
    producerValue(producer: UiProducer): number {
      let usage: UiUsage = this.paymentUsage;
      let total = usage.seconds;
      return currency.proportion(this.payment, producer.seconds, total);
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
  },
  filters: {
    asCurrency(value) {
      return currency.format(value);
    }
  }
}
</script>

<style>
</style>
