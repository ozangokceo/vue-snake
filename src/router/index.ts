import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'snake',
      component: () => import('../views/SnakeView.vue')
    }
  ]
})

export default router
