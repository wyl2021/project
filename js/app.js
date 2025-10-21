// 主应用脚本
// 导入工具函数
import { showSuccess, showError, showLoading, hideLoading } from './utils.js';
// 导入认证相关函数
import { isAuthenticated, ensureAuthenticated, getCurrentUser } from './auth.js';
// 导入组件
import NavBar from './components/NavBar.js';
import DashboardOverview from './components/DashboardOverview.js';
import ProjectManagement from './components/ProjectManagement.js';
import TeamMembers from './components/TeamMembers.js';
import ProjectTrends from './components/ProjectTrends.js';

class App {
    constructor() {
        this.navBar = null;
        this.dashboardOverview = null;
        this.projectManagement = null;
        this.teamMembers = null;
        this.projectTrends = null;
        this.mainContent = null;
    }
    
    async init() {
        // 确保用户已登录
        if (!ensureAuthenticated()) {
            return;
        }
        
        // 获取主内容区域
        this.mainContent = document.getElementById('mainContent');
        
        if (!this.mainContent) {
            console.error('未找到主内容区域');
            return;
        }
        
        // 显示加载状态
        showLoading();
        
        try {
            // 初始化导航栏
            this.navBar = new NavBar();
            const navBarElement = await this.navBar.render();
            document.body.insertBefore(navBarElement, this.mainContent);
            
            // 初始化仪表盘概览
            this.dashboardOverview = new DashboardOverview();
            const dashboardOverviewElement = await this.dashboardOverview.render();
            this.mainContent.appendChild(dashboardOverviewElement);
            
            // 初始化项目进度趋势图
            this.projectTrends = new ProjectTrends();
            const projectTrendsElement = await this.projectTrends.render();
            this.mainContent.appendChild(projectTrendsElement);
            
            // 初始化项目管理
            this.projectManagement = new ProjectManagement();
            const projectManagementElement = await this.projectManagement.render(() => {
                // 项目更新回调，用于刷新相关组件
                this.refreshAfterProjectUpdate();
            });
            this.mainContent.appendChild(projectManagementElement);
            
            // 初始化团队成员
            this.teamMembers = new TeamMembers();
            const teamMembersElement = await this.teamMembers.render();
            this.mainContent.appendChild(teamMembersElement);
            
            // 添加全局刷新按钮
            this.addRefreshButton();
            
            // 初始化全局事件监听
            this.initGlobalEventListeners();
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            showError('系统初始化失败，请刷新页面重试。');
        } finally {
            // 隐藏加载状态
            hideLoading();
        }
    }
    
    // 添加全局刷新按钮
    addRefreshButton() {
        // 检查是否已存在刷新按钮
        let refreshButton = document.getElementById('globalRefreshButton');
        
        if (refreshButton) {
            return;
        }
        
        refreshButton = document.createElement('button');
        refreshButton.id = 'globalRefreshButton';
        refreshButton.className = 'fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-40';
        refreshButton.innerHTML = '<i class="fa fa-refresh"></i>';
        refreshButton.title = '刷新数据';
        
        // 绑定点击事件
        refreshButton.addEventListener('click', async () => {
            await this.refreshAllData();
        });
        
        document.body.appendChild(refreshButton);
    }
    
    // 刷新所有数据
    async refreshAllData() {
        // 显示加载状态
        const refreshButton = document.getElementById('globalRefreshButton');
        const originalIcon = refreshButton.innerHTML;
        refreshButton.innerHTML = '<i class="fa fa-refresh fa-spin"></i>';
        refreshButton.disabled = true;
        
        try {
            // 刷新仪表盘统计数据
            if (this.dashboardOverview) {
                await this.dashboardOverview.updateStatistics();
            }
            
            // 刷新项目列表
            if (this.projectManagement) {
                await this.projectManagement.refreshProjects();
            }
            
            // 刷新团队成员
            if (this.teamMembers) {
                await this.teamMembers.refreshTeamMembers();
            }
            
            // 刷新项目趋势图表
            if (this.projectTrends) {
                await this.projectTrends.refreshChart();
            }
            
            showSuccess('数据刷新成功');
        } catch (error) {
            console.error('刷新数据失败:', error);
            showError('数据刷新失败，请重试。');
        } finally {
            // 恢复按钮状态
            refreshButton.innerHTML = originalIcon;
            refreshButton.disabled = false;
        }
    }
    
    // 项目更新后刷新相关组件
    async refreshAfterProjectUpdate() {
        try {
            // 刷新仪表盘统计数据
            if (this.dashboardOverview) {
                await this.dashboardOverview.updateStatistics();
            }
            
            // 刷新项目列表
            if (this.projectManagement) {
                await this.projectManagement.refreshProjects();
            }
            
            // 刷新项目趋势图表
            if (this.projectTrends) {
                await this.projectTrends.refreshChart();
            }
        } catch (error) {
            console.error('刷新相关组件失败:', error);
        }
    }
    
    // 初始化全局事件监听
    initGlobalEventListeners() {
        // 监听键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R 刷新数据
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshAllData();
            }
        });
        
        // 监听窗口大小变化，重新调整图表大小
        window.addEventListener('resize', () => {
            // 可以在这里添加图表大小调整逻辑
        });
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
            showSuccess('网络连接已恢复');
        });
        
        window.addEventListener('offline', () => {
            showError('网络连接已断开，请检查您的网络');
        });
    }
}

// 导出应用实例
export default App;

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});