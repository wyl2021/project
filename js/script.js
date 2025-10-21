// 项目数据
const projectData = [
    {
        id: 1,
        name: "企业官网重构",
        manager: "李明",
        managerAvatar: null,
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
        managerAvatar: null,
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
        managerAvatar: null,
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
        managerAvatar: null,
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
        managerAvatar: null,
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

// 团队成员数据
const teamMembers = [
    { id: 1, name: "李明", role: "项目经理", avatar: null, projects: 3, workload: 85 },
    { id: 2, name: "张华", role: "高级开发", avatar: null, projects: 4, workload: 92 },
    { id: 3, name: "王芳", role: "UI设计师", avatar: null, projects: 2, workload: 68 },
    { id: 4, name: "刘伟", role: "产品经理", avatar: null, projects: 3, workload: 75 },
    { id: 5, name: "赵敏", role: "测试工程师", avatar: null, projects: 5, workload: 90 },
    { id: 6, name: "陈明", role: "数据分析师", avatar: null, projects: 2, workload: 60 },
    { id: 7, name: "李娜", role: "内容策划", avatar: null, projects: 3, workload: 72 }
];

// 图表数据
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
        labels: teamMembers.map(member => member.name),
        datasets: [
            {
                label: '当前工作量',
                data: teamMembers.map(member => member.workload),
                backgroundColor: teamMembers.map(member => {
                    const workload = member.workload;
                    if (workload > 80) return '#EF4444';
                    if (workload > 60) return '#F59E0B';
                    return '#10B981';
                }),
                borderRadius: 6
            }
        ]
    }
};

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    initCharts();
    
    // 加载项目列表
    loadProjectTable();
    
    // 加载团队成员
    loadTeamMembers();
    
    // 绑定事件
    bindEvents();
    
    // 更新统计数据
    updateStatistics();
});

// 初始化所有图表
function initCharts() {
    // 进度趋势图
    const progressCtx = document.getElementById('progressTrendChart').getContext('2d');
    new Chart(progressCtx, {
        type: 'line',
        data: chartData.progressTrend,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animations: {
                tension: {
                    duration: 1000,
                    easing: 'linear'
                }
            }
        }
    });

    // 项目状态分布图
    const statusCtx = document.getElementById('projectStatusChart').getContext('2d');
    new Chart(statusCtx, {
        type: 'doughnut',
        data: chartData.projectStatus,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            },
            cutout: '70%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });

    // 资源分配图
    const resourceCtx = document.getElementById('resourceAllocationChart').getContext('2d');
    new Chart(resourceCtx, {
        type: 'bar',
        data: chartData.resourceAllocation,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `工作量: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// 加载项目表格
function loadProjectTable() {
    const tableBody = document.getElementById('projectTableBody');
    tableBody.innerHTML = '';
    
    projectData.forEach(project => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        
        // 状态样式映射
        const statusMap = {
            'completed': { class: 'bg-green-100 text-green-800', text: '已完成' },
            'in-progress': { class: 'bg-yellow-100 text-yellow-800', text: '进行中' },
            'delayed': { class: 'bg-red-100 text-red-800', text: '已延期' },
            'planned': { class: 'bg-blue-100 text-blue-800', text: '计划中' }
        };
        
        const status = statusMap[project.status] || statusMap['planned'];
        
        // 进度条颜色
        let progressColor = 'primary';
        if (project.progress === 100) progressColor = 'secondary';
        else if (project.progress < 30) progressColor = 'danger';
        else if (project.progress < 70) progressColor = 'warning';
        
        // 计算截止日期剩余天数
        const today = new Date();
        const deadline = new Date(project.deadline);
        const timeDiff = deadline.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let deadlineClass = 'text-gray-600';
        if (daysRemaining < 0) deadlineClass = 'text-red-600 font-medium';
        else if (daysRemaining < 7) deadlineClass = 'text-yellow-600 font-medium';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${project.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full flex items-center justify-center bg-primary text-white text-xs font-medium">${project.manager.charAt(0)}</div>
                    <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">${project.manager}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 mb-1">${project.progress}%</div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="progress-bar-fill ${progressColor} h-2.5 rounded-full" style="width: ${project.progress}%"></div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${deadlineClass}">
                ${project.deadline}
                <div class="text-xs ${deadlineClass === 'text-gray-600' ? 'text-gray-500' : ''}">
                    ${daysRemaining < 0 ? `已延期${Math.abs(daysRemaining)}天` : `剩余${daysRemaining}天`}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.class}">
                    ${status.text}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-primary hover:text-primary/80 mr-3 view-project" data-id="${project.id}">
                    查看
                </button>
                <button class="text-gray-500 hover:text-gray-700 mr-3 edit-project" data-id="${project.id}">
                    编辑
                </button>
                <button class="text-gray-500 hover:text-gray-700 delete-project" data-id="${project.id}">
                    删除
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加查看项目详情的事件监听
    document.querySelectorAll('.view-project').forEach(button => {
        button.addEventListener('click', async function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            await showProjectDetails(projectId);
        });
    });
    
    // 添加编辑项目的事件监听
    document.querySelectorAll('.edit-project').forEach(button => {
        button.addEventListener('click', async function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            await showEditProjectForm(projectId);
        });
    });
    
    // 添加删除项目的事件监听
    document.querySelectorAll('.delete-project').forEach(button => {
        button.addEventListener('click', async function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            await deleteProject(projectId);
        });
    });
}

// 加载团队成员
function loadTeamMembers() {
    const teamContainer = document.querySelector('#team .space-y-4');
    teamContainer.innerHTML = '';
    
    if (teamMembers.length === 0) {
        teamContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                暂无团队成员数据
            </div>
        `;
        return;
    }
    
    teamMembers.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'team-member-card';
        
        // 工作量颜色
        let workloadColor = 'text-green-600';
        if (member.workload > 80) workloadColor = 'text-red-600';
        else if (member.workload > 60) workloadColor = 'text-yellow-600';
        
        memberCard.innerHTML = `
            <div class="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white text-sm font-medium mr-3">${member.name.charAt(0)}</div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                    <h4 class="text-sm font-medium text-gray-900 truncate">${member.name}</h4>
                    <span class="text-xs font-medium ${workloadColor}">${member.workload}%</span>
                </div>
                <div class="text-xs text-gray-500 mt-0.5">${member.role}</div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div class="h-1.5 rounded-full" style="width: ${member.workload}%; background-color: ${member.workload > 80 ? '#EF4444' : member.workload > 60 ? '#F59E0B' : '#10B981'}"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">参与 ${member.projects} 个项目</div>
            </div>
        `;
        
        teamContainer.appendChild(memberCard);
    });
}

// 显示项目详情
async function showProjectDetails(projectId) {
    showLoading(true);
    try {
        const project = await apiService.getProjectById(projectId);
        if (!project) {
            showErrorMessage('项目不存在');
            return;
        }
        
        const modal = document.getElementById('projectModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = project.name;
        
        // 状态样式映射
        const statusMap = {
            'completed': { class: 'bg-green-100 text-green-800', text: '已完成' },
            'in-progress': { class: 'bg-yellow-100 text-yellow-800', text: '进行中' },
            'delayed': { class: 'bg-red-100 text-red-800', text: '已延期' },
            'planned': { class: 'bg-blue-100 text-blue-800', text: '计划中' }
        };
        
        const status = statusMap[project.status] || statusMap['planned'];
        
        // 计算项目时间线
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.deadline);
        const today = new Date();
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 3600 * 24));
        const elapsedDays = Math.ceil((today - startDate) / (1000 * 3600 * 24));
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 3600 * 24));
        
        // 计算预算使用情况
        const budgetUsage = project.budget ? Math.round((project.spent / project.budget) * 100) : 0;
        
        modalBody.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 项目基本信息 -->
                <div>
                    <h4 class="text-sm font-medium text-gray-500 mb-3">项目基本信息</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">负责人:</span>
                            <div class="flex items-center">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-white text-xs font-medium mr-2">${project.manager.charAt(0)}</div>
                                <span class="font-medium">${project.manager}</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">状态:</span>
                            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.class}">
                                ${status.text}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">开始日期:</span>
                            <span class="font-medium">${project.startDate}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">截止日期:</span>
                            <span class="font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-gray-900'}">
                                ${project.deadline}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">项目进度:</span>
                            <span class="font-medium">${project.progress}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- 项目详细数据 -->
                <div>
                    <h4 class="text-sm font-medium text-gray-500 mb-3">项目数据</h4>
                    <div class="space-y-4">
                        <!-- 项目进度条 -->
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-600">完成进度</span>
                                <span class="font-medium">${project.progress}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="progress-bar-fill ${project.progress === 100 ? 'secondary' : project.progress < 30 ? 'danger' : project.progress < 70 ? 'warning' : 'primary'} h-2.5 rounded-full" style="width: ${project.progress}%" data-aos="width"></div>
                            </div>
                        </div>
                        
                        <!-- 预算使用情况 -->
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-600">预算使用</span>
                                <span class="font-medium">${budgetUsage}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="progress-bar-fill ${budgetUsage > 90 ? 'danger' : budgetUsage > 70 ? 'warning' : 'primary'} h-2.5 rounded-full" style="width: ${budgetUsage}%" data-aos="width"></div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                已使用 ¥${project.spent?.toLocaleString() || '0'} / 总预算 ¥${project.budget?.toLocaleString() || '0'}
                            </div>
                        </div>
                        
                        <!-- 任务完成情况 -->
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-600">任务完成率</span>
                                <span class="font-medium">${project.tasks ? Math.round((project.completedTasks / project.tasks) * 100) : 0}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="progress-bar-fill secondary h-2.5 rounded-full" style="width: ${project.tasks ? Math.round((project.completedTasks / project.tasks) * 100) : 0}%" data-aos="width"></div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                已完成 ${project.completedTasks || 0} / 共 ${project.tasks || 0} 个任务
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 项目描述 -->
            <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-500 mb-2">项目描述</h4>
                <p class="text-gray-700">${project.description || '暂无描述'}</p>
            </div>
            
            <!-- 项目团队 -->
            <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-500 mb-2">项目团队</h4>
                <div class="flex flex-wrap gap-2">
                    ${project.team?.map(member => {
                        const teamMember = teamMembers.find(tm => tm.name === member);
                        return `
                            <div class="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                <div class="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-white text-xs font-medium mr-2">${member.charAt(0)}</div>
                                <span class="text-xs font-medium text-gray-700">${member}</span>
                            </div>
                        `;
                    }).join('') || '暂无团队成员'}
                </div>
            </div>
            
            <!-- 项目时间线 -->
            <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-500 mb-3">项目时间线</h4>
                <div class="relative">
                    <!-- 时间线进度条 -->
                    <div class="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded-full"></div>
                    <div class="absolute top-0 left-0 h-1 bg-primary rounded-full" style="width: ${Math.min(Math.round((elapsedDays / totalDays) * 100), 100)}%" data-aos="width"></div>
                    
                    <!-- 时间点标记 -->
                    <div class="flex justify-between relative">
                        <div class="flex flex-col items-center">
                            <div class="w-3 h-3 rounded-full bg-primary z-10 mt-[-5px]"></div>
                            <div class="mt-2 text-xs text-gray-500">开始</div>
                            <div class="text-xs font-medium text-gray-700">${project.startDate}</div>
                        </div>
                        
                        <!-- 当前进度标记 -->
                        <div class="flex flex-col items-center" style="left: ${Math.min(Math.round((elapsedDays / totalDays) * 100), 100)}%; position: absolute;">
                            <div class="w-4 h-4 rounded-full bg-primary border-2 border-white z-20 mt-[-8px]"></div>
                            <div class="mt-2 text-xs text-primary font-medium">现在</div>
                            <div class="text-xs font-medium text-gray-700">${new Date().toISOString().split('T')[0]}</div>
                        </div>
                        
                        <div class="flex flex-col items-center">
                            <div class="w-3 h-3 rounded-full bg-gray-400 z-10 mt-[-5px]"></div>
                            <div class="mt-2 text-xs text-gray-500">结束</div>
                            <div class="text-xs font-medium text-gray-700">${project.deadline}</div>
                        </div>
                    </div>
                    
                    <!-- 时间线统计 -->
                    <div class="flex justify-between mt-6 text-sm">
                        <div class="text-gray-600">
                            <span class="font-medium text-gray-900">${Math.min(elapsedDays, totalDays)}</span> 天已过
                        </div>
                        <div class="text-gray-600">
                            总计 <span class="font-medium text-gray-900">${totalDays}</span> 天
                        </div>
                        <div class="${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-gray-600'}">
                            <span class="font-medium">${daysRemaining}</span> 天剩余
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 显示模态框
        modal.classList.add('show');
    } catch (error) {
        console.error('显示项目详情失败:', error);
        showErrorMessage('加载项目详情失败');
    } finally {
        showLoading(false);
    }
}

// 更新统计数据
function updateStatistics() {
    if (projectData.length === 0) {
        document.getElementById('totalProjects').textContent = '0';
        document.getElementById('activeProjects').textContent = '0';
        document.getElementById('completedProjects').textContent = '0';
        document.getElementById('delayedProjects').textContent = '0';
        return;
    }
    
    const totalProjects = projectData.length;
    const activeProjects = projectData.filter(p => p.status === 'in-progress').length;
    const completedProjects = projectData.filter(p => p.status === 'completed').length;
    const delayedProjects = projectData.filter(p => p.status === 'delayed').length;
    
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('activeProjects').textContent = activeProjects;
    document.getElementById('completedProjects').textContent = completedProjects;
    document.getElementById('delayedProjects').textContent = delayedProjects;
}

// 显示编辑项目表单
async function showEditProjectForm(projectId) {
    showLoading(true);
    try {
        const project = await apiService.getProjectById(projectId);
        if (!project) {
            showErrorMessage('项目不存在');
            return;
        }
        
        const modal = document.getElementById('projectModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = '编辑项目';
        modalBody.innerHTML = `
            <form id="editProjectForm" class="space-y-4">
                <input type="hidden" name="projectId" value="${project.id}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="projectName" class="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
                        <input type="text" id="projectName" name="projectName" class="form-input" placeholder="输入项目名称" value="${project.name}" required>
                    </div>
                    <div>
                        <label for="projectManager" class="block text-sm font-medium text-gray-700 mb-1">负责人 *</label>
                        <select id="projectManager" name="projectManager" class="form-input" required>
                            ${teamMembers.map(member => `
                                <option value="${member.name}" ${member.name === project.manager ? 'selected' : ''}>${member.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">开始日期 *</label>
                        <input type="date" id="startDate" name="startDate" class="form-input" value="${project.startDate}" required>
                    </div>
                    <div>
                        <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">截止日期 *</label>
                        <input type="date" id="endDate" name="endDate" class="form-input" value="${project.deadline}" required>
                    </div>
                    <div>
                        <label for="budget" class="block text-sm font-medium text-gray-700 mb-1">项目预算</label>
                        <input type="number" id="budget" name="budget" class="form-input" placeholder="输入项目预算" min="0" value="${project.budget || ''}">
                    </div>
                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
                        <select id="status" name="status" class="form-input">
                            <option value="planned" ${project.status === 'planned' ? 'selected' : ''}>计划中</option>
                            <option value="in-progress" ${project.status === 'in-progress' ? 'selected' : ''}>进行中</option>
                            <option value="completed" ${project.status === 'completed' ? 'selected' : ''}>已完成</option>
                            <option value="delayed" ${project.status === 'delayed' ? 'selected' : ''}>已延期</option>
                        </select>
                    </div>
                    <div>
                        <label for="progress" class="block text-sm font-medium text-gray-700 mb-1">项目进度</label>
                        <input type="number" id="progress" name="progress" class="form-input" placeholder="输入项目进度" min="0" max="100" value="${project.progress}">
                    </div>
                    <div>
                        <label for="spent" class="block text-sm font-medium text-gray-700 mb-1">已花费</label>
                        <input type="number" id="spent" name="spent" class="form-input" placeholder="输入已花费金额" min="0" value="${project.spent || ''}">
                    </div>
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                    <textarea id="description" name="description" rows="3" class="form-input" placeholder="输入项目描述">${project.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">项目团队</label>
                    <div class="flex flex-wrap gap-2">
                        ${teamMembers.map(member => {
                            const isSelected = project.team?.includes(member.name) || false;
                            return `
                                <label class="flex items-center bg-gray-100 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors">
                                    <input type="checkbox" name="teamMembers" value="${member.name}" class="mr-2" ${isSelected ? 'checked' : ''}>
                                    <img src="${member.avatar}" alt="${member.name}" class="w-5 h-5 rounded-full mr-2">
                                    <span class="text-xs font-medium text-gray-700">${member.name}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button type="button" id="cancelEditBtn" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                        取消
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                        保存
                    </button>
                </div>
            </form>
        `;
        
        // 绑定取消按钮事件
        document.getElementById('cancelEditBtn').addEventListener('click', function() {
            document.getElementById('projectModal').classList.remove('show');
        });
        
        // 绑定表单提交事件
        document.getElementById('editProjectForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitEditProjectForm(this);
        });
        
        // 显示模态框
        modal.classList.add('show');
    } catch (error) {
        console.error('加载编辑项目表单失败:', error);
        showErrorMessage('加载编辑表单失败');
    } finally {
        showLoading(false);
    }
}

// 提交编辑项目表单
async function submitEditProjectForm(form) {
    const formData = new FormData(form);
    const projectId = parseInt(formData.get('projectId'));
    const selectedTeamMembers = Array.from(formData.getAll('teamMembers'));
    
    const projectData = {
        name: formData.get('projectName'),
        manager: formData.get('projectManager'),
        startDate: formData.get('startDate'),
        deadline: formData.get('endDate'),
        budget: formData.get('budget') ? parseFloat(formData.get('budget')) : 0,
        status: formData.get('status'),
        progress: parseInt(formData.get('progress')),
        spent: formData.get('spent') ? parseFloat(formData.get('spent')) : 0,
        description: formData.get('description'),
        team: selectedTeamMembers
    };
    
    showLoading(true);
    try {
        const updatedProject = await apiService.updateProject(projectId, projectData);
        
        // 更新本地数据
        const index = projectData.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projectData[index] = updatedProject;
        }
        
        // 刷新UI
        loadProjectTable();
        updateStatistics();
        
        // 关闭模态框
        document.getElementById('projectModal').classList.remove('show');
        
        showSuccessMessage('项目更新成功');
    } catch (error) {
        console.error('更新项目失败:', error);
        showErrorMessage('更新项目失败');
    } finally {
        showLoading(false);
    }
}

// 删除项目
async function deleteProject(projectId) {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) {
        return;
    }
    
    showLoading(true);
    try {
        await apiService.deleteProject(projectId);
        
        // 更新本地数据
        projectData = projectData.filter(p => p.id !== projectId);
        
        // 刷新UI
        loadProjectTable();
        updateStatistics();
        
        showSuccessMessage('项目删除成功');
    } catch (error) {
        console.error('删除项目失败:', error);
        showErrorMessage('删除项目失败');
    } finally {
        showLoading(false);
    }
}

// 显示成功消息
function showSuccessMessage(message) {
    const successToast = document.createElement('div');
    successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300';
    successToast.textContent = message;
    
    document.body.appendChild(successToast);
    
    setTimeout(() => {
        successToast.classList.add('translate-y-[-20px]', 'opacity-0');
        setTimeout(() => {
            successToast.remove();
        }, 300);
    }, 3000);
}

// 绑定事件
function bindEvents() {
    // 移动端菜单切换
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
    
    // 关闭模态框
    const closeModalBtn = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const projectModal = document.getElementById('projectModal');
    
    closeModalBtn.addEventListener('click', function() {
        projectModal.classList.remove('show');
    });
    
    modalOverlay.addEventListener('click', function() {
        projectModal.classList.remove('show');
    });
    
    // 点击模态框内容区域不关闭
    const modalContent = document.getElementById('modalContent');
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // 导航栏滚动效果
    const mainHeader = document.getElementById('mainHeader');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            mainHeader.classList.add('header-scrolled');
        } else {
            mainHeader.classList.remove('header-scrolled');
        }
    });
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 关闭移动端菜单
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
    
    // 新建项目按钮
    const newProjectBtn = document.querySelector('.bg-primary.hover\:bg-primary\/90');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', function() {
            showNewProjectForm();
        });
    }
    
    // 刷新按钮
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'ml-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors';
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
    refreshBtn.title = '刷新数据';
    refreshBtn.addEventListener('click', function() {
        initApp();
    });
    
    // 将刷新按钮添加到导航栏
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.appendChild(refreshBtn);
    }
}

// 显示新建项目表单
function showNewProjectForm() {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = '新建项目';
    modalBody.innerHTML = `
        <form id="newProjectForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="projectName" class="block text-sm font-medium text-gray-700 mb-1">项目名称 *</label>
                    <input type="text" id="projectName" name="projectName" class="form-input" placeholder="输入项目名称" required>
                </div>
                <div>
                    <label for="projectManager" class="block text-sm font-medium text-gray-700 mb-1">负责人 *</label>
                    <select id="projectManager" name="projectManager" class="form-input" required>
                        ${teamMembers.map(member => `
                            <option value="${member.name}">${member.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">开始日期 *</label>
                    <input type="date" id="startDate" name="startDate" class="form-input" required>
                </div>
                <div>
                    <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">截止日期 *</label>
                    <input type="date" id="endDate" name="endDate" class="form-input" required>
                </div>
                <div>
                    <label for="budget" class="block text-sm font-medium text-gray-700 mb-1">项目预算</label>
                    <input type="number" id="budget" name="budget" class="form-input" placeholder="输入项目预算" min="0">
                </div>
                <div>
                    <label for="status" class="block text-sm font-medium text-gray-700 mb-1">项目状态</label>
                    <select id="status" name="status" class="form-input">
                        <option value="planned">计划中</option>
                        <option value="in-progress">进行中</option>
                        <option value="completed">已完成</option>
                        <option value="delayed">已延期</option>
                    </select>
                </div>
                <div>
                    <label for="progress" class="block text-sm font-medium text-gray-700 mb-1">项目进度</label>
                    <input type="number" id="progress" name="progress" class="form-input" placeholder="输入项目进度" min="0" max="100" value="0">
                </div>
                <div>
                    <label for="spent" class="block text-sm font-medium text-gray-700 mb-1">已花费</label>
                    <input type="number" id="spent" name="spent" class="form-input" placeholder="输入已花费金额" min="0" value="0">
                </div>
            </div>
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                <textarea id="description" name="description" rows="3" class="form-input" placeholder="输入项目描述"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">项目团队</label>
                <div class="flex flex-wrap gap-2">
                    ${teamMembers.map(member => `
                        <label class="flex items-center bg-gray-100 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors">
                            <input type="checkbox" name="teamMembers" value="${member.name}" class="mr-2">
                            <img src="${member.avatar}" alt="${member.name}" class="w-5 h-5 rounded-full mr-2">
                            <span class="text-xs font-medium text-gray-700">${member.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" id="cancelNewBtn" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                    取消
                </button>
                <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                    创建
                </button>
            </div>
        </form>
    `;
    
    // 绑定取消按钮事件
    document.getElementById('cancelNewBtn').addEventListener('click', function() {
        document.getElementById('projectModal').classList.remove('show');
    });
    
    // 绑定表单提交事件
    document.getElementById('newProjectForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitNewProjectForm(this);
    });
    
    // 显示模态框
    modal.classList.add('show');
}

// 提交新建项目表单
async function submitNewProjectForm(form) {
    const formData = new FormData(form);
    const selectedTeamMembers = Array.from(formData.getAll('teamMembers'));
    
    const projectData = {
        name: formData.get('projectName'),
        manager: formData.get('projectManager'),
        managerAvatar: teamMembers.find(m => m.name === formData.get('projectManager'))?.avatar || null,
        startDate: formData.get('startDate'),
        deadline: formData.get('endDate'),
        budget: formData.get('budget') ? parseFloat(formData.get('budget')) : 0,
        spent: formData.get('spent') ? parseFloat(formData.get('spent')) : 0,
        status: formData.get('status'),
        progress: parseInt(formData.get('progress')),
        description: formData.get('description'),
        team: selectedTeamMembers,
        tasks: 0,
        completedTasks: 0
    };
    
    showLoading(true);
    try {
        const newProject = await apiService.createProject(projectData);
        
        // 添加到本地数据
        projectData.push(newProject);
        
        // 刷新UI
        loadProjectTable();
        updateStatistics();
        
        // 关闭模态框
        document.getElementById('projectModal').classList.remove('show');
        
        showSuccessMessage('项目创建成功');
    } catch (error) {
        console.error('创建项目失败:', error);
        showErrorMessage('创建项目失败');
    } finally {
        showLoading(false);
    }
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    showErrorMessage('发生错误，请刷新页面重试');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    showErrorMessage('发生错误，请刷新页面重试');
});