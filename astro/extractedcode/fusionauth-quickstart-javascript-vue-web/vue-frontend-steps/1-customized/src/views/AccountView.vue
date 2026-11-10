<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div>
    <div class="titlebar">
      <button class="button" @click="router.push('/')">Logout</button>
    </div>
    <div class="centerContainer">
      <p>User info will display here</p>
    </div>
  </div>
</template>
