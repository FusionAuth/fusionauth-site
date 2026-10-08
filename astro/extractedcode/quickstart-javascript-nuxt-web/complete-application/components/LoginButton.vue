<script setup>
const { status, signIn, signOut, data } = useAuth();
</script>

<template>
  <section v-if="status === 'authenticated'">
    Status: Logged in as {{ data?.user?.email }} <br />
    <button class="button-lg" @click="signOut({ callbackUrl: '/' })">
      Log out
    </button>
  </section>
  <section v-else>
    <button
      class="button-lg"
      @click="signIn('fusionauth', { callbackUrl: '/account' })"
    >
      Log in
    </button>
  </section>
</template>
