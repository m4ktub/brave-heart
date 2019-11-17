<template>
  <div class="contribute">
    <h1 class="header">
      <span v-if="paymentPeriod.paid">Contributed {{ asCurrency(payment) }}</span>
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
          <button v-on:click="pay">
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
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, Settings } from '../lib/State';
import { UiUsage, UiProducer } from "../lib/Ui";
import { Currency } from '../lib/Currency';

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

      // make period as paid and updated paid values
      state.currentPeriod.pay(this.payment);

      // save period to lock ui (see `.paymentPeriod´)
      this.period = state.currentPeriod;

      // start a new period without usage and save state
      state.startNewPeriod();
      state.save();
    },
    producerValue(producer: UiProducer): number {
      let usage: UiUsage = this.paymentUsage;
      let total = usage.seconds;
      return Currency.proportion(this.payment, producer.seconds, total);
    },
    asCurrency(value: number) {
      let state: PersistentState = this.state;
      return Currency.format(value, { currency: state.settings.currency });
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
