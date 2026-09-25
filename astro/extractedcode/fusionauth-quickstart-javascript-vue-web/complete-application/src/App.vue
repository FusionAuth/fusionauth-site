<script setup lang="ts">
import {RouterView} from 'vue-router'
import MenuBar from "@/components/MenuBar.vue";
import LogoHeader from "@/components/LogoHeader.vue";
</script>

<template>
  <div id="page-container">
    <div id="page-header">
      <LogoHeader/>
      <MenuBar/>
    </div>

    <div>
      <RouterView/>
    </div>
  </div>
</template>
