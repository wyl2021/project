<template>
  <div class="project-management">
    <el-card shadow="hover">
      <div class="card-header">
        <div class="header-left">
          <h3>项目管理</h3>
          <p class="sub-title">管理所有项目的创建、编辑和删除</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="showAddProjectForm">
            <!-- <CustomIcon name="add" size="16" color="#fff" /> -->
            <i class="el-icon-plus"></i>
            <span>添加项目</span>
          </el-button>
        </div>
      </div>

      <div class="card-body">
        <!-- 搜索和筛选 -->
        <div class="search-filter">
          <el-input v-model="searchKeyword" placeholder="搜索项目名称、负责人" clearable class="search-input">
            <el-select v-model="statusFilter" slot="prepend" placeholder="筛选状态" clearable class="filter-select">
              <el-option label="全部" value=""></el-option>
              <el-option label="进行中" value="in-progress"></el-option>
              <el-option label="已完成" value="completed"></el-option>
              <el-option label="延期" value="delayed"></el-option>
              <el-option label="计划中" value="planned"></el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>


        </div>

        <!-- 项目列表表格 -->
        <el-table v-loading="loading" :data="projects" style="width: 100%" stripe border>
          <el-table-column prop="name" label="项目名称" min-width="200">
            <template slot-scope="scope">
              <span class="project-name">{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="manager" label="负责人" width="120">
            <template slot-scope="scope">
              <span class="manager-name">{{ scope.row.manager ? scope.row.manager.name : '未分配' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="totalProgress" label="进度" width="150">
            <template slot-scope="scope">
              <el-progress :percentage="scope.row.totalProgress" :status="getProgressStatus(scope.row.totalProgress)" />
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="150">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="endTime" label="截止日期" width="120">
            <template slot-scope="scope">
              <span class="endTime">{{ formatDate(scope.row.endTime) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewProject(scope.row)">查看</el-button>
              <el-button type="text" size="small" @click="editProject(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="deleteProject(scope.row.id)" danger>删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="totalItems" :page-size="pageSize"
            :page-sizes="[5, 10, 20, 50]" v-model="currentPage" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>

    <!-- 项目详情对话框 -->
    <el-dialog title="项目详情" :visible.sync="showProjectDetail" width="700px" :modal="true" :close-on-click-modal="false">
      <div v-if="selectedProject" class="project-detail">
        <div class="detail-header">
          <h4>{{ selectedProject.name }}</h4>
          <el-tag :type="getStatusType(selectedProject.status)">{{ getStatusText(selectedProject.status) }}</el-tag>
        </div>
        <div class="detail-content">
          <div class="detail-row">
            <div class="detail-item">
              <label>负责人：</label>
              <span>{{ selectedProject.manager ? selectedProject.manager.name : '未分配' }}</span>
            </div>
            <div class="detail-item">
              <label>进度：</label>
              <span>{{ selectedProject.totalProgress }}%</span>
            </div>
          </div>
          <div class="detail-row">
            // 在项目详情区域的团队成员选择器
            <div class="detail-item full-width">
              <label>团队成员：</label>
              <el-select v-model="selectedProject.teamMembers" multiple placeholder="无团队成员" style="width: 100%"
                disabled>
                <el-option v-for="user in users" :key="`detail-${user.id}`" :label="user.name" :value="user.name" />
              </el-select>
            </div>

            // 在添加/编辑表单的团队成员选择器
            <el-form-item label="团队成员" prop="team">
              <el-select v-model="projectForm.teamMembers" multiple placeholder="请选择团队成员" style="width: 100%">
                <el-option v-for="user in users" :key="`form-team-${user.id}`" :label="user.name" :value="user.id" />
              </el-select>
              <div style="margin-top: 8px; color: #999; font-size: 12px;">
                注：选择负责人后会自动添加到团队成员中
              </div>
            </el-form-item>

            // 在负责人选择器
            <el-form-item label="项目负责人" prop="manager.id">
              <el-select v-model="projectForm.manager.id" placeholder="请选择负责人">
                <el-option v-for="user in users" :key="`form-manager-${user.id}`" :label="user.name" :value="user.id" />
              </el-select>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑项目表单 -->
    <el-dialog :title="editingProject ? '编辑项目' : '添加项目'" :visible.sync="showProjectForm" width="600px" :modal="true"
      :close-on-click-modal="false">
      <el-form ref="projectForm" :model="projectForm" :rules="projectRules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>

        <el-form-item label="项目负责人" prop="manager.id">
          <el-select v-model="projectForm.manager.id" placeholder="请选择负责人">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="团队成员" prop="team">
          <el-select v-model="projectForm.teamMembers" multiple placeholder="请选择团队成员" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
          <div style="margin-top: 8px; color: #999; font-size: 12px;">
            注：选择负责人后会自动添加到团队成员中
          </div>
        </el-form-item>

        <el-form-item label="项目状态" prop="status">
          <el-select v-model="projectForm.status.value" placeholder="请选择项目状态">
            <el-option label="计划中" value="planned" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="延期" value="delayed" />
          </el-select>
        </el-form-item>

        <el-form-item label="进度" prop="totalProgress">
          <el-slider v-model="projectForm.totalProgress" :min="0" :max="100" show-input />
        </el-form-item>

        <el-form-item label="开始日期" prop="startTime">
          <el-date-picker v-model="projectForm.startTime" type="date" placeholder="选择开始日期" />
        </el-form-item>

        <el-form-item label="截止日期" prop="endTime">
          <el-date-picker v-model="projectForm.endTime" type="date" placeholder="选择截止日期" />
        </el-form-item>

        <el-form-item label="项目描述" prop="description">
          <el-input v-model="projectForm.description" type="textarea" placeholder="请输入项目描述" :rows="3" />
        </el-form-item>

        <!-- <el-form-item label="预算" prop="budget">
          <el-input-number v-model="projectForm.budget" :min="0" placeholder="请输入项目预算" />
        </el-form-item> -->
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelProjectForm">取消</el-button>
        <el-button type="primary" @click="submitProjectForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProjectManagement',
  data() {
    return {
      projects: [],
      teamMembers: [],
      users: [], // 新增users数组存储完整用户列表
      loading: false,
      searchKeyword: '',
      statusFilter: '',
      pageSize: 10,
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      showProjectDetail: false,
      showProjectForm: false,
      editingProject: null,
      selectedProject: null,
      projectForm: {
        name: '',
        manager: {},
        totalProgress: 0,
        status: { value: 'planned' },
        deadline: '',
        description: '',
        teamMembers: [], // 从team改为teamMembers
        budget: 0,
        spent: 0,
        startDate: ''
      },
      projectRules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { min: 2, max: 50, message: '项目名称长度在 2 到 50 个字符之间', trigger: 'blur' }
        ],
        'manager.name': [ // 修改为嵌套属性路径
          { required: true, message: '请输入负责人姓名', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择项目状态', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择截止日期', trigger: 'change' }
        ]
      },
      searchTimer: null // 添加防抖定时器
    }
  },
  methods: {
    // 日期格式化方法 - 将完整时间格式转换为只显示年月日
    formatDate(dateString) {
      if (!dateString) return '-';
      // 检查是否包含时间部分
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      return dateString;
    },
    // 添加获取团队成员的方法
    async getTeamMembers() {
      try {
        const data = await this.$api.getTeamMembers();
        // 确保teamMembers始终是数组类型
        const membersData = data.content || data;
        this.teamMembers = Array.isArray(membersData) ? membersData : [];
      } catch (error) {
        console.error('获取团队成员失败:', error);
        this.teamMembers = [];
        this.$message.error(error.message || '获取团队成员失败');
      }
    },

    // 添加获取完整用户列表的方法
    async getUsers() {
      try {
        const data = await this.$api.getUsers();
        const rawUsers = Array.isArray(data) ? data : (data.data || []);

        // 去重处理，确保每个用户ID唯一
        const uniqueUsers = [];
        const idSet = new Set();

        for (const user of rawUsers) {
          if (user.id && !idSet.has(user.id)) {
            idSet.add(user.id);
            uniqueUsers.push(user);
          }
        }

        this.users = uniqueUsers;
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.users = [];
        this.$message.error(error.message || '获取用户列表失败');
      }
    },

    // 修改刷新方法，同时获取团队成员、用户列表和项目
    async refresh() {
      try {
        await Promise.all([
          this.getTeamMembers(),
          this.getUsers(),
          this.getProjects()
        ]);
      } catch (error) {
        console.error('刷新数据失败:', error);
      }
    },

    // 搜索和筛选 - 添加防抖处理
    searchAndFilter() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.currentPage = 1
        this.getProjects()
      }, 300) // 300毫秒防抖
    },

    // 处理分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getProjects()
    },

    // 处理当前页变化
    handleCurrentChange(current) {
      this.currentPage = current
      this.getProjects()
    },

    // 在 refresh 方法之后添加 getProjects 方法
    async refreshProjects() {
      await this.getProjects()
    },

    // 添加缺失的 getProjects 方法
    async getProjects() {
      this.loading = true
      try {
        const data = await this.$api.getProjects(
          this.currentPage - 1,
          this.pageSize,
          this.statusFilter,
          '',
          this.searchKeyword
        )
        this.projects = data.content || data
        this.totalItems = data.totalItems || this.projects.length
        this.totalPages = data.totalPages || Math.ceil(this.projects.length / this.pageSize)

        // 转换项目数据中的manager为对象格式
        this.projects = this.projects.map(project => {
          if (typeof project.manager === 'string') {
            // 优先从完整用户列表中查找
            const user = this.users.find(u => u.name === project.manager);
            if (user) {
              return { ...project, manager: { id: user.id, name: user.name } };
            }
            // 如果在用户列表中找不到，再从团队成员中查找
            const member = this.teamMembers.find(m => m.name === project.manager);
            if (member) {
              return { ...project, manager: { id: member.id, name: member.name } };
            } else {
              return { ...project, manager: { name: project.manager } };
            }
          }
          return project;
        });
      } catch (error) {
        console.error('获取项目列表失败:', error)
        this.$message.error(error.message || '获取项目列表失败')
      } finally {
        this.loading = false
      }
    },

    // 修改viewProject方法，正确处理对象格式的teamMembers数据
    viewProject(project) {
      // 深拷贝项目数据
      const projectCopy = { ...project };
    
      // 如果团队成员是对象数组，直接提取name属性
      if (projectCopy.teamMembers && Array.isArray(projectCopy.teamMembers)) {
        projectCopy.teamMembers = projectCopy.teamMembers.map(member => {
          // 如果是对象且有name属性，直接返回name
          if (typeof member === 'object' && member.name) {
            return member.name;
          }
          // 兼容处理：如果仍然是ID，则保持原有的查找逻辑
          else {
            // 先从用户列表中查找
            const user = this.users.find(u => u.id === member);
            if (user) return user.name;
    
            // 如果用户列表中找不到，从团队成员列表中查找
            const foundMember = this.teamMembers.find(m => m.id === member);
            if (foundMember) return foundMember.name;
    
            // 如果都找不到，返回原始值
            return member;
          }
        });
      }
    
      this.selectedProject = projectCopy;
      this.showProjectDetail = true;
    },

    // 显示添加项目表单
    showAddProjectForm() {
      this.editingProject = null
      this.resetProjectForm()
      this.showProjectForm = true
    },

    // 编辑项目
    editProject(project) {
      this.editingProject = { ...project }
      // 如果团队成员是名称数组，转换为ID数组
      const teamMemberIds = project.teamMembers && Array.isArray(project.teamMembers)
        ? project.teamMembers.map(member => {
          // 优先从用户列表中查找成员ID
          const user = this.users.find(u => u.name === member);
          if (user) return user.id;

          // 如果用户列表中找不到，再从团队成员列表中查找
          const foundMember = this.teamMembers.find(m => m.name === member);
          return foundMember ? foundMember.id : member;
        })
        : [];

      this.projectForm = {
        ...project,
        manager: project.manager || {},
        // 如果后端返回的是字符串，需要转换为对象格式
        status: typeof project.status === 'string' ? { value: project.status } : project.status,
        teamMembers: teamMemberIds
      }

      // 确保负责人在团队成员列表中
      if (project.manager && project.manager.id && !teamMemberIds.includes(project.manager.id)) {
        this.projectForm.teamMembers = [...teamMemberIds, project.manager.id];
      }
      console.log('编辑项目表单数据:', this.projectForm)
      this.showProjectForm = true
    },

    // 重置项目表单
    resetProjectForm() {
      this.projectForm = {
        name: '',
        manager: {},
        totalProgress: 0,
        status: { value: 'planned' },
        deadline: '',
        description: '',
        teamMembers: [],
        budget: 0,
        spent: 0,
        startDate: ''
      }
    },

    // 取消项目表单
    cancelProjectForm() {
      this.showProjectForm = false
      this.resetProjectForm()
    },

    // 修改submitProjectForm方法中的数据提交逻辑
    async submitProjectForm() {
      this.$refs.projectForm.validate(async (valid) => {
        if (valid) {
          try {
            // 定义submitData变量，确保数据格式正确
            const { teamMembers, ...otherFormData } = this.projectForm;
            const submitData = {
              ...otherFormData,
              // 将teamMembers重命名为teamMemberIds
              teamMemberIds: teamMembers,
              // 确保status是字符串格式而不是对象
              status: typeof this.projectForm.status === 'object' ? this.projectForm.status.value : this.projectForm.status,
              // 确保manager是正确的格式
              manager: this.projectForm.manager.id ? { id: this.projectForm.manager.id } : {}
            };

            if (this.editingProject) {
              // 编辑项目
              await this.$api.updateProject(this.editingProject.id, submitData)
              this.$message.success('项目更新成功')
            } else {
              // 添加项目
              await this.$api.createProject(submitData)
              this.$message.success('项目添加成功')
            }

            // 关闭表单并刷新项目列表
            this.showProjectForm = false
            this.resetProjectForm()
            await this.refreshProjects()
          } catch (error) {
            console.error('提交项目表单失败:', error)
            this.$message.error(error.message || '操作失败，请重试')
          }
        }
      })
    },

    // 删除项目
    deleteProject(id) {
      this.$confirm('确定要删除这个项目吗？', '删除项目', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await this.$api.deleteProject(id)
          this.$message.success('项目删除成功')
          await this.refreshProjects()
        } catch (error) {
          console.error('删除项目失败:', error)
          this.$message.error(error.message || '删除失败，请重试')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },

    // 获取进度状态
    getProgressStatus(progress) {
      if (progress === 100) return 'success'
      if (progress >= 80) return 'warning'
      if (progress >= 60) return 'exception'
      return undefined
    },

    // 获取状态文本
    getStatusText(status) {
      // 适配对象格式的status
      const statusValue = typeof status === 'object' && status !== null ? status.value : status
      const statusMap = {
        'planned': '计划中',
        'in-progress': '进行中',
        'completed': '已完成',
        'delayed': '延期'
      }
      return statusMap[statusValue] || statusValue
    },

    // 获取状态标签类型
    getStatusType(status) {
      // 适配对象格式的status
      const statusValue = typeof status === 'object' && status !== null ? status.value : status
      const typeMap = {
        '未开始': 'info',
        '进行中': 'warning',
        '已完成': 'success',
        '延期': 'danger'
      }
      return typeMap[statusValue] || 'info'
    },

    // 刷新数据
    async refresh() {
      await this.refreshProjects()
    }
  },

  // 修复watch位置和配置
  watch: {
    // 监听搜索和筛选条件变化，更新项目列表
    searchKeyword: {
      handler() {
        this.searchAndFilter()
      },
      immediate: false // 移除immediate，避免初始重复调用
    },
    statusFilter: {
      handler() {
        this.searchAndFilter()
      },
      immediate: false // 移除immediate，避免初始重复调用
    }
  },

  // 组件挂载时获取项目列表、团队成员和用户列表
  async mounted() {
    await Promise.all([
      this.getTeamMembers(),
      this.getUsers()
    ]);
    await this.getProjects();
    console.log('项目列表:', this.projectForm);
  },

  // 组件卸载时清理定时器
  beforeUnmount() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  }
}
</script>

<style scoped lang="scss">
.project-management {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.sub-title {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.search-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  width: 400px;
}

.filter-select {
  width: 80px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.project-detail {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.detail-item {
  flex: 1;
  min-width: 250px;
}

.detail-item.full-width {
  min-width: 100%;
}

.detail-item label {
  font-weight: 500;
  color: #666;
  margin-right: 8px;
}

.detail-item p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.team-member {
  padding: 4px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
}
</style>