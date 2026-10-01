<template>
  <div id="logo-header">
    <img src="@/assets/changebank.svg" alt="Change Bank" width="259" height="70"/>

    <RequireAuth>
      <div class="h-row">
        <p class="header-email" v-if="userInfo?.email">
          {{ userInfo.email }}
        </p>
        <a class="button-lg" style="cursor: pointer" @click="logout()">Logout</a>
      </div>
    </RequireAuth>

    <RequireAnonymous>
      <a class="button-lg" style="cursor: pointer" @click="login()">Login</a>
    </RequireAnonymous>

  </div>
</template>

<script setup lang="ts">
import {useFusionAuth} from "@fusionauth/vue-sdk";

const {userInfo, login, logout} = useFusionAuth();
</script>
