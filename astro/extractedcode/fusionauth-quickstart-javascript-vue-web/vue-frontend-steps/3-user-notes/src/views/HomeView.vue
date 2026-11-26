<script setup lang="ts">
import { useFusionAuth } from '@fusionauth/vue-sdk'

const { isLoggedIn, userInfo, login, logout } = useFusionAuth()
</script>

<template>
  <div>
    <div class="titlebar">
      <template v-if="isLoggedIn">
        <span class="white">{{ userInfo?.email }}</span>
        <button class="button" @click="logout()">Logout</button>
      </template>
      <button v-else class="button" @click="login()">Login</button>
    </div>
    <div class="centerContainer">
      <div>Log in to request your information</div>
    </div>
  </div>
</template>
