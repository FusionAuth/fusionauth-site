<script setup>
import '~/assets/css/global.css';

const { status } = useAuth();
</script>

<template>
  <div id="page-container">
    <div id="page-header">
      <div id="logo-header">
        <img
          src="https://fusionauth.io/cdn/samplethemes/changebank/changebank.svg"
          alt="change bank logo"
          width="257"
          height="55"
        />
        <LoginButton />
      </div>

      <div v-if="status === 'authenticated'" id="menu-bar" class="menu-bar">
        <a href="/makechange" class="menu-link"> Make Change </a>
        <a href="/account" class="menu-link"> Account </a>
      </div>
      <div v-else id="menu-bar" class="menu-bar">
        <a class="menu-link">About</a>
        <a class="menu-link">Services</a>
        <a class="menu-link">Products</a>
        <a href="/" class="menu-link"> Home </a>
      </div>
    </div>
    <NuxtPage />
  </div>
</template>
