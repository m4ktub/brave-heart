<template>
  <div class="options">
    <h1 class="header">Brave Heart Extension Options</h1>
    <div class="group exclusions">
      <h2>Exclusions</h2>
      <p class="description">
        List of URLs that where excluded and are no longer shown as part of the visited
        web sites during the period. Restoring the URL makes that site reappear in lists
        together with its current usage.
      </p>
      <ul>
        <li v-for="url in sortedExcludedUrls" v-bind:key="url">
          <img :src="'chrome://favicon/size/12/' + url" />
          <span class="text">{{ url }}</span>
          <span class="actions">
            <a v-on:click="removeFromExcludedUrls(url)">
              <fa-icon icon="trash-restore"/>
              Restore
            </a>
          </span>
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
