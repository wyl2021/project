// 项目进度趋势图表组件
import apiService from '../api-service.js';
import { showError } from '../utils.js';

class ProjectTrends {
    constructor() {
        this.element = null;
        this.chartData = null;
    }
    
    async render() {
        // 获取图表数据
        this.chartData = await apiService.getChartData('progressTrend');
        
        const html = `
            <!-- 项目进度趋势图 -->
            <div class="bg-white rounded-xl card-shadow p-6 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h2 class="text-xl font-bold text-dark mb-1">项目进度趋势</h2>
                        <p class="text-gray-500">过去6个月项目完成情况</p>
                    </div>
                    <div class="flex space-x-2 mt-4 md:mt-0">
                        <button class="px-3 py-1 text-sm bg-primary text-white rounded-lg">月度</button>
                        <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">季度</button>
                        <button class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">年度</button>
                    </div>
                </div>
                
                <div class="h-[350px]">
                    <canvas id="projectProgressChart"></canvas>
                </div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = html;
        this.element = container.firstElementChild;
        
        // 初始化图表
        this.initChart();
        
        return this.element;
    }
    
    // 初始化项目进度趋势图 - 使用简单的CSS图表替代Chart.js
    initChart() {
        const chartContainer = this.element.querySelector('#projectProgressChart').parentElement;
        
        // 清除canvas元素
        chartContainer.innerHTML = '';
        
        // 创建简单的图表
        const chartData = this.chartData || {
            labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
            datasets: [
                {
                    label: '计划完成项目',
                    data: [12, 19, 15, 20, 18, 22]
                },
                {
                    label: '实际完成项目',
                    data: [10, 16, 13, 18, 17, 21]
                }
            ]
        };
        
        // 创建图例
        const legend = document.createElement('div');
        legend.className = 'flex justify-center gap-6 mb-4';
        legend.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-primary"></div>
                <span class="text-sm text-gray-600">计划完成项目</span>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-secondary"></div>
                <span class="text-sm text-gray-600">实际完成项目</span>
            </div>
        `;
        chartContainer.appendChild(legend);
        
        // 创建简单的条形图表示趋势
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'h-full flex flex-col';
        
        // 创建坐标轴
        const xAxis = document.createElement('div');
        xAxis.className = 'flex justify-between px-2 mb-1';
        chartData.labels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.className = 'text-xs text-gray-500';
            labelElement.textContent = label;
            xAxis.appendChild(labelElement);
        });
        chartWrapper.appendChild(xAxis);
        
        // 创建图表主体
        const chartBody = document.createElement('div');
        chartBody.className = 'flex-1 flex items-end justify-between px-2 gap-2';
        
        // 计算最大值用于缩放
        const maxValue = Math.max(
            ...chartData.datasets[0].data,
            ...chartData.datasets[1].data
        );
        
        // 创建条形表示每个数据点
        chartData.labels.forEach((label, index) => {
            const barGroup = document.createElement('div');
            barGroup.className = 'flex-1 flex flex-col items-center gap-1';
            
            // 计划完成项目条形
            const planBar = document.createElement('div');
            planBar.className = 'w-2 bg-primary rounded-t';
            planBar.style.height = `${(chartData.datasets[0].data[index] / maxValue) * 80}%`;
            planBar.title = `计划完成: ${chartData.datasets[0].data[index]}`;
            
            // 实际完成项目条形
            const actualBar = document.createElement('div');
            actualBar.className = 'w-2 bg-secondary rounded-t';
            actualBar.style.height = `${(chartData.datasets[1].data[index] / maxValue) * 80}%`;
            actualBar.title = `实际完成: ${chartData.datasets[1].data[index]}`;
            
            barGroup.appendChild(planBar);
            barGroup.appendChild(actualBar);
            chartBody.appendChild(barGroup);
        });
        
        chartWrapper.appendChild(chartBody);
        chartContainer.appendChild(chartWrapper);
    }
    
    // 刷新图表数据
    async refreshChart() {
        try {
            this.chartData = await apiService.getChartData('progressTrend');
            
            // 销毁旧图表并创建新图表
            const ctx = this.element.querySelector('#projectProgressChart');
            if (ctx) {
                const existingChart = Chart.getChart(ctx);
                if (existingChart) {
                    existingChart.destroy();
                }
                this.initChart();
            }
        } catch (error) {
            console.error('刷新图表数据失败:', error);
            showError('刷新图表数据失败，请重试。');
        }
    }
}

export default ProjectTrends;