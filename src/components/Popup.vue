<template>
  <div>
    <p v-for="usage in currentPeriod.usage">
      {{ usage.seconds }} {{ usage.contributable.content.title }}
    </p>
  </div>
</template>

<script lang="ts">
import { PersistentState } from "../lib/State";

export default {
    data () {
      return new PersistentState();
    }
}
</script>

<style>

</style>
