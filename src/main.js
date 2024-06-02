import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'



const app = createApp(App)

const pinia = createPinia()
export default pinia;
app.use(pinia)

app.mount('#app')
