import './App.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FusionAuthVuePlugin, { type FusionAuthConfig } from '@fusionauth/vue-sdk'

const fusionAuthConfig: FusionAuthConfig = {
  redirectUri: 'http://localhost:3000',
  postLogoutRedirectUri: 'http://localhost:3000',
  shouldAutoRefresh: true,
  shouldAutoFetchUserInfo: true,
  scope: 'openid email profile offline_access',
  clientId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e',
  serverUrl: 'http://localhost:9011',
  // send users to their account page once the login redirect finishes
  onRedirect: () => { router.isReady().then(() => router.push('/account')) },
}

const app = createApp(App)

app.use(FusionAuthVuePlugin, fusionAuthConfig)
app.use(router)

app.mount('#app')
