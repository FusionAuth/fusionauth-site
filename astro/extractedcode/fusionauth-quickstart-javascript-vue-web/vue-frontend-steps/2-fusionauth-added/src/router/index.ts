import { createRouter, createWebHistory } from 'vue-router'
import { useFusionAuth } from '@fusionauth/vue-sdk'
import HomeView from '../views/HomeView.vue'
import AccountView from '../views/AccountView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      // send users who aren't logged in back to the home page
      beforeEnter: () => {
        if (!useFusionAuth().isLoggedIn.value) return '/'
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
