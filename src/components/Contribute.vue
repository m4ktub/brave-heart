<template>
  <div class="contribute">
    <h1>Contribute</h1>
    <button v-on:click="pay" :disabled="paymentPeriod.paid">Pay</button>
  </div>
</template>

<script lang="ts">
import { PersistentState, Settings } from "../lib/State";

export default {
  data() {
    return {
      state: new PersistentState(),
      period: null
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
