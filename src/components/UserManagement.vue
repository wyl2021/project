<template>
  <div class="user-management-card">
    <div class="card-header">
      <h3>用户管理</h3>
      <el-button type="primary" @click="handleAddUser">新增用户</el-button>
    </div>

    <!-- 管理员提示信息 -->
    <el-alert title="管理员功能" type="info" show-icon :closable="false" />

    <!-- 用户列表 -->
    <el-table :data="paginatedUsers" style="width: 100%">
      <!-- 将ID列修改为序号列 -->
      <el-table-column type="index" label="序号" width="50" :index-method="indexMethod" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="role" label="角色" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.role === 'ADMIN' ? 'primary' : 'success'">
            {{ scope.row.role === 'ADMIN' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 添加部门列 -->
      <el-table-column prop="department.name" label="所属部门" width="150">
        <template slot-scope="scope">
          {{ scope.row.department ? scope.row.department.name : '无部门' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template slot-scope="scope">
          <span>{{ formatDate(scope.row.createdTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" width="80" fixed="left">
        <template slot-scope="scope">
          <el-image
            :src="scope.row.avatar || 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1763168553&t=eddfc58c26901fd446b900d0d234ac3d'"
            alt="用户头像" fit="cover" style="width: 40px; height: 40px; border-radius: 50%;" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEditUser(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDeleteUser(scope.row.id)"
            :disabled="scope.row.username === 'admin'">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="userForm" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名"
            :disabled="isEdit && formData.username === 'admin'" />
        </el-form-item>
        <!-- 将v-if="!isEdit"移除，使编辑模式下也显示密码框 -->
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="formData.password" placeholder="请输入密码（留空则不修改）" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" :disabled="isEdit && formData.username === 'admin'">
            <el-option label="普通用户" value="MANAGER" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </el-form-item>
        <!-- 添加部门选择器 -->
        <el-form-item label="所属部门" prop="departmentId">
          <el-select v-model="formData.departmentId" placeholder="请选择部门">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <!-- 在用户表单中添加头像上传组件 -->
        <el-form-item label="头像">
          <div class="avatar-uploader-small">
            <el-upload class="avatar-uploader" :action="''" :auto-upload="false" :on-change="handleAvatarChange"
              :show-file-list="false" accept="image/*">
              <el-image v-if="formData.avatar" :src="formData.avatar" class="avatar-preview-small" fit="cover" />
              <i v-else class="el-icon-plus avatar-uploader-icon-small"></i>
            </el-upload>
          </div>
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
  data() {
    return {
      users: [],
      departments: [], // 添加部门列表
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      isEdit: false,
      dialogTitle: '新增用户',
      formData: {
        id: '',
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'MANAGER',
        departmentId: '',
        avatar: '' // 添加头像字段
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 20, message: '用户名长度在4-20个字符之间', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        password: [
          // 修改为条件验证，根据是否为编辑模式决定是否必填
          {
            validator: (rule, value, callback) => {
              if (!this.isEdit && !value) {
                callback(new Error('请输入密码'));
              } else if (value && (value.length < 6 || value.length > 20)) {
                callback(new Error('密码长度在6-20个字符之间'));
              } else if (value && !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/.test(value)) {
                callback(new Error('密码必须包含字母和数字'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
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
        ],
        departmentId: [
          { required: false, message: '请选择部门', trigger: 'change' } // 非必填
        ]
      }
    }
  },
  async mounted() {
    // 同时加载用户和部门数据
    await Promise.all([
      this.loadUsers(),
      this.getDepartments()
    ])
  },
  computed: {
    // 计算当前页显示的用户数据
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.users.slice(start, end)
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
    // 加载用户列表
    async loadUsers() {
      try {
        // 添加分页参数
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }
        const response = await this.$api.getUsers(params)
        // 假设接口返回格式为 { data: [...], total: ... }
        if (response.data && response.total !== undefined) {
          this.users = response.data
          this.total = response.total
        } else {
          // 如果接口不支持分页，仍使用完整数据但启用前端分页
          this.users = response.data || response
          this.total = this.users.length
        }
      } catch (error) {
        this.$message.error('获取用户列表失败: ' + error.message)
        // 使用模拟数据
        this.users = this._mockUsers()
        this.total = this.users.length
      }
    },

    // 获取部门列表
    // 修改getDepartments方法，确保获取完整的部门列表数据
    async getDepartments() {
      try {
        const response = await this.$api.getDepartments();
        this.departments = Array.isArray(response) ? response : (response.departments || []);
      } catch (error) {
        this.$message.error('获取部门列表失败: ' + error.message);
        this.departments = [];
      }
    },

    // 分页大小变化处理
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1 // 重置为第一页
      this.loadUsers()
    },

    // 当前页码变化处理
    handleCurrentChange(current) {
      this.currentPage = current
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
        role: 'MANAGER',
        departmentId: '',
        avatar: '' // 清空头像字段
      }
      this.dialogVisible = true
    },

    // 编辑用户
    handleEditUser(user) {
      this.isEdit = true
      this.dialogTitle = '编辑用户'
      // 深拷贝用户数据到表单，但不包含密码字段
      this.formData = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.department ? user.department.id : '',
        password: '', // 清空密码字段
        avatar: user.avatar || '' // 添加头像字段
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

    // 处理头像选择
    handleAvatarChange(file) {
      // 创建FormData对象

      const formData = new FormData();
      formData.append('file', file.raw);
      // 显示上传中状态
      const loading = this.$loading({
        lock: true,
        text: '上传中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      // 修改：使用localStorage获取用户信息，避免引用undefined的$store
      let userId = '1'; // 默认ID

      // 优先使用表单中的用户ID
      if (this.formData && this.formData.id) {
        userId = this.formData.id;
      } else {
        // 尝试从localStorage获取当前登录用户信息
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          if (userInfo && userInfo.id) {
            userId = userInfo.id;
          }
        } catch (e) {
          console.warn('无法从localStorage获取用户信息:', e);
        }
      }

      // 使用api-service方法
      this.$api.uploadUserAvatar(this.isEdit ? userId : null, file.raw).then(response => {
        // 处理响应数据
        // this.formData.avatar = file.raw
        this.formData.avatar = response.data?.avatarUrl || response.data?.avatar || '';

        this.$message.success('头像上传成功');
      }).catch(error => {
        console.error('头像上传失败:', error);
        this.$message.error('头像上传失败，请重试');
      }).finally(() => {
        loading.close();
      });
    },

    // 提交表单
    async handleSubmit() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
            let response
            // 构建请求数据
            const requestData = {
              ...this.formData
            }
            console.log('提交数据1:', requestData)
            // 按照要求的格式，将departmentId转换为{id: departmentId}格式
            if (requestData.departmentId) {
              requestData.department = { id: requestData.departmentId }
            } else {
              requestData.department = null
            }
            // 删除不需要的字段
            delete requestData.departmentId
            delete requestData.id

            // 编辑模式下，如果密码为空，则不发送密码字段，避免密码被重置
            if (this.isEdit && requestData.password === '') {
              delete requestData.password
            }
            console.log('提交数据2:', requestData, this.isEdit)
            if (this.isEdit) {
              // 编辑用户 - 使用PUT /users/{userId}格式
              response = await this.$api.updateUser(this.formData.id, requestData)
            } else {
              // 新增用户
              response = await this.$api.createUser(requestData)
            }

            this.dialogVisible = false
            // 重新加载用户列表
            this.loadUsers()
            this.$message.success(this.isEdit ? '用户更新成功' : '用户创建成功')
          } catch (error) {
            this.$message.error((this.isEdit ? '用户更新' : '用户创建') + '失败: ' + error.message)
          }
        }
      })
    },

    // 模拟数据生成函数
    _mockUsers() {
      return [
        {
          id: '1',
          username: 'admin',
          name: '系统管理员',
          email: 'admin@example.com',
          role: 'ADMIN',
          createTime: '2023-01-01 10:00:00'
        },
        {
          id: '2',
          username: 'user1',
          name: '张三',
          email: 'user1@example.com',
          role: 'MANAGER',
          department: { id: '1', name: '技术部' },
          createTime: '2023-01-02 14:30:00'
        },
        {
          id: '3',
          username: 'user2',
          name: '李四',
          email: 'user2@example.com',
          role: 'MANAGER',
          department: { id: '2', name: '市场部' },
          createTime: '2023-01-03 09:15:00'
        }
      ]
    },

    // 添加refresh方法，用于在Dashboard中刷新数据
    refresh() {
      this.currentPage = 1 // 刷新时重置为第一页
      return Promise.all([
        this.loadUsers(),
        this.getDepartments()
      ])
    },
    // 计算序号的方法
    indexMethod(index) {
      // 计算当前页的起始序号 = (当前页码 - 1) * 每页大小 + 当前行索引 + 1
      return (this.currentPage - 1) * this.pageSize + index + 1
    },
  }
}
</script>

<style scoped>
.user-management-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.pagination-container {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.avatar-uploader-small {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.avatar-uploader-icon-small {
  font-size: 24px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.avatar-preview-small {
  width: 80px;
  height: 80px;
  cursor: pointer;
  border-radius: 4px;
}
</style>