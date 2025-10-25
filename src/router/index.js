import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../components/MainView.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: MainView
  }
]

const router = createRouter({
  history: createWebHistory('/Blog/'), // 匹配vite.config.js的base
  routes
})

export default router