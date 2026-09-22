
<template>
  <div class="column-container">
    <div class="content-container">
      <div>
        <h1>Welcome to Changebank</h1>
          <p>
            Login or create a new account to get started
          </p>
            <button className="button-lg" style = "cursor: pointer"  @click="fusionAuth.login()">
            Login
            </button>
            <br/>
            <button className="button-redirect" style = "cursor: pointer"  @click="fusionAuth.register()">
            Create a new account.
            </button>
      </div>
    </div>

    <div class="image-container">
      <img src="@/assets/money.jpg" alt="Coins"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useFusionAuth} from "@fusionauth/vue-sdk";

const fusionAuth = useFusionAuth();

</script>