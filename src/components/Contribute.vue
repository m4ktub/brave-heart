<template>
  <div class="contribute">
    <h1 class="header">Contribute</h1>
    <div class="body">
      <div class="payment">
        Payment options
      </div>
      <usage v-bind:period="paymentPeriod">
      </usage>
      <div class="buttons">
        <button v-on:click="pay" :disabled="paymentPeriod.paid">Pay</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState, Settings } from "../lib/State";

export default {
  data() {
    return {
      state: new PersistentState()
    }
  },
  methods: {
    pay() {
      let state: PersistentState = this.state;
      this.period = state.currentPeriod;
      state.currentPeriod.paid = true;
      state.startNewPeriod();
      state.save();
    }
  },
  computed: {
    paymentPeriod() {
      let state: PersistentState = this.state;
      return this.period || state.currentPeriod;
    }
  }
}
</script>

<style>
</style>
