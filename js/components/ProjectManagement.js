// 项目管理组件
import apiService from '../api-service.js';
import { showSuccess, showError } from '../utils.js';

class ProjectManagement {
    constructor() {
        this.element = null;
        this.projects = [];
        this.onProjectUpdate = null;
    }
    
    async render(onProjectUpdateCallback = null) {
        this.onProjectUpdate = onProjectUpdateCallback;
        
        // 获取项目列表
        this.projects = await apiService.getProjects();
        
        const html = `
            <!-- 项目管理区域 -->
            <section id="projects" class="bg-white rounded-xl card-shadow p-6 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-dark mb-1">项目管理</h2>
                        <p class="text-gray-500">管理和跟踪所有项目进度</p>
                    </div>
                    <button id="addProjectBtn" class="mt-4 md:mt-0 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors flex items-center font-medium">
                        <div class="icon plus mr-2"></div>新建项目
                    </button>
                </div>
                
                <!-- 项目列表 -->
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[600px]">
                        <thead>
                            <tr class="border-b border-gray-200">
                                <th class="text-left py-3 px-4 font-semibold text-gray-600">项目名称</th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-600">负责人</th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-600">状态</th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-600">进度</th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-600">截止日期</th>
                                <th class="text-left py-3 px-4 font-semibold text-gray-600">操作</th>
                            </tr>
                        </thead>
                        <tbody id="projectsTableBody">
                            ${this.projects.map(project => `
                                <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td class="py-3 px-4 font-medium">${project.name}</td>
                                    <td class="py-3 px-4 text-gray-600">${project.manager || '-'}</td>
                                    <td class="py-3 px-4">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${this.getStatusColor(project.status)}/10 text-${this.getStatusColor(project.status)}">
                                            ${project.status}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div class="bg-${this.getProgressColor(project.progress)} h-2 rounded-full" style="width: ${project.progress}%"></div>
                                        </div>
                                        <span class="text-xs text-gray-500 mt-1 inline-block">${project.progress}%</span>
                                    </td>
                                    <td class="py-3 px-4 text-gray-600">${project.dueDate || '-'}</td>
                                    <td class="py-3 px-4">
                                        <div class="flex space-x-2">
                                            <button data-id="${project.id}" class="view-project-btn text-primary hover:text-primary-dark transition-colors">
                                                <div class="icon eye"></div>
                                            </button>
                                            <button data-id="${project.id}" class="edit-project-btn text-warning hover:text-warning-dark transition-colors">
                                                <div class="icon pencil"></div>
                                            </button>
                                            <button data-id="${project.id}" class="delete-project-btn text-danger hover:text-danger-dark transition-colors">
                                                <div class="icon trash"></div>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${this.projects.length === 0 ? `
                    <div class="text-center py-10">
                        <div class="icon folder-open text-gray-300 text-5xl mb-4"></div>
                        <p class="text-gray-500">暂无项目数据</p>
                        <button id="addFirstProjectBtn" class="mt-4 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors flex items-center font-medium mx-auto">
                            <div class="icon plus mr-2"></div>创建第一个项目
                        </button>
                    </div>
                ` : ''}
            </section>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = html;
        this.element = container.firstElementChild;
        
        // 绑定事件
        this.bindEvents();
        
        return this.element;
    }
    
    bindEvents() {
        if (!this.element) return;
        
        // 添加项目按钮
        const addProjectBtn = this.element.querySelector('#addProjectBtn');
        const addFirstProjectBtn = this.element.querySelector('#addFirstProjectBtn');
        
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.showAddProjectForm();
            });
        }
        
        if (addFirstProjectBtn) {
            addFirstProjectBtn.addEventListener('click', () => {
                this.showAddProjectForm();
            });
        }
        
        // 查看项目按钮
        this.element.querySelectorAll('.view-project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = e.currentTarget.dataset.id;
                this.viewProject(projectId);
            });
        });
        
        // 编辑项目按钮
        this.element.querySelectorAll('.edit-project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = e.currentTarget.dataset.id;
                this.editProject(projectId);
            });
        });
        
        // 删除项目按钮
        this.element.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = e.currentTarget.dataset.id;
                this.deleteProject(projectId);
            });
        });
    }
    
    // 获取状态对应的颜色
    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'secondary';
            case 'in progress':
                return 'warning';
            case 'delayed':
                return 'danger';
            case 'planned':
                return 'info';
            default:
                return 'primary';
        }
    }
    
    // 获取进度对应的颜色
    getProgressColor(progress) {
        if (progress >= 90) return 'secondary';
        if (progress >= 50) return 'warning';
        if (progress >= 20) return 'primary';
        return 'danger';
    }
    
    // 查看项目详情
    async viewProject(projectId) {
        try {
            const project = await apiService.getProjectById(projectId);
            this.showProjectDetails(project);
        } catch (error) {
            console.error('获取项目详情失败:', error);
            showError('获取项目详情失败，请重试。');
        }
    }
    
    // 显示项目详情
    showProjectDetails(project) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black bg-opacity-50" id="projectModalOverlay"></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-dark">项目详情</h3>
                        <button id="closeProjectModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fa fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-6">
                        <div>
                            <h4 class="text-2xl font-bold text-primary">${project.name}</h4>
                            <div class="flex items-center mt-2 space-x-2">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${this.getStatusColor(project.status)}/10 text-${this.getStatusColor(project.status)}">
                                    ${project.status}
                                </span>
                                <span class="text-sm text-gray-500">创建于 ${project.creationDate || '-'}</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p class="text-gray-500 text-sm mb-1">负责人</p>
                                <p class="font-medium">${project.manager || '-'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm mb-1">团队成员</p>
                                <p class="font-medium">${project.teamMembers || '-'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm mb-1">开始日期</p>
                                <p class="font-medium">${project.startDate || '-'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm mb-1">截止日期</p>
                                <p class="font-medium">${project.dueDate || '-'}</p>
                            </div>
                        </div>
                        
                        <div>
                            <p class="text-gray-500 text-sm mb-2">项目进度</p>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-${this.getProgressColor(project.progress)} h-2.5 rounded-full" style="width: ${project.progress}%"></div>
                            </div>
                            <div class="flex justify-between mt-1 text-sm">
                                <span class="text-gray-500">完成情况</span>
                                <span class="font-medium">${project.progress}%</span>
                            </div>
                        </div>
                        
                        <div>
                            <p class="text-gray-500 text-sm mb-2">项目描述</p>
                            <p class="text-gray-700">${project.description || '暂无描述'}</p>
                        </div>
                        
                        <div>
                            <p class="text-gray-500 text-sm mb-2">关键里程碑</p>
                            ${project.milestones && project.milestones.length > 0 ? 
                                `<ul class="space-y-2">
                                    ${project.milestones.map(milestone => `
                                        <li class="flex items-start">
                                            <div class="mt-1 mr-2 h-2 w-2 rounded-full bg-${milestone.completed ? 'secondary' : 'primary'}"></div>
                                            <div>
                                                <p class="font-medium">${milestone.name}</p>
                                                <p class="text-sm text-gray-500">${milestone.date} ${milestone.completed ? '<span class="text-secondary">已完成</span>' : ''}</p>
                                            </div>
                                        </li>
                                    `).join('')}
                                </ul>` : 
                                '<p class="text-gray-500">暂无里程碑数据</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定关闭事件
        const closeBtn = modal.querySelector('#closeProjectModal');
        const overlay = modal.querySelector('#projectModalOverlay');
        
        function closeModal() {
            document.body.removeChild(modal);
        }
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
    }
    
    // 编辑项目
    async editProject(projectId) {
        try {
            const project = await apiService.getProjectById(projectId);
            this.showEditProjectForm(project);
        } catch (error) {
            console.error('获取项目详情失败:', error);
            showError('获取项目详情失败，请重试。');
        }
    }
    
    // 显示编辑项目表单
    showEditProjectForm(project) {
        // 编辑表单逻辑（简化版）
        alert('编辑项目功能将在后续实现');
    }
    
    // 删除项目
    async deleteProject(projectId) {
        if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) {
            return;
        }
        
        try {
            await apiService.deleteProject(projectId);
            showSuccess('项目删除成功');
            
            // 更新项目列表
            if (this.onProjectUpdate) {
                this.onProjectUpdate();
            }
        } catch (error) {
            console.error('删除项目失败:', error);
            showError('删除项目失败，请重试。');
        }
    }
    
    // 显示添加项目表单
    showAddProjectForm() {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black bg-opacity-50" id="addProjectModalOverlay"></div>
            <div class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-dark">新建项目</h3>
                        <button id="closeAddProjectModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fa fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="addProjectForm" class="space-y-6">
                        <div class="space-y-2">
                            <label for="projectName" class="block text-sm font-medium text-gray-700">项目名称 *</label>
                            <input type="text" id="projectName" name="projectName" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="请输入项目名称" required>
                        </div>
                        
                        <div class="space-y-2">
                            <label for="projectManager" class="block text-sm font-medium text-gray-700">负责人</label>
                            <input type="text" id="projectManager" name="projectManager" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="请输入负责人姓名">
                        </div>
                        
                        <div class="space-y-2">
                            <label for="projectStatus" class="block text-sm font-medium text-gray-700">项目状态</label>
                            <select id="projectStatus" name="projectStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
                                <option value="Planned">计划中</option>
                                <option value="In Progress">进行中</option>
                                <option value="Completed">已完成</option>
                                <option value="Delayed">已延期</option>
                            </select>
                        </div>
                        
                        <div class="space-y-2">
                            <label for="projectProgress" class="block text-sm font-medium text-gray-700">项目进度</label>
                            <input type="number" id="projectProgress" name="projectProgress" min="0" max="100" value="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
                        </div>
                        
                        <div class="space-y-2">
                            <label for="projectDescription" class="block text-sm font-medium text-gray-700">项目描述</label>
                            <textarea id="projectDescription" name="projectDescription" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="请输入项目描述"></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-4 pt-4">
                            <button type="button" id="cancelAddProject" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">取消</button>
                            <button type="submit" class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">创建项目</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        const form = modal.querySelector('#addProjectForm');
        const closeBtn = modal.querySelector('#closeAddProjectModal');
        const overlay = modal.querySelector('#addProjectModalOverlay');
        const cancelBtn = modal.querySelector('#cancelAddProject');
        
        function closeModal() {
            document.body.removeChild(modal);
        }
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // 表单提交
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const projectData = {
                name: document.getElementById('projectName').value,
                manager: document.getElementById('projectManager').value,
                status: document.getElementById('projectStatus').value,
                progress: parseInt(document.getElementById('projectProgress').value),
                description: document.getElementById('projectDescription').value,
                creationDate: new Date().toISOString().split('T')[0],
                milestones: []
            };
            
            try {
                await apiService.createProject(projectData);
                closeModal();
                showSuccess('项目创建成功');
                
                // 更新项目列表
                if (this.onProjectUpdate) {
                    this.onProjectUpdate();
                }
            } catch (error) {
                console.error('创建项目失败:', error);
                showError('创建项目失败，请重试。');
            }
        });
    }
    
    // 刷新项目列表
    async refreshProjects() {
        try {
            this.projects = await apiService.getProjects();
            const tableBody = this.element.querySelector('#projectsTableBody');
            
            if (tableBody) {
                tableBody.innerHTML = this.projects.map(project => `
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="py-3 px-4 font-medium">${project.name}</td>
                        <td class="py-3 px-4 text-gray-600">${project.manager || '-'}</td>
                        <td class="py-3 px-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${this.getStatusColor(project.status)}/10 text-${this.getStatusColor(project.status)}">
                                ${project.status}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-${this.getProgressColor(project.progress)} h-2 rounded-full" style="width: ${project.progress}%"></div>
                            </div>
                            <span class="text-xs text-gray-500 mt-1 inline-block">${project.progress}%</span>
                        </td>
                        <td class="py-3 px-4 text-gray-600">${project.dueDate || '-'}</td>
                        <td class="py-3 px-4">
                            <div class="flex space-x-2">
                                <button data-id="${project.id}" class="view-project-btn text-primary hover:text-primary-dark transition-colors">
                                    <i class="fa fa-eye"></i>
                                </button>
                                <button data-id="${project.id}" class="edit-project-btn text-warning hover:text-warning-dark transition-colors">
                                    <i class="fa fa-pencil"></i>
                                </button>
                                <button data-id="${project.id}" class="delete-project-btn text-danger hover:text-danger-dark transition-colors">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // 重新绑定事件
                this.bindEvents();
            }
        } catch (error) {
            console.error('刷新项目列表失败:', error);
            showError('刷新项目列表失败，请重试。');
        }
    }
}

export default ProjectManagement;