<template>
  <div class="popup">
    <div class="header">
      <div class="nav back">
        <a v-on:click="prevPeriod" v-if="hasPreviousPeriod" class="button" v-bind:title="t('popup_period_back')">
          <fa-icon icon="chevron-left"/>
        </a>
      </div>
      <div class="nav forward">
        <a v-on:click="nextPeriod" v-if="hasNextPeriod" class="button" v-bind:title="t('popup_period_forward')">
          <fa-icon icon="chevron-right"/>
        </a>
      </div>
      <div class="title">
        <span class="text">
          {{ [visiblePeriod.start, visiblePeriod.end] | asDateRange }}
          ({{ visibleUsage.seconds | asDuration }})</span>
      </div>
      <div class="nav help">
        <a class="button" target="_blank" v-bind:title="t('popup_help')" 
           v-bind:href="'https://m4ktub.ws/brave-heart/' + i18nLang">
          <fa-icon v-bind:icon="['far', 'question-circle']"/>
        </a>
      </div>
      <div class="nav settings">
        <a v-on:click="openOptions" class="button" v-bind:title="t('popup_settings')">
          <fa-icon icon="sliders-h"/>
        </a>
      </div>
    </div>
    <usage v-bind:state="state" v-bind:period="visiblePeriod">
      <template v-slot:details="{ producer }">
        <span v-if="producer.manual && !isPeriodPaid">
          | <fa-icon icon="pencil-alt"/>
        </span>
        <span v-if="isPeriodPaid">
          | <fa-icon v-if="producer.manual" icon="pencil-alt"/> {{ asCurrency(producer.paid) }}
        </span>
      </template>
      <template v-slot:actions="{ producer }">
          <a v-if="!isPeriodPaid" v-on:click="toggleManual(producer)"
             v-bind:class="{ button: true, action: true, active: producer.manual }"
             v-bind:title="producer.manual ? t('action_toggle_automatic') : t('action_toggle_manual')"
             >
            <fa-icon icon="pencil-alt"/>
          </a>
          <a v-if="!isPeriodPaid" v-on:click="excludeProducer(producer)" class="button action" v-bind:title="t('action_ban')">
            <fa-icon icon="ban"/>
          </a>
      </template>
    </usage>
    <div class="contribute">
        <button v-on:click="openContribute" v-bind:disabled="isPeriodPaid">
          <fa-icon icon="hand-holding-usd"/>
          {{ t("popup_contribute") }}
        </button>
    </div>
  </div>
</template>

<script lang="ts">
import { State, Period, UsageMap, Settings } from "../lib/State";
import { Account } from "../lib/Payable";
import { UiUsage, UiProducer } from "../lib/Ui";
import { TimeFormatter } from "../lib/Time";
import { Currency } from "../lib/Currency";
import { I18n } from '../lib/I18n';
import { StateRequestMessage, Message, StateUpdateMessage, MessageType, Dispatcher } from '../lib/Messages';
import Browser from '../lib/Browser';

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

// initialize time formatter
const formatter = new TimeFormatter(I18n);

// vue component
export default {
  data() {
    return {
      state,
      index: 0
    }
  },
  methods: {
    excludeProducer(producer: UiProducer) {
      let state: State = this.state;
      if (state.settings.excludedUrls.indexOf(producer.url) < 0) {
        state.settings.excludedUrls.push(producer.url);
      }
      Browser.sendMessage(new StateUpdateMessage(state));
    },
    toggleManual(producer: UiProducer) {
      let state: State = this.state;
      producer.contents.forEach(c => c.manual = !c.manual);
      Browser.sendMessage(new StateUpdateMessage(state));
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
    },
    asCurrency(value, settings: Settings ) {
      let state: State = this.state;
      return Currency.format(value, { currency: state.settings.currency });
    },
    t(key: string, ...substitutions: string[]) {
      return I18n.translate(key, substitutions);
    }
  },
  computed: {
    hasNextPeriod() {
      return this.index > 0;
    },
    hasPreviousPeriod() {
      let state: State = this.state;
      return this.index < state.previousPeriods.length;
    },
    visiblePeriod() {
      let state: State = this.state;
      return this.index == 0
        ? state.currentPeriod
        : state.previousPeriods[state.previousPeriods.length - this.index];
    },
    visibleUsage() {
      let state: State = this.state;
      let period: Period = this.visiblePeriod;
      return new UiUsage(period.usage, state.settings);
    },
    isPeriodPaid() {
      let period: Period = this.visiblePeriod;
      return period.paid;
    },
    totalTimeString() {
      return formatter.duration(this.visibleUsage.seconds);
    },
    i18nLang() {
      const main = I18n.language.replace(/-.*/, "");
      switch (main) {
        case "en":
          return main + "/";
        default:
          return "";
      }
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
