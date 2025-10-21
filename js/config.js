// API配置文件
export const API_CONFIG = {
    // 后端API基础URL
    BASE_URL: 'http://localhost:8080/api', // 后端服务运行在8080端口
    // 超时设置 - 改为5秒更合理，避免页面长时间显示加载状态
    TIMEOUT: 5000,
    // 重试次数
    RETRY_COUNT: 1,
    // 开发环境下默认使用模拟数据
    DEFAULT_USE_MOCK_DATA: false
};