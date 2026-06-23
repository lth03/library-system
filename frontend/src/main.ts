/**
 * 应用入口
 *
 * 挂载 Pinia（状态管理）、Vue Router、全局样式
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import './style.less'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
