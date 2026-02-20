<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const items = [
  { title: 'Vue 3 Composition API', desc: 'Using <script setup> with reactive state' },
  { title: 'Web Component Integration', desc: 'GoSnap loaded via <go-snap> custom element' },
  { title: 'No React Required', desc: 'Embed script bundles its own React runtime' },
]
</script>

<template>
  <div style="padding: 32px 40px; max-width: 800px">
    <h1 style="font-size: 28px; font-weight: 700; color: #111; margin: 0 0 8px">Vue 3 + GoSnap</h1>
    <p style="color: #666; margin: 0 0 24px; font-size: 15px">
      GoSnap works on any website via the web component embed — no React in your project needed.
    </p>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px">
      <div
        v-for="item in items"
        :key="item.title"
        style="padding: 20px; background: #fff; border-radius: 10px; border: 1px solid #e5e5e5"
      >
        <h3 style="margin: 0 0 6px; font-size: 16px; color: #111">{{ item.title }}</h3>
        <p style="margin: 0; font-size: 13px; color: #888">{{ item.desc }}</p>
      </div>
    </div>

    <div style="padding: 20px; background: #fff; border-radius: 10px; border: 1px solid #e5e5e5">
      <h2 style="margin: 0 0 12px; font-size: 18px">Reactive Form</h2>
      <div style="display: flex; gap: 10px">
        <input
          v-model="name"
          style="flex: 1; padding: 10px 12px; border-radius: 6px; border: 1px solid #ddd; font-size: 14px"
          placeholder="Type something..."
        />
        <button
          style="padding: 10px 20px; border-radius: 6px; border: none; background: #111; color: #fff; cursor: pointer; font-size: 14px"
        >
          Submit
        </button>
      </div>
      <p v-if="name" style="margin: 10px 0 0; font-size: 14px; color: #666">
        You typed: <strong>{{ name }}</strong>
      </p>
    </div>
  </div>
</template>
