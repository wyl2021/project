// 仪表盘概览组件
import apiService from '../api-service.js';
import { showError } from '../utils.js';

class DashboardOverview {
    constructor() {
        this.element = null;
        this.statistics = null;
    }
    
    async render() {
        // 获取项目统计数据
        this.statistics = await apiService.getProjectStatistics();
        
        const html = `
            <!-- 仪表盘概览卡片 -->
            <section id="dashboard" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- 总项目数卡片 -->
                <div class="bg-white rounded-xl card-shadow p-6 hover-scale">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">总项目数</p>
                            <h3 class="text-3xl font-bold mt-1" id="totalProjects">${this.statistics.totalProjects || 0}</h3>
                        </div>
                        <div class="bg-primary/10 p-3 rounded-lg">
                            <div class="icon folder-open text-primary text-xl"></div>
                        </div>
                    </div>
                    <div class="flex items-center text-sm">
                        <span class="text-secondary font-medium flex items-center">
                            <div class="icon arrow-up mr-1"></div>12%
                        </span>
                        <span class="text-gray-500 ml-2">相比上月</span>
                    </div>
                </div>

                <!-- 进行中项目卡片 -->
                <div class="bg-white rounded-xl card-shadow p-6 hover-scale">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">进行中项目</p>
                            <h3 class="text-3xl font-bold mt-1" id="activeProjects">${this.statistics.activeProjects || 0}</h3>
                        </div>
                        <div class="bg-warning/10 p-3 rounded-lg">
                            <div class="icon spinner text-warning text-xl"></div>
                        </div>
                    </div>
                    <div class="flex items-center text-sm">
                        <span class="text-warning font-medium flex items-center">
                            <div class="icon minus mr-1"></div>0%
                        </span>
                        <span class="text-gray-500 ml-2">相比上月</span>
                    </div>
                </div>

                <!-- 已完成项目卡片 -->
                <div class="bg-white rounded-xl card-shadow p-6 hover-scale">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">已完成项目</p>
                            <h3 class="text-3xl font-bold mt-1" id="completedProjects">${this.statistics.completedProjects || 0}</h3>
                        </div>
                        <div class="bg-secondary/10 p-3 rounded-lg">
                            <div class="icon check-circle text-secondary text-xl"></div>
                        </div>
                    </div>
                    <div class="flex items-center text-sm">
                        <span class="text-secondary font-medium flex items-center">
                            <div class="icon arrow-up mr-1"></div>25%
                        </span>
                        <span class="text-gray-500 ml-2">相比上月</span>
                    </div>
                </div>

                <!-- 延期项目卡片 -->
                <div class="bg-white rounded-xl card-shadow p-6 hover-scale">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-gray-500 text-sm font-medium">延期项目</p>
                            <h3 class="text-3xl font-bold mt-1" id="delayedProjects">${this.statistics.delayedProjects || 0}</h3>
                        </div>
                        <div class="bg-danger/10 p-3 rounded-lg">
                            <div class="icon exclamation-triangle text-danger text-xl"></div>
                        </div>
                    </div>
                    <div class="flex items-center text-sm">
                        <span class="text-danger font-medium flex items-center">
                            <div class="icon arrow-down mr-1"></div>33%
                        </span>
                        <span class="text-gray-500 ml-2">相比上月</span>
                    </div>
                </div>
            </section>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = html;
        this.element = container.firstElementChild;
        
        return this.element;
    }
    
    // 更新统计数据
    async updateStatistics() {
        if (!this.element) return;
        
        try {
            const newStatistics = await apiService.getProjectStatistics();
            this.statistics = newStatistics;
            
            // 更新DOM
            document.getElementById('totalProjects').textContent = this.statistics.totalProjects || 0;
            document.getElementById('activeProjects').textContent = this.statistics.activeProjects || 0;
            document.getElementById('completedProjects').textContent = this.statistics.completedProjects || 0;
            document.getElementById('delayedProjects').textContent = this.statistics.delayedProjects || 0;
        } catch (error) {
            console.error('更新统计数据失败:', error);
        }
    }
}

export default DashboardOverview;