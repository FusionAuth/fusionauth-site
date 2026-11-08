<script lang="ts" setup>
// get random numbers and round to integers
const randomDollars = Math.floor(Math.random() * 100);
const randomCents = Math.floor(Math.random() * 100);
// convert string to number
const randomMonies = parseFloat(randomDollars + '.' + randomCents);

// substract random number from 100 and round to 2 decimals
const result = Math.round((100 - randomMonies) * 100) / 100;
</script>

<template>
  <section>
    <div :style="{ flex: '1' }">
      <div class="column-container">
        <div class="app-container">
          <h3>Your balance</h3>
          <div class="balance">${{ result }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
