<script setup lang="ts">
import { useFusionAuth } from '@fusionauth/vue-sdk'

const { isGettingUserInfo, userInfo, logout } = useFusionAuth()
</script>

<template>
  <div v-if="!isGettingUserInfo">
    <div class="titlebar">
      <span class="white">{{ userInfo?.email }}</span>
      <button class="button" @click="logout()">Logout</button>
    </div>
    <div class="centerContainer">
      <p>User info will display here</p>
    </div>
  </div>
</template>
