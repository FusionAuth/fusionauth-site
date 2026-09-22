<template>
  <div class="app-container change-container">
    <h3>Make Change</h3>

    <form @submit="makeChange">
        <div class="change-label">Amount in USD</div>
        <input class="change-input" name="amount" type="number" step=".01" v-model="amount"/>
        <input class="change-submit" type="submit" value="Make Change"/>
    </form>
    <div class="change-message" v-if="change">
      We can make change for {{ dollarUS.format(change.total) }} with {{ change.nickels }} nickels and {{ change.pennies }} pennies!
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const amount = ref<number>(0);
const change = ref<{ total: number; nickels: number; pennies: number } | null>();

let dollarUS = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  useGrouping: false,
});

const makeChange = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();

  const total = amount.value;
  const totalCents = Math.round(amount.value * 100);
  const nickels = Math.floor(totalCents / 5);
  const pennies = totalCents - nickels * 5;
  change.value = {total, nickels, pennies};
};
</script>
