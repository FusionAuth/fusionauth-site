<script setup lang="ts">
definePageMeta({ auth: false })
</script>

<template>
    <main>
      <div :style="{ flex: '1' }"">
        <div class="column-container">
          <div class="content-container">
            <div :style="{ marginBottom: '100px' }">
              <h1>Welcome to Changebank</h1>
              <LoginLink session={session} />
            </div>
          </div>
          <div :style="{ width: '100%', maxWidth: '800px' }">
            <img
              src="/img/money.jpg"
              alt="money"
              width="1512"
              height="2016"
              :style="{
                objectFit: 'contain',
                width: '100%',
                position: 'relative',
                height: 'unset',
              }"
            />
          </div>
        </div>
      </div>
    </main>
</template>
