import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'remixicon/fonts/remixicon.css'
import 'bulma/css/bulma.min.css'
import '@/assets/dark-theme.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
