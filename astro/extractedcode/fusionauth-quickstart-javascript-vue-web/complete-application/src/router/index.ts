import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {useFusionAuth} from "@fusionauth/vue-sdk";

const routeGuard = (loggedIn: boolean, fallback: string) => {
  return () => {
    const fusionAuth = useFusionAuth();
    if (fusionAuth.isLoggedIn.value !== loggedIn) {
      return fallback;
    }
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: routeGuard(false, '/account'),
      alias: '/logged-out'
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue'),
      beforeEnter: routeGuard(true, '/')
    },
    {
      path: '/make-change',
      name: 'make-change',
      component: () => import('../views/MakeChangeView.vue'),
      beforeEnter: routeGuard(true, '/')
    },
    {path: '/:pathMatch(.*)*', redirect: '/'},
  ]
})

export default router
