<template>
  <div class="popup">
    <div class="header">
      <span class="nav back">&lt;</span>
      <span class="nav forward">&gt;</span>
      <span class="title">
        <span class="text">{{ visiblePeriod.start }} - {{ visiblePeriod.end }}</span>
      </span>
      <span class="nav settings">*</span>
    </div>
    <div class="usage">
      <p v-for="usage in visiblePeriod.usage" v-bind:key="usage.index">
        {{ usage.seconds }} {{ usage.contributable.content.title }}
      </p>
    </div>
    <div class="actions">
        <button>Contribute</button>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState } from "../lib/State";

export default {
    data () {
        return {
            state: new PersistentState(),
            index: 0
        }
    },
    computed: {
        visiblePeriod: function() {
            let periods = [ this.state.currentPeriod ].concat(this.state.previousPeriods);
            return periods[this.index];
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
}

.usage {
  width: 100%;
  height: 240px;
  
  background: lime;
}

.actions {
  width: 100%;
  height: 30px;
  text-align: center;
  line-height: 30px;

  background: orange;
}
</style>
