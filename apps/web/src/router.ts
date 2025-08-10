import { createRouter, createWebHistory } from 'vue-router'
import { getSession } from '@/helper/auth.ts'
import { storeToRefs } from 'pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/gplace',
      name: 'GPlace',
      meta: { title: 'Google Maps Place' },
      component: () => import('@/views/GPlace.vue'),
    },

  ],
})



router.beforeEach(async (to, from, next) => {
  // Add page title for browser
  document.title = `${to.meta?.title ?? ''} · Jain Wiki`;

  // Always call next() other wise Vue will never proceed further
  next();
});

export default router
