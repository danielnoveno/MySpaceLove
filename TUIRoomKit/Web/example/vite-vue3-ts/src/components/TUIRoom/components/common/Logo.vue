<template>
  <div class="logo-container">
    <img :src="CUSTOM_LOGO_URL" alt="LoveSpace Logo" class="custom-logo" />
  </div>
</template>

<script setup lang="ts">
const CUSTOM_LOGO_URL = '/images/icon.png';
</script>

<style lang="scss" scoped>
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-logo {
  max-width: 220px;
  width: 100%;
  height: auto;
}
</style>
