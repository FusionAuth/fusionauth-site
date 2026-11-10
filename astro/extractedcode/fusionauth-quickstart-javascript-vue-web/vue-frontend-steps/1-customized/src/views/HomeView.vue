<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div>
    <div class="titlebar">
      <button class="button" @click="router.push('/account')">Login</button>
    </div>
    <div class="centerContainer">
      <div>Log in to request your information</div>
    </div>
  </div>
</template>
