// 在template中添加个人资料对话框
<template>
  <div class="dashboard-container">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="navbar-header">
        <div class="navbar-brand">项目管理系统</div>
      </div>

      <div class="navbar-nav">
        <!-- 恢复@click.prevent修饰符 -->
        <a href="#" class="nav-link active" @click.prevent="scrollToSection('dashboardOverview')">
          <i class="el-icon-home"></i>
          <span>仪表盘</span>
        </a>
        <a href="#" class="nav-link" @click.prevent="scrollToSection('projectManagement')">
          <i class="el-icon-document"></i>
          <span>项目</span>
        </a>
        <a href="#" class="nav-link" @click.prevent="scrollToSection('teamMembers')">
          <i class="el-icon-user"></i>
          <span>团队</span>
        </a>
        <!-- 只有管理员才能看到用户管理和部门管理链接 -->
        <a href="#" v-if="isAdmin" class="nav-link" @click.prevent="scrollToSection('userManagement')">
          <i class="el-icon-setting"></i>
          <span>用户管理</span>
        </a>
        <a href="#" v-if="isAdmin" class="nav-link" @click.prevent="scrollToSection('departmentManagement')">
          <i class="el-icon-office-building"></i>
          <span>部门管理</span>
        </a>
        <a href="#" class="nav-link">
          <i class="el-icon-setting"></i>
          <span>设置</span>
        </a>
      </div>

      <!-- 用户下拉菜单部分保持不变 -->
      <div class="navbar-user">
        <el-dropdown trigger="click" @command="handleUserCommand">
          <span class="user-info">
            <!-- <img :src="userAvatar" alt="用户头像" class="user-avatar"> -->
            <el-image :src="userAvatar" alt="用户头像" class="user-avatar" fit="cover" />
            <span class="user-name">{{ userName }}</span>
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">
              <!-- <CustomIcon name="user" size="20" /> -->
              <i class="el-icon-user"></i>
              <span>个人资料</span>
            </el-dropdown-item>
            <el-dropdown-item command="logout">
              <i class="el-icon-s-fold"></i>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- <el-badge :value="notificationCount" class="notification-icon">
          <el-button type="text" class="btn-notification">
            <CustomIcon name="bell" size="20" />
          </el-button>
        </el-badge> -->
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-header">
        <h1>仪表盘</h1>
        <div class="header-actions">
          <el-button type="primary" @click="refreshAllData" :loading="refreshing">
            <i class="el-icon-refresh"></i>
            <span v-if="refreshing">刷新中...</span>
            <span v-else>刷新数据</span>
          </el-button>
        </div>
      </div>

      <!-- 仪表盘概览 -->
      <dashboard-overview ref="dashboardOverview"></dashboard-overview>

      <!-- 项目趋势图 -->
      <project-trends ref="projectTrends"></project-trends>

      <!-- 项目管理 -->
      <project-management ref="projectManagement"></project-management>

      <!-- 团队成员和资源分配 -->
      <team-members ref="teamMembers"></team-members>

      <!-- 用户管理 - 只有管理员可见 -->
      <user-management v-if="isAdmin" ref="userManagement"></user-management>
      <!-- 部门管理 - 只有管理员可见 -->
      <department-management v-if="isAdmin" ref="departmentManagement"></department-management>
    </main>

    <!-- 个人资料对话框 -->
    <el-dialog title="个人资料" :visible.sync="profileDialogVisible" width="500px">
      <el-form ref="profileForm" :model="profileForm" label-width="100px">
        <!-- 头像上传部分 -->
        <el-form-item label="头像">
          <div class="avatar-upload-container">
            <el-upload class="avatar-uploader" :action="''" :auto-upload="false" :on-change="handleAvatarUploadChange"
              :show-file-list="false" accept="image/*" :before-upload="beforeAvatarUpload">
              <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar-preview">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              <input type="file" accept="image/*" class="avatar-input" @change="handleFileSelect">
            </el-upload>
            <div class="upload-tip">点击或拖拽图片上传（支持JPG、PNG格式，最大2MB）</div>
          </div>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="profileForm.name"></el-input>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>

        <el-form-item label="角色">
          <el-input v-model="profileForm.roleText" disabled></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateProfile" :loading="uploading">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import DashboardOverview from '../components/DashboardOverview.vue'
import ProjectTrends from '../components/ProjectTrends.vue'
import ProjectManagement from '../components/ProjectManagement.vue'
import TeamMembers from '../components/TeamMembers.vue'
import UserManagement from '../components/UserManagement.vue'
import DepartmentManagement from '../components/DepartmentManagement.vue' // 导入部门管理组件

export default {
  name: 'Dashboard',
  components: {
    DashboardOverview,
    ProjectTrends,
    ProjectManagement,
    TeamMembers,
    UserManagement,
    DepartmentManagement // 注册部门管理组件
  },
  data() {
    return {
      userName: '张经理',
      userAvatar: '',
      notificationCount: 3,
      refreshing: false,
      isAdmin: false,
      profileDialogVisible: false, // 添加对话框可见性状态
      profileForm: {}, // 添加表单数据对象
      selectedAvatarFile: null, // 添加选中的头像文件
      uploading: false // 添加上传状态
    }
  },
  created() {
    if (localStorage.getItem('userInfo')) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      this.userName = userInfo.name || '用户';
      this.userAvatar = userInfo.avatar || '';
      this.isAdmin = userInfo.role === 'ADMIN'

    }
    console.log("11111", this.userAvatar);
  },
  methods: {
    // 添加滚动到指定区域的方法
    scrollToSection(sectionRef) {
      // 使用Vue的ref获取对应的组件元素
      const element = this.$refs[sectionRef]
      if (element) {
        // 实现平滑滚动
        element.$el.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    },

    // 处理用户下拉菜单命令
    handleUserCommand(command) {
      if (command === 'logout') {
        this.logout()
      } else if (command === 'profile') {
        this.openProfileDialog()
      }
    },

    // 添加缺失的logout方法
    logout() {
      try {
        // 清除localStorage中的用户信息和token
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        // 调用api-service中的登出方法（如果存在）
        if (this.$api && this.$api.handleLogout) {
          this.$api.handleLogout();
        }
        // 跳转到登录页面
        window.location.href = '/login';
      } catch (error) {
        console.error('退出登录失败:', error);
        // 即使出错也强制跳转
        window.location.href = '/login';
      }
    },

    // 打开个人资料对话框
    async openProfileDialog() {
      try {
        // 获取用户信息
        const userInfo = await this.$api.getUserInfo();
        this.profileForm = {
          username: userInfo.username || '',
          name: userInfo.name || '',
          email: userInfo.email || '',
          avatar: userInfo.avatar || '',
          roleText: userInfo.role === 'ADMIN' ? '管理员' : '普通用户'
        };
        this.selectedAvatarFile = null;
        this.profileDialogVisible = true;
      } catch (error) {
        this.$message.error('获取用户信息失败');
      }
    },

    // 处理文件选择
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.handleAvatarChange(file);
      }
    },

    // 处理头像文件变化
    handleAvatarUploadChange(file) {
      this.handleAvatarChange(file.raw || file);
    },

    // 处理头像文件
    handleAvatarChange(file) {
      // 验证文件类型
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error('只支持JPG和PNG格式的图片!');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过2MB!');
        return false;
      }

      // 保存选中的文件
      this.selectedAvatarFile = file;

      // 生成预览
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileForm.avatar = e.target.result;
      };
      reader.readAsDataURL(file);

      return true;
    },

    // 上传前验证
    beforeAvatarUpload(file) {
      return this.handleAvatarChange(file);
    },

    // 更新个人资料
    async handleUpdateProfile() {
      try {
        this.uploading = true;

        // 如果选择了新头像，先上传头像
        if (this.selectedAvatarFile) {
          // 从localStorage获取用户ID
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          if (!userInfo || !userInfo.id) {
            throw new Error('无法获取用户ID');
          }
          // 使用带用户ID的上传方法
          await this.$api.uploadUserAvatar(userInfo.id, this.selectedAvatarFile);
          this.$message.success('头像上传成功');
        }

        // 这里可以添加更新其他用户信息的逻辑

        // 关闭对话框
        this.profileDialogVisible = false;

        // 刷新用户信息
        await this.refreshUserInfo();

        this.$message.success('个人资料更新成功');
      } catch (error) {
        this.$message.error('更新失败: ' + (error.message || '未知错误'));
      } finally {
        this.uploading = false;
      }
    },

    // 刷新用户信息
    async refreshUserInfo() {
      try {
        // 首先从localStorage获取用户信息
        const storedUserInfoStr = localStorage.getItem('userInfo');
        if (storedUserInfoStr) {
          try {
            const storedUserInfo = JSON.parse(storedUserInfoStr);
            // 立即赋值给组件数据
            this.userName = storedUserInfo.name || storedUserInfo.username || '用户';
            this.userAvatar = storedUserInfo.avatar || '';
            this.isAdmin = storedUserInfo.username === 'admin' ||
              storedUserInfo.role === 'admin' ||
              storedUserInfo.role === 'ADMIN';
          } catch (parseError) {
            console.error('解析localStorage用户信息失败:', parseError);
            // 清除无效的存储数据
            localStorage.removeItem('userInfo');
          }
        }

        // 然后尝试通过API刷新最新的用户数据
        try {
          const userInfo = await this.$api.getUserInfo();
          if (userInfo) {
            // 更新组件数据
            this.userName = userInfo.name || userInfo.username || '用户';
            this.userAvatar = userInfo.avatar || '';
            this.isAdmin = userInfo.username === 'admin' ||
              userInfo.role === 'admin' ||
              userInfo.role === 'ADMIN';
            // 更新localStorage中的数据
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          }
        } catch (apiError) {
          console.log('API获取用户信息失败，但已使用localStorage中的数据（如果有）:', apiError);
          // 即使API调用失败，也不覆盖已有的localStorage数据
        }
      } catch (error) {
        console.error('刷新用户信息失败:', error);
      }
    },

    // 修改mounted方法，使用refreshUserInfo
    async mounted() {
      // 获取用户信息
      await this.refreshUserInfo();

      // 初始化时加载所有数据
      this.refreshAllData()
    },

    // 添加refreshAllData方法
    async refreshAllData() {
      try {
        this.refreshing = true;

        // 刷新用户信息
        await this.refreshUserInfo();

        // 刷新各组件数据
        const refreshPromises = [];

        // 检查并刷新各个组件的数据
        if (this.$refs.dashboardOverview && this.$refs.dashboardOverview.refresh) {
          refreshPromises.push(this.$refs.dashboardOverview.refresh());
        }
        if (this.$refs.projectTrends && this.$refs.projectTrends.refresh) {
          refreshPromises.push(this.$refs.projectTrends.refresh());
        }
        if (this.$refs.projectManagement && this.$refs.projectManagement.refresh) {
          refreshPromises.push(this.$refs.projectManagement.refresh());
        }
        if (this.$refs.teamMembers && this.$refs.teamMembers.refresh) {
          refreshPromises.push(this.$refs.teamMembers.refresh());
        }
        // 管理员额外刷新用户和部门管理数据
        if (this.isAdmin) {
          if (this.$refs.userManagement && this.$refs.userManagement.refresh) {
            refreshPromises.push(this.$refs.userManagement.refresh());
          }
          if (this.$refs.departmentManagement && this.$refs.departmentManagement.refresh) {
            refreshPromises.push(this.$refs.departmentManagement.refresh());
          }
        }

        // 等待所有刷新操作完成
        await Promise.all(refreshPromises);

        this.$message.success('数据刷新成功');
      } catch (error) {
        console.error('刷新数据失败:', error);
        this.$message.error('刷新数据失败，请稍后重试');
      } finally {
        this.refreshing = false;
      }
    },
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-header {
  display: flex;
  align-items: center;
}

.navbar-brand {
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 60px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #1890ff;
  background-color: #f5f5f5;
}

.nav-link.active {
  color: #1890ff;
  background-color: #e6f7ff;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.notification-icon {
  font-size: 20px;
}

.btn-notification {
  color: #666;
  font-size: 20px;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 头像上传相关样式 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar-uploader-icon {
  font-size: 36px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  border: 2px dashed #dcdfe6;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.avatar-uploader:hover .avatar-preview {
  transform: scale(1.05);
}

.avatar-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.upload-tip {
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
  text-align: center;
}
</style>