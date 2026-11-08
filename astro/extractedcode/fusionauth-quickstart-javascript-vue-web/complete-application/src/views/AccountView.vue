<template>
  <div class="column-container">
    <div class="app-container">
      <h3>Your Balance</h3>
      <div class="balance">{{ balance }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
let dollarUS = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  useGrouping: false,
});
const balance = dollarUS.format(Math.ceil(Math.random() * 100000) / 100);
</script>
