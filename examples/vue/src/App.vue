<script setup lang="ts">
// GoSnap embed loaded via script tag in index.html
</script>

<template>
  <div style="min-height: 100vh; background: #f5f5f5; font-family: system-ui, sans-serif">
    <nav style="display: flex; gap: 10px; padding: 14px 32px; background: #fff; border-bottom: 1px solid #e5e5e5">
      <span style="font-weight: 700; font-size: 16px; margin-right: 12px; color: #111">GoSnap + Vue</span>
      <router-link to="/" style="padding: 5px 12px; border-radius: 6px; font-size: 14px; color: #555; text-decoration: none; border: 1px solid #ddd">Home</router-link>
      <router-link to="/dashboard" style="padding: 5px 12px; border-radius: 6px; font-size: 14px; color: #555; text-decoration: none; border: 1px solid #ddd">Dashboard</router-link>
    </nav>

    <router-view />

    <!-- GoSnap web component (loaded via embed script in index.html) -->
    <go-snap position="bottom-right" theme="dark" persist="vue-example"></go-snap>
  </div>
</template>
