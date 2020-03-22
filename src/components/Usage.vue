<template>
  <div class="usage">
    <div class="line" v-for="producer in visibleProducers"
      v-bind:key="producer.url" 
      v-bind:class="{ manual: producer.manual }">
      <div class="left">
        <div class="icon">
          <img :src="'chrome://favicon/size/32/' + producer.site" />
        </div>     
      </div>
      <div class="right">
        <div class="top">
          <span class="title">{{ producer.title }}</span>
          <span class="details">
            <span v-if="!producer.manual">
              <fa-icon v-bind:icon="['far', 'clock']" size="xs"/> {{ producer.seconds | asDuration }}
            </span>
            <span v-if="producer.manual">
              <fa-icon v-bind:icon="['far', 'clock']" size="xs"/> --
            </span>
            <slot name="details" v-bind:usage="visibleUsage" v-bind:producer="producer"></slot>
          </span>
        </div>
        <div class="bottom">
          <span class="url"><a v-bind:href="producer.url" target="_blank">{{ producer.url }}</a></span>
          <span class="actions">
            <slot name="actions" v-bind:usage="visibleUsage" v-bind:producer="producer"></slot>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, UsageMap, Settings } from "../lib/State";
import { UiUsage } from "../lib/Ui";
import { TimeFormatter } from "../lib/Time";

const formatter = new TimeFormatter();

export default {
  props: [ "period", "show" ],
  data() {
    return {
      state: new PersistentState()
    };
  },
  computed: {
    visibleUsage() {
      let state: PersistentState = this.state;
      let period: Period = this.period;
      let showManual: boolean = this.showManual;
      return new UiUsage(period.usage, state.settings);
    },
    visibleProducers() {
      let visibleUsage: UiUsage = this.visibleUsage;
      return visibleUsage.producers.filter(p => {
        switch (this.show) {
          case "manual": return p.manual;
          case "automatic": return !p.manual;
          default: return true;
        }
      });
    }
  },
  filters: {
    asDuration(seconds) {
      return formatter.duration(seconds);
    },
  }
};
</script>

<style>

</style>
