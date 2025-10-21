import Vue from 'vue'
import CustomIcon from '../components/common/CustomIcon.vue'

// 注册自定义图标组件
Vue.component('CustomIcon', CustomIcon)

// 动态导入SVG图标
const importAll = (requireContext) => requireContext.keys().map(requireContext)
try {
    // 使用webpack的require.context动态导入所有svg图标
    const req = require.context('./svg', false, /\.svg$/)
    importAll(req)
} catch (error) {
    console.error('Failed to load SVG icons:', error)
}

// 创建图标注册插件
export default {
    install(Vue) {
        Vue.component('CustomIcon', CustomIcon)
    }
}