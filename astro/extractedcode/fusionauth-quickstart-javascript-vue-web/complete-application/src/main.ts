import './assets/main.css'
import '@fusionauth/vue-sdk/dist/style.css';

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import FusionAuthVuePlugin from '@fusionauth/vue-sdk';

const app = createApp(App)

app.use(FusionAuthVuePlugin, {
  clientId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e',
  serverUrl: 'http://localhost:9011',
  redirectUri: 'http://localhost:5173',
  postLogoutRedirectUri: 'http://localhost:5173/logged-out',
  shouldAutoFetchUserInfo: true,
  shouldAutoRefresh: true,
  scope: 'openid email profile offline_access'
});

app.use(router)

app.mount('#app')
