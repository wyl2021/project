<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <div class="register-header">
        <h1 class="register-title">用户注册</h1>
        <p class="register-subtitle">创建新账号以使用项目管理系统</p>
      </div>

      <el-form ref="registerForm" :model="registerForm" :rules="rules" class="register-form">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名">
            <i slot="prefix" class="el-icon-user"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码">
            <i slot="prefix" class="el-icon-lock"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码">
            <i slot="prefix" class="el-icon-lock"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱">
            <i slot="prefix" class="el-icon-message"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="captchaCode">
          <el-input v-model="registerForm.captchaCode" placeholder="请输入验证码" class="captcha-input">
            <i slot="prefix" class="el-icon-picture-outline"></i>
          </el-input>
          <div class="captcha-image-wrapper">
            <img :src="captchaImage" alt="验证码" class="captcha-image" @click="refreshCaptcha">
            <span class="captcha-refresh" @click="refreshCaptcha">刷新</span>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" class="register-button">注册</el-button>
        </el-form-item>
        
        <el-form-item class="login-link">
          <el-link type="primary" :underline="false" @click="goToLogin">已有账号？立即登录</el-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        captchaCode: '',
        captchaToken: ''
      },
      rules: {
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
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        captchaCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' }
        ]
      },
      loading: false,
      captchaImage: ''
    }
  },
  methods: {
    async handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            // 调用注册API
            const response = await this.$api.register({
              username: this.registerForm.username,
              password: this.registerForm.password,
              email: this.registerForm.email,
              captchaCode: this.registerForm.captchaCode,
              captchaToken: this.registerForm.captchaToken
            })
            
            // 处理注册成功的情况
            if (response.success) {
              this.$message.success('注册成功！即将跳转到登录页面')
              // 清空表单数据
              this.registerForm = {
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
                captchaCode: '',
                captchaToken: ''
              }
              // 注册成功后跳转到登录页面
              setTimeout(() => {
                this.$router.push('/login')
              }, 2000)
            } else {
              // 注册失败时刷新验证码
              this.refreshCaptcha()
              this.$message.error('注册失败：' + (response.message || '未知错误'))
            }
          } catch (error) {
            // 注册失败时刷新验证码
            this.refreshCaptcha()
            // 显示从API服务中提取的具体错误信息
            this.$message.error(error.message || '注册失败，请重试')
            console.error('注册错误:', error)
          } finally {
            this.loading = false
          }
        }
      })
    },
    
    // 刷新验证码
    refreshCaptcha() {
      try {
        const response = this.$api.getCaptcha()
        if (response.success) {
          this.captchaImage = response.captchaImage
          this.registerForm.captchaToken = response.captchaToken
          this.registerForm.captchaCode = ''
        }
      } catch (error) {
        this.$message.error('获取验证码失败，请重试')
        console.error('获取验证码错误:', error)
      }
    },
    
    // 跳转到登录页面
    goToLogin() {
      this.$router.push('/login')
    }
  },
  mounted() {
    // 初始化验证码
    this.refreshCaptcha()
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.register-form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: #909399;
}

.register-form {
  width: 100%;
}

.register-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

/* 验证码样式 */
.captcha-input {
  width: 180px;
  display: inline-block;
}

.captcha-image-wrapper {
  display: inline-block;
  margin-left: 10px;
  vertical-align: middle;
}

.captcha-image {
  width: 100px;
  height: 40px;
  cursor: pointer;
  vertical-align: middle;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.captcha-refresh {
  margin-left: 10px;
  color: #409eff;
  cursor: pointer;
  vertical-align: middle;
  font-size: 14px;
}

.captcha-refresh:hover {
  color: #66b1ff;
}

/* 登录链接样式 */
.login-link {
  text-align: center;
  margin-top: 15px;
}
</style>