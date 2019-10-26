<template>
  <div class="usage">
    <div v-for="(producer, index) in visibleUsage.producers" v-bind:key="producer.url"
         v-on:mouseover="mouseIndex = index" v-on:mouseleave="mouseIndex = -1"
         v-bind:class="{ line: true, active: mouseIndex == index }">
      <div class="left">
        <div class="icon">
          <img :src="'chrome://favicon/size/32/' + producer.url" />
        </div>     
      </div>
      <div class="right">
        <div class="top">
          <span class="title">{{ producer.title }}</span>
          <span class="time"><fa-icon v-bind:icon="['far', 'clock']" size="xs"/> {{ producer.seconds | asDuration }}</span>
        </div>
        <div class="bottom">
          <span class="url"><a v-bind:href="producer.url" target="_blank">{{ producer.url }}</a></span>
          <span class="actions">
            <slot name="actions" v-bind:producer="producer"></slot>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState, Period, UsageMap, Settings } from "../lib/State";
import { UiUsage } from "./Ui";
import { TimeFormatter } from '../lib/Time';

const formatter = new TimeFormatter();

export default {
  props: [ "period" ],
  data() {
    return {
      state: new PersistentState(),
      mouseIndex: -1
    };
  },
  computed: {
    visibleUsage() {
      let state: PersistentState = this.state;
      let period: Period = this.period;
      return new UiUsage(period.usage, state.settings);
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
.usage .line {
   display: flex;
   width: 100%;
   height: 44px;
   margin: 4px 0px;
}

.usage .line .left .icon {
  margin: 4px;
}

.usage .line .left {
  flex: 46px;
}

.usage .line .right{
  flex: 100%;
}

.usage .line .right .top {
  display: block;
  height: 22px;
}

.usage .line .right .bottom {
  display: block;
  height: 22px;
}

.usage .title {
  font-weight: bold;
}

.usage .time {
  float: right;
  margin-right: 4px;
}

.usage .actions {
  float: right;
  margin-right: 4px;
  display: none;
}

.usage .line.active .actions {
  display: block;
}

.usage .actions .button {
  padding: 2px 6px;
  border: 1px solid rgba(0, 0, 0, 0.1)
}

.usage .actions .button:hover {
  cursor: pointer;
  background-color: rgba(10, 193, 141, 0.5);
}
</style>
