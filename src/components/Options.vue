<template>
  <div class="options">
    <h1 class="header">Brave Heart Extension Options</h1>
    <div class="group donation">
      <h2>Contribute</h2>
      <div>
        <label>Currency:</label>
        <select v-model="state.settings.currency" v-on:change="save()">
          <option
            v-for="option in currencyOptions"
            v-bind:key="option.code"
            v-bind:value="option.code"
          >{{ option.code }} - {{ option.label }}</option>
        </select>
      </div>
    </div>
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
              <fa-icon icon="trash-restore" />Restore
            </a>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { PersistentState, Settings } from "../lib/State";

const currencyOptions = [
  { code: "USD", label: "United States dollar" },
  { code: "EUR", label: "Euro" },
  { code: "AUD", label: "Australian dollar" },
  { code: "BRL", label: "Brazilian real" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "CNY", label: "Yuan" },
  { code: "GBP", label: "Pound sterling" },
  { code: "INR", label: "Indian rupee" },
  { code: "JPY", label: "Japanese yen" },
  { code: "KRW", label: "South Korean won" },
  { code: "THB", label: "Thai Baht" },
  { code: "RUB", label: "Russian ruble" },
];

export default {
  data() {
    return {
      state: new PersistentState(),
      currencyOptions
    };
  },
  methods: {
    save() {
      let state: PersistentState = this.state;
      state.save();
    },
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
};
</script>

<style>
</style>
