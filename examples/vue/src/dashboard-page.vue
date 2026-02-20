<script setup lang="ts">
const stats = [
  { label: 'Components', value: '24' },
  { label: 'Composables', value: '8' },
  { label: 'Pages', value: '5' },
  { label: 'Bundle Size', value: '42KB' },
]

const rows = [
  { name: 'App.vue', size: '1.2KB', type: 'Root' },
  { name: 'home-page.vue', size: '2.1KB', type: 'Page' },
  { name: 'dashboard-page.vue', size: '1.8KB', type: 'Page' },
]
</script>

<template>
  <div style="padding: 32px 40px; max-width: 800px">
    <h1 style="font-size: 28px; font-weight: 700; color: #111; margin: 0 0 24px">Dashboard</h1>

    <div style="display: flex; gap: 14px; margin-bottom: 28px; flex-wrap: wrap">
      <div
        v-for="s in stats"
        :key="s.label"
        style="flex: 1 1 150px; padding: 18px; background: #fff; border-radius: 10px; border: 1px solid #e5e5e5; text-align: center"
      >
        <div style="font-size: 24px; font-weight: 700; color: #111">{{ s.value }}</div>
        <div style="font-size: 13px; color: #888; margin-top: 4px">{{ s.label }}</div>
      </div>
    </div>

    <div style="background: #fff; border-radius: 10px; border: 1px solid #e5e5e5; overflow: hidden">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px">
        <thead>
          <tr style="background: #fafafa; text-align: left">
            <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">File</th>
            <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">Size</th>
            <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name">
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">{{ row.name }}</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">{{ row.size }}</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">
              <span style="padding: 2px 10px; border-radius: 12px; font-size: 12px; background: #f0fdf4; color: #166534">
                {{ row.type }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
