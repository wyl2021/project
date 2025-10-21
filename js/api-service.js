/**
 * API服务模块 - 负责与后端接口通信
 */
import { API_CONFIG } from './config.js';
import { showError } from './utils.js';

class ApiService {
    constructor() {
        console.log('初始化ApiService');
        console.log('API_CONFIG:', API_CONFIG);
        this.baseUrl = API_CONFIG.BASE_URL;
        console.log('使用的baseUrl:', this.baseUrl);
        this.useMockData = API_CONFIG.DEFAULT_USE_MOCK_DATA; // 根据配置决定是否默认使用模拟数据
        console.log('是否默认使用模拟数据:', this.useMockData);
        this.apiAvailable = null; // API可用性状态
        this.checkApiAvailability(); // 初始化时检查API可用性
    }

    // 检查API可用性 - 增强CORS和端口不匹配处理
    async checkApiAvailability() {
        try {
            // 添加调试日志
            console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
            console.log('this.baseUrl:', this.baseUrl);

            let healthUrl = `${this.baseUrl}/health`;

            // 检查URL是否与配置的BASE_URL匹配，解决可能的缓存问题
            if (healthUrl.includes('localhost:8080') && API_CONFIG.BASE_URL.includes('localhost:80880')) {
                console.warn('检测到health URL端口不匹配，自动纠正');
                healthUrl = healthUrl.replace('localhost:8080', 'localhost:80880');
            }

            console.log('完整请求URL:', healthUrl);

            const response = await fetch(healthUrl, {
                method: 'GET',
                credentials: 'include', // 包含凭证，有助于解决某些CORS问题
                timeout: 3000 // 3秒超时
            });
            this.apiAvailable = response.ok;
            if (!this.apiAvailable) {
                console.warn('后端API服务不可用');
                showError('当前无法连接到服务器，将使用离线数据');
                // 自动切换到模拟数据模式以确保应用可用性
                if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                    this.useMockData = true;
                }
            }
        } catch (error) {
            console.warn('无法连接到后端API服务:', error);
            this.apiAvailable = false;

            // 增强的CORS错误处理
            if (error.message.includes('CORS')) {
                console.warn('检测到CORS跨域错误');
                showError('检测到跨域访问限制。这通常是由于浏览器的安全策略导致的，应用将自动使用离线数据。');
            }
            // 增强的网络错误处理
            else if (error.message.includes('NetworkError') ||
                error.message.includes('ERR_FAILED')) {
                console.warn('检测到网络连接错误');
                showError('无法连接到服务器，请检查您的网络连接。应用将自动使用离线数据。');
            }
            else {
                showError('当前无法连接到服务器，将使用离线数据');
            }

            // 自动切换到模拟数据模式以确保应用可用性
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
            }
        }
    }

    // 手动切换到模拟数据模式
    enableMockData() {
        this.useMockData = true;
        showError('已切换到离线数据模式');
    }

    // 手动切换到真实数据模式
    enableRealData() {
        this.useMockData = false;
        showError('已切换到在线数据模式');
    }

    // 尝试重新连接API
    async tryReconnect() {
        showError('正在尝试重新连接服务器...');
        await this.checkApiAvailability();
        if (this.apiAvailable) {
            showError('服务器连接已恢复');
        }
        // 即使连接成功，也不自动切换回真实数据模式，保持用户当前的选择
    }

    // 获取项目列表
    async getProjects() {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return this._getMockProjects();
        }

        try {
            const response = await this._fetch('/projects');
            return response.projects || [];
        } catch (error) {
            console.error('获取项目列表失败:', error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，显示离线数据');
                return this._getMockProjects();
            }
            showError('获取项目列表失败，请稍后再试');
            throw error;
        }
    }

    // 获取项目详情
    async getProjectById(id) {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return this._getMockProjectById(id);
        }

        try {
            const response = await this._fetch(`/projects/${id}`);
            return response;
        } catch (error) {
            console.error(`获取项目ID=${id}详情失败:`, error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，显示离线数据');
                return this._getMockProjectById(id);
            }
            showError('获取项目详情失败，请稍后再试');
            throw error;
        }
    }

    // 创建新项目
    async createProject(projectData) {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            // 模拟创建成功
            return { ...projectData, id: Date.now() };
        }

        try {
            const response = await this._fetch('/projects', {
                method: 'POST',
                body: JSON.stringify(projectData)
            });
            return response;
        } catch (error) {
            console.error('创建项目失败:', error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，使用离线模式创建项目');
                // 模拟创建成功
                return { ...projectData, id: Date.now() };
            }
            showError('创建项目失败，请稍后再试');
            throw error;
        }
    }

    // 更新项目
    async updateProject(id, projectData) {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            // 模拟更新成功
            return { ...projectData, id };
        }

        try {
            const response = await this._fetch(`/projects/${id}`, {
                method: 'PUT',
                body: JSON.stringify(projectData)
            });
            return response;
        } catch (error) {
            console.error(`更新项目ID=${id}失败:`, error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，使用离线模式更新项目');
                // 模拟更新成功
                return { ...projectData, id };
            }
            showError('更新项目失败，请稍后再试');
            throw error; // 抛出错误而不是自动切换到模拟数据
        }
    }

    // 删除项目
    async deleteProject(id) {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            // 模拟删除成功
            return { success: true };
        }

        try {
            const response = await this._fetch(`/projects/${id}`, {
                method: 'DELETE'
            });
            return response;
        } catch (error) {
            console.error(`删除项目ID=${id}失败:`, error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，使用离线模式删除项目');
                // 模拟删除成功
                return { success: true };
            }
            showError('删除项目失败，请稍后再试');
            throw error;
        }
    }

    // 获取团队成员
    async getTeamMembers() {
        console.log('getTeamMembers 被调用');
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return this._getMockTeamMembers();
        }

        try {
            const response = await this._fetch('/team');
            return response.members || [];
        } catch (error) {
            console.error('获取团队成员失败:', error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，显示离线数据');
                return this._getMockTeamMembers();
            }
            showError('获取团队成员失败，请稍后再试');
            throw error;
        }
    }

    // 获取项目统计数据
    async getProjectStatistics() {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return this._getMockProjectStatistics();
        }

        try {
            const response = await this._fetch('/statistics/projects');
            return response;
        } catch (error) {
            console.error('获取项目统计数据失败:', error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，显示离线数据');
                return this._getMockProjectStatistics();
            }
            showError('获取项目统计数据失败，请稍后再试');
            throw error;
        }
    }

    // 获取图表数据
    async getChartData(type) {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            return this._getMockChartData(type);
        }

        try {
            const response = await this._fetch(`/charts/${type}`);
            return response.data || {};
        } catch (error) {
            console.error(`获取${type}图表数据失败:`, error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError(`无法连接到服务器，显示离线图表数据`);
                return this._getMockChartData(type);
            }
            showError(`获取${type}图表数据失败，请稍后再试`);
            throw error;
        }
    }

    // 用户登录 - 使用正确的后端API路径
    async login(credentials) {
        // 如果强制使用模拟数据，则直接返回模拟数据
        if (this.useMockData) {
            const mockResponse = { success: true, token: 'mock-token', user: { id: 1, name: '张经理', role: 'admin' } };
            localStorage.setItem('authToken', mockResponse.token);
            return mockResponse;
        }

        try {
            console.log('登录请求参数:', credentials);
            const response = await this._fetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            // 保存token
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }

            return response;
        } catch (error) {
            console.error('登录失败:', error);
            // 出错时，如果配置了默认使用模拟数据，则返回模拟数据
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA) {
                this.useMockData = true;
                showError('无法连接到服务器，使用离线模式登录');
                const mockResponse = { success: true, token: 'mock-token', user: { id: 1, name: '张经理', role: 'admin' } };
                localStorage.setItem('authToken', mockResponse.token);
                return mockResponse;
            }
            showError('登录失败，请检查您的网络连接或稍后再试');
            throw error;
        }
    }

    // 用户登出
    logout() {
        localStorage.removeItem('authToken');
    }

    // 基础fetch方法 - 增强CORS错误处理
    async _fetch(endpoint, options = {}) {
        let url = `${this.baseUrl}${endpoint}`;
        console.log(`准备请求: ${url}`);

        // 确保使用正确的后端地址，避免端口替换问题
        if (url.includes('localhost:80880') && API_CONFIG.BASE_URL.includes('localhost:8080')) {
            console.warn('检测到URL端口不匹配，自动纠正');
            url = url.replace('localhost:80880', 'localhost:8080');
            console.log(`纠正后的URL: ${url}`);
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this._getAuthHeader()
            },
            credentials: 'include', // 包含凭证，有助于解决某些CORS问题
            ...options
        };

        // 创建一个超时Promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`请求超时 (${API_CONFIG.TIMEOUT}ms): ${url}`));
            }, API_CONFIG.TIMEOUT);
        });

        try {
            // 使用Promise.race实现超时控制
            const response = await Promise.race([
                fetch(url, defaultOptions),
                timeoutPromise
            ]);

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }

            // 处理空响应
            if (response.status === 204) {
                return {};
            }

            return await response.json();
        } catch (error) {
            console.error(`API请求错误 (${url}):`, error);

            // 增强的CORS错误处理
            if (error.message.includes('CORS')) {
                console.warn('检测到CORS跨域错误');
                showError('检测到跨域访问限制。这通常是由于浏览器的安全策略导致的，应用将自动使用离线数据。');
            }
            // 增强的网络错误处理
            else if (error.message.includes('NetworkError') ||
                error.message.includes('ERR_FAILED')) {
                console.warn('检测到网络连接错误');
                showError('无法连接到服务器，请检查您的网络连接。应用将自动使用离线数据。');
            }

            // 如果是CORS错误、网络错误或端口不匹配错误，自动切换到模拟数据模式
            if (API_CONFIG.DEFAULT_USE_MOCK_DATA &&
                (error.message.includes('CORS') ||
                    error.message.includes('NetworkError') ||
                    error.message.includes('ERR_FAILED') ||
                    url.includes('localhost:8080'))) {
                console.warn('检测到网络或配置错误，自动切换到模拟数据模式');
                this.useMockData = true;
            }

            throw error;
        }
    }

    // 获取认证头
    _getAuthHeader() {
        const token = localStorage.getItem('authToken');
        return token ? `Bearer ${token}` : '';
    }

    // Mock数据 - 项目列表
    _getMockProjects() {
        return [
            {
                id: 1,
                name: "企业官网重构",
                manager: "李明",
                managerAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23e2e8f0' stroke='%2394a3b8' stroke-width='2'/%3E%3Ccircle cx='20' cy='16' r='6' fill='%2364748b'/%3E%3Cpath d='M10 30 Q20 36 30 30' fill='none' stroke='%2364748b' stroke-width='2'/%3E%3C/svg%3E",
                progress: 85,
                deadline: "2023-12-15",
                status: "in-progress",
                description: "对企业官网进行全面重构，提升用户体验和响应速度",
                team: ["李明", "张华", "王芳"],
                tasks: 24,
                completedTasks: 20,
                budget: 150000,
                spent: 120000,
                startDate: "2023-10-01"
            },
            {
                id: 2,
                name: "移动端App开发",
                manager: "张华",
                managerAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23dbeafe' stroke='%2393c5fd' stroke-width='2'/%3E%3Ccircle cx='20' cy='16' r='6' fill='%233b82f6'/%3E%3Cpath d='M10 30 Q20 36 30 30' fill='none' stroke='%233b82f6' stroke-width='2'/%3E%3C/svg%3E",
                progress: 60,
                deadline: "2024-01-20",
                status: "in-progress",
                description: "开发企业级移动端应用，实现核心业务功能",
                team: ["张华", "刘伟", "赵敏"],
                tasks: 36,
                completedTasks: 22,
                budget: 300000,
                spent: 180000,
                startDate: "2023-09-15"
            },
            {
                id: 3,
                name: "数据分析平台搭建",
                manager: "王芳",
                managerAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23dcfce7' stroke='%2386efac' stroke-width='2'/%3E%3Ccircle cx='20' cy='16' r='6' fill='%2322c55e'/%3E%3Cpath d='M10 30 Q20 36 30 30' fill='none' stroke='%2322c55e' stroke-width='2'/%3E%3C/svg%3E",
                progress: 100,
                deadline: "2023-11-30",
                status: "completed",
                description: "搭建企业数据分析平台，整合各业务系统数据",
                team: ["王芳", "陈明", "李娜"],
                tasks: 18,
                completedTasks: 18,
                budget: 120000,
                spent: 115000,
                startDate: "2023-09-01"
            },
            {
                id: 4,
                name: "CRM系统升级",
                manager: "刘伟",
                managerAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23fef3c7' stroke='%23fcd34d' stroke-width='2'/%3E%3Ccircle cx='20' cy='16' r='6' fill='%23eab308'/%3E%3Cpath d='M10 30 Q20 36 30 30' fill='none' stroke='%23eab308' stroke-width='2'/%3E%3C/svg%3E",
                progress: 45,
                deadline: "2023-12-30",
                status: "in-progress",
                description: "升级现有CRM系统，增加客户管理新功能",
                team: ["刘伟", "王芳", "张强"],
                tasks: 32,
                completedTasks: 14,
                budget: 200000,
                spent: 85000,
                startDate: "2023-10-15"
            },
            {
                id: 5,
                name: "产品手册编写",
                manager: "赵敏",
                managerAvatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23fee2e2' stroke='%23fca5a5' stroke-width='2'/%3E%3Ccircle cx='20' cy='16' r='6' fill='%23ef4444'/%3E%3Cpath d='M10 30 Q20 36 30 30' fill='none' stroke='%23ef4444' stroke-width='2'/%3E%3C/svg%3E",
                progress: 90,
                deadline: "2023-12-10",
                status: "in-progress",
                description: "编写新产品系列的用户手册和帮助文档",
                team: ["赵敏", "李娜", "陈明"],
                tasks: 12,
                completedTasks: 11,
                budget: 50000,
                spent: 45000,
                startDate: "2023-11-01"
            }
        ];
    }

    // Mock数据 - 根据ID获取项目
    _getMockProjectById(id) {
        const projects = this._getMockProjects();
        return projects.find(project => project.id === id) || null;
    }

    // Mock数据 - 团队成员
    _getMockTeamMembers() {
        return [
            { id: 1, name: "李明", role: "项目经理", avatar: null, projects: 3, workload: 85 },
            { id: 2, name: "张华", role: "高级开发", avatar: null, projects: 4, workload: 92 },
            { id: 3, name: "王芳", role: "UI设计师", avatar: null, projects: 2, workload: 68 },
            { id: 4, name: "刘伟", role: "产品经理", avatar: null, projects: 3, workload: 75 },
            { id: 5, name: "赵敏", role: "测试工程师", avatar: null, projects: 5, workload: 90 },
            { id: 6, name: "陈明", role: "数据分析师", avatar: null, projects: 2, workload: 60 },
            { id: 7, name: "李娜", role: "内容策划", avatar: null, projects: 3, workload: 72 }
        ];
    }

    // Mock数据 - 项目统计
    _getMockProjectStatistics() {
        return {
            totalProjects: 12,
            activeProjects: 7,
            completedProjects: 5,
            delayedProjects: 2,
            onTimeRate: 83.3,
            avgCompletionRate: 68.5
        };
    }

    // Mock数据 - 图表数据
    _getMockChartData(type) {
        const chartData = {
            progressTrend: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [
                    {
                        label: '本周完成',
                        data: [12, 19, 15, 22, 18, 25, 28],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '上周完成',
                        data: [10, 15, 13, 18, 16, 20, 22],
                        borderColor: '#94A3B8',
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            projectStatus: {
                labels: ['进行中', '已完成', '延期', '计划中'],
                datasets: [
                    {
                        data: [7, 5, 2, 3],
                        backgroundColor: [
                            '#F59E0B', // warning
                            '#10B981', // secondary
                            '#EF4444', // danger
                            '#6366F1'  // info
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }
                ]
            },
            resourceAllocation: {
                labels: ['李明', '张华', '王芳', '刘伟', '赵敏', '陈明', '李娜'],
                datasets: [
                    {
                        label: '当前工作量',
                        data: [85, 92, 68, 75, 90, 60, 72],
                        backgroundColor: [
                            '#EF4444', '#EF4444', '#10B981', '#10B981',
                            '#EF4444', '#10B981', '#10B981'
                        ],
                        borderRadius: 6
                    }
                ]
            }
        };

        return chartData[type] || {};
    }
}

// 导出API服务实例
export default new ApiService();