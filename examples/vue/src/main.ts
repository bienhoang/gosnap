import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomePage from './home-page.vue'
import DashboardPage from './dashboard-page.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/dashboard', component: DashboardPage },
  ],
})

createApp(App).use(router).mount('#app')
