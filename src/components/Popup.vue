<template>
  <div class="popup">
    <div class="header">
      <div class="nav back">
        <a v-on:click="prevPeriod" v-if="hasPreviousPeriod">&lt;</a>
      </div>
      <div class="nav forward">
        <a v-on:click="nextPeriod" v-if="hasNextPeriod">&gt;</a>
      </div>
      <div class="title">
        <span class="text">{{ visiblePeriod.start }} - {{ visiblePeriod.end }} ({{ visibleUsage.seconds }})</span>
      </div>
      <div class="nav settings">
        <a v-on:click="openOptions">*</a>
      </div>
    </div>
    <usage v-bind:period="visiblePeriod">
      <template v-slot:actions="{ producer }">
          <a v-on:click="excludeProducer(producer)">x</a>
      </template>
    </usage>
    <div class="contribute">
        <button v-on:click="openContribute" v-bind:disabled="isPeriodPaid">Contribute</button>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState, UsedContributable, Period, UsageMap, Settings } from "../lib/State";
import { Account } from "../lib/Contributable";
import { UiUsage, UiProducer } from "./Ui";

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
    }
  }
}
</script>

<style>
.popup div {
   display: inline-block;
   vertical-align: top;
   zoom: 1;
   margin: 0px;
   outline: none;
   overflow: auto;
}

.header {
  width: 100%;
  height: 30px;
  
  background: pink;
}

.header .nav {
  width: 30px;
  height: 30px;
  line-height: 30px;  
  text-align: center;
  display: inline-block;
  background: lightgray;
}

.header .title {
  display: inline-block;
  width: 310px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header .title .text {
  margin-left: 1em;
  line-height: 30px;
}

.usage {
  width: 100%;
  height: 240px;
  
  background: lime;
}

.contribute {
  width: 100%;
  height: 30px;
  text-align: center;
  line-height: 30px;

  background: orange;
}
</style>
