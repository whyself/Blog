import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Navigation from '../components/Navigation.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/nav',
    name: 'Navigation',
    component: Navigation
  }
]

const router = createRouter({
  history: createWebHistory('/Blog/'), // 匹配vite.config.js的base
  routes
})

export default router