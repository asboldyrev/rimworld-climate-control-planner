import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from './stores/plugins/persistedState'
import App from './App.vue'
import 'bulma/css/bulma.css'
import 'remixicon/fonts/remixicon.css'

const pinia = createPinia()
pinia.use(createPersistedState())

const app = createApp(App)
app.use(pinia)
app.mount('#app')
