<script setup>
import { ref } from 'vue';

// coin values in cents, so the math stays in whole numbers
var coins = {
  quarters: 25,
  dimes: 10,
  nickels: 5,
  pennies: 1,
};

const message = ref('');
const amount = ref(0);

const onMakeChange = (event) => {
  event.preventDefault();

  try {
    message.value = 'We can make change for';

    // work in whole cents so floating-point rounding can't drop a penny
    let remainingCents = Math.round(Number(amount.value) * 100);
    for (const [name, cents] of Object.entries(coins)) {
      const count = Math.floor(remainingCents / cents);
      remainingCents -= count * cents;

      message.value = `${message.value} ${count} ${name}`;
    }
    message.value = `${message.value}!`;
  } catch (ex) {
    message.value = `There was a problem converting the amount submitted. ${ex.message}`;
  }
};
</script>
<template>
  <section>
    <div :style="{ flex: '1' }">
      <div class="column-container">
        <div class="app-container change-container">
          <h3>We Make Change</h3>
          <div class="change-message">{{ message }}</div>
          <form @submit="onMakeChange">
            <div class="h-row">
              <div class="change-label">Amount in USD: $</div>
              <input
                class="change-input"
                type="number"
                step="0.01"
                name="amount"
                :value="amount"
                @input="(event) => (amount = event.target.value)"
              />
              <input class="change-submit" type="submit" value="Make Change" />
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
