<script setup lang="ts">
import { ref } from 'vue'
import { useFusionAuth } from '@fusionauth/vue-sdk'

const { isGettingUserInfo, userInfo, logout } = useFusionAuth()
const newUserInfo = ref({ given_name: '', family_name: '', birthdate: '' })

async function getUserInfo() {
  const response = await fetch('http://localhost:9011/app/me', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  newUserInfo.value = await response.json()
}
</script>

<template>
  <div v-if="!isGettingUserInfo">
    <div class="titlebar">
      <span class="white">{{ userInfo?.email }}</span>
      <button class="button" @click="logout()">Logout</button>
    </div>
    <div class="centerContainer">
      <div class="userInfoGrid">
        <div>Name:</div>
        <div>{{ newUserInfo.given_name }} {{ newUserInfo.family_name }}</div>
        <div>Birthdate:</div>
        <div>{{ newUserInfo.birthdate }}</div>
      </div>
      <br />
      <div>
        <button class="button" @click="getUserInfo">Show your info</button>
      </div>
    </div>
  </div>
</template>
