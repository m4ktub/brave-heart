<template>
  <div class="popup">
    <div class="header">
      <div class="nav back">
        <a v-on:click="prevPeriod" v-if="hasPreviousPeriod" class="button">
          <fa-icon icon="chevron-left"/>
        </a>
      </div>
      <div class="nav forward">
        <a v-on:click="nextPeriod" v-if="hasNextPeriod" class="button">
          <fa-icon icon="chevron-right"/>
        </a>
      </div>
      <div class="title">
        <span class="text">
          {{ [visiblePeriod.start, visiblePeriod.end] | asDateRange }}
          ({{ visibleUsage.seconds | asDuration }})</span>
      </div>
      <div class="nav settings">
        <a v-on:click="openOptions" class="button">
          <fa-icon icon="sliders-h"/>
        </a>
      </div>
    </div>
    <usage v-bind:period="visiblePeriod">
      <template v-slot:details="{ producer }">
        <span v-if="index > 0">
          | ${{ producer.paid.toFixed(2) }}
        </span>
      </template>
      <template v-slot:actions="{ producer }">
          <a v-on:click="excludeProducer(producer)" class="button action">
            <fa-icon icon="ban"/>
          </a>
      </template>
    </usage>
    <div class="contribute">
        <button v-on:click="openContribute" v-bind:disabled="isPeriodPaid">
          <fa-icon icon="hand-holding-usd"/>
          Contribute
        </button>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, UsageMap, Settings } from "../lib/State";
import { Account } from "../lib/Payable";
import { UiUsage, UiProducer } from "../lib/Ui";
import { TimeFormatter } from '../lib/Time';

const formatter = new TimeFormatter();

export default {
  data() {
    return {
      state: new PersistentState(),
      index: 0
    }
  },
  methods: {
    excludeProducer(producer: UiProducer) {
      let state: PersistentState = this.state;
      if (state.settings.excludedUrls.indexOf(producer.url) < 0) {
        state.settings.excludedUrls.push(producer.url);
      }
      state.save();
    },
    openOptions() {
      chrome.runtime.openOptionsPage();
    },
    openContribute() {
      window.open(chrome.runtime.getURL("pages/contribute.html"));
    },
    prevPeriod() {
      this.index++;
    },
    nextPeriod() {
      this.index--;
    }
  },
  computed: {
    hasNextPeriod() {
      return this.index > 0;
    },
    hasPreviousPeriod() {
      let state: PersistentState = this.state;
      return this.index < state.previousPeriods.length;
    },
    visiblePeriod() {
      let state: PersistentState = this.state;
      return this.index == 0
        ? state.currentPeriod
        : state.previousPeriods[state.previousPeriods.length - this.index];
    },
    visibleUsage() {
      let state: PersistentState = this.state;
      let period: Period = this.visiblePeriod;
      return new UiUsage(period.usage, state.settings);
    },
    isPeriodPaid() {
      let period: Period = this.visiblePeriod;
      return period.paid;
    },
    totalTimeString() {
      return formatter.duration(this.visibleUsage.seconds);
    }
  },
  filters: {
    asDuration(seconds) {
      return formatter.duration(seconds);
    },
    asDateRange([start, end]) {
      return formatter.range(start, end);
    }
  }
}
</script>

<style>

</style>
