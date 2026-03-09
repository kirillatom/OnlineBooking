<template>
  <div class="logo">
    <div class="logo-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="cup">
        <path d="M12 20h32v20a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12V20z" fill="none" stroke="black" stroke-width="2"/>
        <path d="M44 24h6a6 6 0 0 1 0 12h-6" fill="none" stroke="black" stroke-width="2"/>
      </svg>
    </div>
    <h1 class="logo-title">BLACKOUT</h1>
    <p class="logo-subtitle">SPECIALTY COFFEE</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.logo {
  text-align: center;
  margin-bottom: 28px;
  font-family: "Inter", sans-serif;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
}

.logo-icon .cup {
  width: 100%;
  height: 100%;
}

.logo-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.logo-subtitle {
  font-size: 12px;
  letter-spacing: 3px;
  color: #666;
  margin: 4px 0 0;
}
</style>
