<template>
  <div class="user-list-container">
    <h2>用户管理</h2>
    
    <!-- 管理员提示信息 -->
    <el-alert v-if="isAdmin" title="管理员功能" type="info" show-icon :closable="false" />
    
    <!-- 非管理员提示信息 -->
    <el-alert v-else title="您没有权限访问此页面" type="warning" show-icon :closable="false" />
    
    <!-- 管理员操作区域 -->
    <div v-if="isAdmin" class="admin-actions">
      <el-button type="primary" @click="handleAddUser">新增用户</el-button>
      
      <!-- 筛选条件区域 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="用户名">
            <el-input v-model="filterForm.username" placeholder="请输入用户名" style="width: 150px;"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="filterForm.email" placeholder="请输入邮箱" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="filterForm.role" placeholder="请选择角色" style="width: 120px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="管理员" value="admin"></el-option>
              <el-option label="普通用户" value="user"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 用户列表 -->
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="role" label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'primary' : 'success'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row.id)" 
                       :disabled="scope.row.username === 'admin'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="userForm" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" 
                   :disabled="isEdit && formData.username === 'admin'" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input type="password" v-model="formData.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" 
                    :disabled="isEdit && formData.username === 'admin'">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      isAdmin: false,
      users: [],
      dialogVisible: false,
      isEdit: false,
      dialogTitle: '新增用户',
      formData: {
        id: '',
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'user'
      },
      // 筛选表单数据
      filterForm: {
        departmentId: '',
        username: '',
        email: '',
        phone: '',
        role: '',
        isActive: undefined
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 20, message: '用户名长度在4-20个字符之间', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' },
          { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.checkUserRole()
    if (this.isAdmin) {
      this.loadUsers()
    }
  },
  methods: {
    // 检查用户角色
    checkUserRole() {
      try {
        // 从localStorage中获取用户信息
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          const user = JSON.parse(userInfo)
          // 根据username或id判断是否为管理员
          this.isAdmin = user.username === 'admin' || user.id === '1'
        }
      } catch (error) {
        console.error('检查用户角色失败:', error)
        this.isAdmin = false
      }
    },

    // 加载用户列表
    async loadUsers() {
      try {
        const response = await this.$api.getUsers()
        this.users = response.data || response
      } catch (error) {
        this.$message.error('获取用户列表失败: ' + error.message)
        // 使用模拟数据
        this.users = this._mockUsers()
      }
    },

    // 处理筛选
    async handleFilter() {
      try {
        const response = await this.$api.filterUsers(this.filterForm)
        this.users = response.data || response
      } catch (error) {
        this.$message.error('筛选用户失败: ' + error.message)
        // 筛选失败时仍使用当前用户列表
      }
    },

    // 重置筛选条件
    resetFilter() {
      this.filterForm = {
        departmentId: '',
        username: '',
        email: '',
        phone: '',
        role: '',
        isActive: undefined
      }
      // 重置后重新加载所有用户
      this.loadUsers()
    },

    // 新增用户
    handleAddUser() {
      this.isEdit = false
      this.dialogTitle = '新增用户'
      this.formData = {
        id: '',
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'user'
      }
      this.dialogVisible = true
    },

    // 编辑用户
    handleEditUser(user) {
      this.isEdit = true
      this.dialogTitle = '编辑用户'
      // 深拷贝用户数据到表单
      this.formData = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
      this.dialogVisible = true
    },

    // 删除用户
    async handleDeleteUser(userId) {
      this.$confirm('确定要删除这个用户吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await this.$api.deleteUser(userId)
          // 更新用户列表
          this.users = this.users.filter(user => user.id !== userId)
          this.$message.success('用户删除成功')
        } catch (error) {
          this.$message.error('用户删除失败: ' + error.message)
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 提交表单
    async handleSubmit() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              // 编辑用户
              await this.$api.updateUser(this.formData.id, this.formData)
              // 更新本地用户列表
              const index = this.users.findIndex(user => user.id === this.formData.id)
              if (index !== -1) {
                this.users.splice(index, 1, { ...this.users[index], ...this.formData })
              }
              this.$message.success('用户更新成功')
            } else {
              // 新增用户
              const response = await this.$api.createUser(this.formData)
              // 添加到本地用户列表
              this.users.push(response.data || response)
              this.$message.success('用户创建成功')
            }
            this.dialogVisible = false
          } catch (error) {
            this.$message.error('操作失败: ' + error.message)
          }
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    },

    // 模拟用户数据（当API调用失败时使用）
    _mockUsers() {
      return [
        {
          id: '1',
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          role: 'admin',
          createTime: '2023-01-01 00:00:00'
        },
        {
          id: '2',
          username: 'user',
          name: '普通用户',
          email: 'user@example.com',
          role: 'user',
          createTime: '2023-01-02 00:00:00'
        },
        {
          id: '3',
          username: 'test1',
          name: '测试用户1',
          email: 'test1@example.com',
          role: 'user',
          createTime: '2023-01-03 00:00:00'
        },
        {
          id: '4',
          username: 'test2',
          name: '测试用户2',
          email: 'test2@example.com',
          role: 'user',
          createTime: '2023-01-04 00:00:00'
        }
      ]
    }
  }
}
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}

.admin-actions {
  margin-top: 20px;
}

.el-table {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.filter-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.filter-form {
  display: flex;
  align-items: center;
}
</style>