import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CasesPage from '@/pages/CasesPage.vue'
import GamePage from '@/pages/GamePage.vue'
import CaseResultPage from '@/pages/CaseResultPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) return { el: to.hash }
    return savedPosition || { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/cases',
      name: 'cases',
      component: CasesPage
    },
    {
      path: '/play/:caseSlug',
      name: 'play',
      component: GamePage,
      props: true
    },
    {
      path: '/cases/:caseSlug/result',
      name: 'result',
      component: CaseResultPage,
      props: true
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage
    }
  ]
})

export default router
