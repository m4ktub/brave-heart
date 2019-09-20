<template>
  <div class="usage">
    <p v-for="producer in visibleUsage.producers" v-bind:key="producer.url">
      <img :src="'chrome://favicon/size/16/' + producer.url" />
      <span class="title">{{ producer.title }}</span>
      <span class="time">{{ producer.seconds }}</span>
      <span class="actions">
        <slot name="actions" v-bind:producer="producer"></slot>
      </span>
    </p>
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, UsageMap, Settings } from "../lib/State";
import { UiUsage } from "./Ui";

export default {
  props: [ "period" ],
  data() {
    return {
      state: new PersistentState()
    };
  },
  computed: {
    visibleUsage() {
      let state: PersistentState = this.state;
      let period: Period = this.period;
      return new UiUsage(period.usage, state.settings);
    }
  }
};
</script>

<style>
</style>
