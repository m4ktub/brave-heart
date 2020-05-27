<template>
  <div class="options">
    <h1 class="header">{{ t("options_header") }}</h1>
    <div class="group donation">
      <h2>{{ t("options_contribute_section") }}</h2>
      <div>
        <label>{{ t("options_currency_label") }}</label>
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
      <h2>{{ t("options_exclusions_section") }}</h2>
      <p class="description">
        {{ t("options_exclusions_description") }}
      </p>
      <ul>
        <li v-for="url in sortedExcludedUrls" v-bind:key="url">
          <img v-bind:src="getFaviconUrl(url)" />
          <span class="text">{{ url }}</span>
          <span class="actions">
            <a v-on:click="removeFromExcludedUrls(url)">
              <fa-icon icon="trash-restore" /> {{ t("options_restore") }}
            </a>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { State, Settings } from "../lib/State";
import { I18n } from '../lib/I18n';
import { StateRequestMessage, Message, MessageType, StateUpdateMessage, Dispatcher } from '../lib/Messages';
import Browser from '../lib/Browser';

const currencyOptions = [
  { code: "USD", label: I18n.translate("currency_usd") },
  { code: "EUR", label: I18n.translate("currency_eur") },
  { code: "AUD", label: I18n.translate("currency_aud") },
  { code: "BRL", label: I18n.translate("currency_brl") },
  { code: "CAD", label: I18n.translate("currency_cad") },
  { code: "CNY", label: I18n.translate("currency_cny") },
  { code: "GBP", label: I18n.translate("currency_gbp") },
  { code: "INR", label: I18n.translate("currency_inr") },
  { code: "JPY", label: I18n.translate("currency_jpy") },
  { code: "KRW", label: I18n.translate("currency_krw") },
  { code: "THB", label: I18n.translate("currency_thb") },
  { code: "RUB", label: I18n.translate("currency_rub") },
];

// global state
var state = new State();

// handle state updates
const dispatcher = new Dispatcher();
chrome.runtime.onMessage.addListener(dispatcher.listener());

dispatcher.register(MessageType.StateUpdate, (msg: StateUpdateMessage) => {
  state.updateFrom(msg.state);
});

// request state update
Browser.sendMessage(new StateRequestMessage());

// vue component
export default {
  data() {
    return {
      state,
      currencyOptions
    };
  },
  mounted() {
    document.title = I18n.translate("options_title", [I18n.translate("manifest_short_name")]);
  },
  methods: {
    save() {
      let state: State = this.state;
      Browser.sendMessage(new StateUpdateMessage(state));
    },
    removeFromExcludedUrls(url) {
      let state: State = this.state;
      let pos = state.settings.excludedUrls.indexOf(url);
      state.settings.excludedUrls.splice(pos, 1);
      this.save();
    },
    getFaviconUrl(url: string) {
      return Browser.getFaviconUrl(url, 12);
    },
    t(key: string) {
      return I18n.translate(key);
    }
  },
  computed: {
    sortedExcludedUrls() {
      let state: State = this.state;
      return Array.from(state.settings.excludedUrls).sort();
    }
  }
};
</script>

<style>
</style>
