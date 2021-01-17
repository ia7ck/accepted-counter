import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router';
import VueApexCharts from 'vue-apexcharts'

Vue.use(VueRouter)
const routes = [{ path: '/', component: App }]
const router = new VueRouter({ routes });

Vue.use(VueApexCharts)
Vue.component('apexcharts', VueApexCharts)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
