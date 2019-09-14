<template>
  <div class="options">
    <h1>Brave Heart Extension Options</h1>
    <div class="exclusions">
      <p>Exclusions:</p>
      <ul>
        <li v-for="url in sortedExcludedUrls" v-bind:key="url">
          <span>{{ url }}</span>
          <a v-on:click="removeFromExcludedUrls(url)">x</a>
        </li>
      </ul>
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
    removeFromExcludedUrls(url) {
      let state: PersistentState = this.state;
      let pos = state.settings.excludedUrls.indexOf(url);
      state.settings.excludedUrls.splice(pos, 1);
      state.save();
    }
  },
  computed: {
    sortedExcludedUrls() {
      let state: PersistentState = this.state;
      return Array.from(state.settings.excludedUrls).sort();
    }
  }
}
</script>

<style>
</style>
