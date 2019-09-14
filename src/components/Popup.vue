<template>
  <div class="popup">
    <div class="header">
      <span class="nav back">&lt;</span>
      <span class="nav forward">&gt;</span>
      <span class="title">
        <span class="text">{{ visiblePeriod.start }} - {{ visiblePeriod.end }} ({{ visibleUsage.seconds }})</span>
      </span>
      <span class="nav settings">
        <a v-on:click="openOptions">*</a>
      </span>
    </div>
    <div class="usage">
      <p v-for="producer in visibleUsage.producers" v-bind:key="producer.url">
        <img :src="'chrome://favicon/size/16/' + producer.url">
        <span class="title">{{ producer.title }}</span>
        <span class="time">{{ producer.seconds }}</span>
        <span class="actions">
          <a v-on:click="excludeProducer(producer)">x</a>
        </span>
      </p>
    </div>
    <div class="contribute">
        <button>Contribute</button>
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
      state: new PersistentState()
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
    }
  },
  computed: {
    visiblePeriod() {
      return this.state.currentPeriod;
    },
    visibleUsage() {
      let state: PersistentState = this.state;
      return new UiUsage(state.currentPeriod.usage, state.settings);
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

.header span {
  display: inline-block;
  height: 30px;
}

.header .nav {
  width: 30px;
  line-height: 30px;
  text-align: center;
  
  background: lightgray;
}

.header .title {
  width: 310px;
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
