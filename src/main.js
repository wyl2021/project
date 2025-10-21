import Vue from 'vue'
import App from './App.vue'

// 先安装Element UI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/icon.css'
Vue.use(ElementUI)

// 然后导入router（Vue Router在router/index.js中已经安装）
import router from './router'

// 引入API服务
import apiService from './api-service'
Vue.use(apiService)

// 引入自定义图标
import './icons'


// 正确导入 ECharts
import * as echarts from 'echarts/lib/echarts.js'
// 或者使用这种方式：
// import * as echarts from 'echarts'

// 导入 vue-echarts
import ECharts from 'vue-echarts'

// 按需引入 ECharts 模块
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/title'

// 全局注册 ECharts 组件，并传入 echarts 实例
Vue.component('v-chart', {
  extends: ECharts,
  // 如果 vue-echarts 需要 echarts 实例，可以通过这种方式传递
  beforeCreate() {
    if (!this.echarts) {
      this.echarts = echarts
    }
  }
})

// 将 echarts 挂载到 Vue 原型上，方便在组件中使用
Vue.prototype.$echarts = echarts

// 在Element UI配置之后添加
// import { Loading } from 'element-ui'
// Vue.use(Loading.directive)
// Vue.prototype.$loading = Loading.service

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')