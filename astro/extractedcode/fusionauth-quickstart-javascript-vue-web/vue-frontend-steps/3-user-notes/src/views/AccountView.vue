<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFusionAuth } from '@fusionauth/vue-sdk'

const { isGettingUserInfo, userInfo, logout } = useFusionAuth()
const note = ref('')
const saved = ref(false)

// sub is the user's FusionAuth Id, so each user gets their own note
const noteKey = () => `note-${userInfo.value?.sub}`

watch(
  userInfo,
  (info) => {
    if (info?.sub) {
      note.value = localStorage.getItem(noteKey()) ?? `Hello ${info.given_name ?? info.email}! This note is yours alone.`
    }
  },
  { immediate: true },
)

function saveNote() {
  localStorage.setItem(noteKey(), note.value)
  saved.value = true
}
</script>

<template>
  <div v-if="!isGettingUserInfo">
    <div class="titlebar">
      <span class="white">{{ userInfo?.email }}</span>
      <button class="button" @click="logout()">Logout</button>
    </div>
    <div class="centerContainer">
      <h2>Your note</h2>
      <textarea class="note" v-model="note" @input="saved = false"></textarea>
      <button class="button" @click="saveNote">Save note</button>
      <p v-if="saved">Saved</p>
    </div>
  </div>
</template>
