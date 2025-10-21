// 团队成员组件
import apiService from '../api-service.js';
import { showError } from '../utils.js';

class TeamMembers {
    constructor() {
        this.element = null;
        this.teamMembers = [];
    }
    
    async render() {
        // 获取团队成员数据
        this.teamMembers = await apiService.getTeamMembers();
        
        const html = `
            <!-- 团队成员和资源分配 -->
            <section id="team" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- 团队成员列表 -->
                <div class="bg-white rounded-xl card-shadow p-6 col-span-1">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-xl font-bold text-dark mb-1">团队成员</h2>
                            <p class="text-gray-500">${this.teamMembers.length} 位成员</p>
                        </div>
                        <button id="addTeamMemberBtn" class="text-primary hover:text-primary-dark transition-colors">
                            <i class="fa fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4" id="teamMembersList">
                        ${this.teamMembers.map(member => `
                            <div class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-primary text-white font-medium">${member.name.charAt(0)}</div>
                                <div class="flex-1">
                                    <h4 class="font-medium">${member.name}</h4>
                                    <p class="text-sm text-gray-500">${member.role}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        ${member.projects} 项目
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 资源分配 -->
                <div class="bg-white rounded-xl card-shadow p-6 col-span-1 lg:col-span-2">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h2 class="text-xl font-bold text-dark mb-1">资源分配</h2>
                            <p class="text-gray-500">团队成员工作量分布</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">本周</button>
                            <button class="px-3 py-1 text-sm bg-primary text-white rounded-lg">本月</button>
                            <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">全年</button>
                        </div>
                    </div>
                    
                    <!-- 资源分配图表 -->
                    <div class="h-[300px]">
                        <canvas id="resourceAllocationChart"></canvas>
                    </div>
                </div>
            </section>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = html;
        this.element = container.firstElementChild;
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化图表
        this.initChart();
        
        return this.element;
    }
    
    bindEvents() {
        if (!this.element) return;
        
        // 添加团队成员按钮
        const addTeamMemberBtn = this.element.querySelector('#addTeamMemberBtn');
        
        if (addTeamMemberBtn) {
            addTeamMemberBtn.addEventListener('click', () => {
                // 添加团队成员功能将在后续实现
                alert('添加团队成员功能将在后续实现');
            });
        }
    }
    
    // 初始化资源分配图表 - 使用简单的CSS图表替代Chart.js
    initChart() {
        const chartContainer = this.element.querySelector('#resourceAllocationChart').parentElement;
        
        // 清除canvas元素
        chartContainer.innerHTML = '';
        
        // 获取资源分配数据
        const resourceData = this.teamMembers.map(member => ({
            name: member.name,
            workload: member.workload || Math.floor(Math.random() * 80) + 20,
            capacity: 100
        }));
        
        // 创建简单的条形图表示资源分配
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'h-full flex flex-col';
        
        // 创建图例
        const legend = document.createElement('div');
        legend.className = 'flex justify-center gap-6 mb-4';
        
        const legendWorkload = document.createElement('div');
        legendWorkload.className = 'flex items-center gap-2';
        legendWorkload.innerHTML = `<span class="w-3 h-3 bg-[#4F46E5] rounded-sm"></span><span class="text-sm text-gray-700">工作量</span>`;
        
        const legendCapacity = document.createElement('div');
        legendCapacity.className = 'flex items-center gap-2';
        legendCapacity.innerHTML = `<span class="w-3 h-3 bg-[#E5E7EB] rounded-sm"></span><span class="text-sm text-gray-700">剩余容量</span>`;
        
        legend.appendChild(legendWorkload);
        legend.appendChild(legendCapacity);
        chartWrapper.appendChild(legend);
        
        // 创建图表主体
        const chartBody = document.createElement('div');
        chartBody.className = 'flex-1 flex flex-col justify-between gap-4';
        
        // 创建每个条形
        resourceData.forEach(item => {
            const barItem = document.createElement('div');
            barItem.className = 'flex items-end gap-2';
            
            // 标签
            const labelElement = document.createElement('div');
            labelElement.className = 'w-20 text-sm text-gray-700 shrink-0';
            labelElement.textContent = item.name;
            
            // 条形容器
            const barsContainer = document.createElement('div');
            barsContainer.className = 'flex-1 h-48 relative';
            
            // 剩余容量条
            const capacityBar = document.createElement('div');
            capacityBar.className = 'absolute bottom-0 left-0 h-full bg-[#E5E7EB] rounded-md';
            capacityBar.style.width = '100%';
            
            // 工作量条
            const workloadBar = document.createElement('div');
            workloadBar.className = 'absolute bottom-0 left-0 h-full bg-primary rounded-md workload-bar';
            workloadBar.style.width = `${item.workload}%`;
            workloadBar.title = `${item.name}: ${item.workload}% 工作量`;
            workloadBar.style.transition = 'width 1s ease-out';
            
            barsContainer.appendChild(capacityBar);
            barsContainer.appendChild(workloadBar);
            
            // 百分比
            const percentage = document.createElement('div');
            percentage.className = 'w-12 text-sm text-gray-600 text-right';
            percentage.textContent = `${item.workload}%`;
            
            barItem.appendChild(labelElement);
            barItem.appendChild(barsContainer);
            barItem.appendChild(percentage);
            chartBody.appendChild(barItem);
        });
        
        chartWrapper.appendChild(chartBody);
        chartContainer.appendChild(chartWrapper);
        
        // 触发动画
        setTimeout(() => {
            const bars = chartContainer.querySelectorAll('.workload-bar');
            bars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 100);
    }
    
    // 刷新团队成员列表
    async refreshTeamMembers() {
        try {
            this.teamMembers = await apiService.getTeamMembers();
            const membersList = this.element.querySelector('#teamMembersList');
            
            if (membersList) {
                membersList.innerHTML = this.teamMembers.map(member => `
                    <div class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-primary text-white font-medium">${member.name.charAt(0)}</div>
                        <div class="flex-1">
                            <h4 class="font-medium">${member.name}</h4>
                            <p class="text-sm text-gray-500">${member.role}</p>
                        </div>
                        <div class="flex space-x-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                ${member.projects} 项目
                            </span>
                        </div>
                    </div>
                `).join('');
                
                // 重新绑定事件
                this.bindEvents();
                
                // 重新初始化图表
                this.initChart();
            }
        } catch (error) {
            console.error('刷新团队成员列表失败:', error);
            showError('刷新团队成员列表失败，请重试。');
        }
    }
}

export default TeamMembers;