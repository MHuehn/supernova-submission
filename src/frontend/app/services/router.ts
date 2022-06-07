import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from "vue-router"

import PCard from '@/app/components/PCard.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: PCard,
    meta: {
      isMainRoute: true,
    },
  },
]

export { routes }

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
