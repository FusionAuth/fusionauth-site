<script setup>
const { status, signIn, signOut, data } = useAuth();
</script>
<template>
  <p>
    To get started,
    <a
      @click="signIn('fusionauth', { callbackUrl: '/account' })"
      :style="{ textDecoration: 'underline', cursor: 'pointer' }"
    >
      log in or create a new account.
    </a>
  </p>
</template>
