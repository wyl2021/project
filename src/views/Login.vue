<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h1 class="login-title">项目管理系统</h1>
        <p class="login-subtitle">请输入您的账号和密码</p>
      </div>

      <el-form ref="loginForm" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名">
            <!-- <CustomIcon icon="user" size="20"></CustomIcon> -->
            <i class="el-icon-user"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" @keyup.enter.native="handleLogin">
            <!-- <CustomIcon icon="lock" size="20"></CustomIcon> -->
            <i class="el-icon-lock"></i>
          </el-input>
        </el-form-item>

        <el-form-item prop="captchaCode">
          <el-input v-model="loginForm.captchaCode" placeholder="请输入验证码" class="captcha-input">
            <!-- <CustomIcon icon="outline" size="20"></CustomIcon> -->
            <i class="el-icon-outline"></i>
          </el-input>
          <div class="captcha-image-wrapper">
            <img :src="captchaImage" alt="验证码" class="captcha-image" @click="refreshCaptcha">
          </div>
        </el-form-item>

        <el-form-item class="login-options">
          <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false" class="forgot-password"
            @click="showForgotPasswordModal">忘记密码？</el-link>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">登录</el-button>
        </el-form-item>

        <el-form-item class="register-link">
          <el-link type="primary" :underline="false" @click="goToRegister">没有账号？立即注册</el-link>
        </el-form-item>
      </el-form>
    </div>

    <!-- 忘记密码模态框 - 修改为使用图文验证码 -->
    <el-dialog title="忘记密码" :visible.sync="forgotPasswordVisible" width="400px" :close-on-click-modal="false">
      <el-form ref="forgotPasswordForm" :model="forgotPasswordForm" :rules="forgotPasswordRules"
        class="forgot-password-form">
        <el-form-item prop="username">
          <el-input v-model="forgotPasswordForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>

        <!-- <el-form-item prop="email">
          <el-input v-model="forgotPasswordForm.email" placeholder="请输入注册邮箱"></el-input>
        </el-form-item> -->

        <!-- 修改验证码部分，使用图文验证码 -->
        <el-form-item prop="captchaCode">
          <el-input v-model="forgotPasswordForm.captchaCode" placeholder="请输入验证码" class="captcha-input">
            <!-- <CustomIcon icon="outline" size="20" slot="prefix"></CustomIcon> -->
            <i class="el-icon-outline"></i>
          </el-input>
          <div class="captcha-image-wrapper">
            <img :src="resetPasswordCaptchaImage" alt="验证码" class="captcha-image" @click="refreshResetPasswordCaptcha">
          </div>
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input v-model="forgotPasswordForm.newPassword" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>

        <!-- <el-form-item prop="confirmPassword">
          <el-input v-model="forgotPasswordForm.confirmPassword" type="password" placeholder="请确认新密码"></el-input>
        </el-form-item> -->
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="forgotPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="resetPassword" :loading="resetPasswordLoading">重置密码</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        captchaCode: '',
        captchaToken: '',
        rememberMe: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        captchaCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' }
        ]
      },
      loading: false,
      captchaImage: '',

      // 忘记密码相关数据 - 修改为使用图文验证码
      forgotPasswordVisible: false,
      forgotPasswordForm: {
        username: '',
        email: '',
        captchaCode: '', // 改为captchaCode，与登录保持一致
        captchaToken: '', // 添加验证码token
        newPassword: '',
        confirmPassword: ''
      },
      forgotPasswordRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        // email: [
        //   { required: true, message: '请输入邮箱', trigger: 'blur' },
        //   { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        // ],
        captchaCode: [ // 修改字段名并更新规则
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度为4-6位', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
        ],
        // confirmPassword: [
        //   { required: true, message: '请确认新密码', trigger: 'blur' },
        //   {
        //     validator: (rule, value, callback) => {
        //       if (value !== this.forgotPasswordForm.newPassword) {
        //         callback(new Error('两次输入的密码不一致'));
        //       } else {
        //         callback();
        //       }
        //     },
        //     trigger: 'blur'
        //   }
        // ]
      },
      resetPasswordLoading: false,
      resetPasswordCaptchaImage: '', // 忘记密码专用的验证码图片
      // 移除countdown和countdownTimer
    }
  },
  methods: {
    async handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            // 调用登录API
            console.log(this.loginForm)
            const response = await this.$api.login(this.loginForm)
            if (response.success) {
              // 保存token
              localStorage.setItem('authToken', response.data.token)              // 保存用户信息
              if (response.data.user) {
                localStorage.setItem('userInfo', JSON.stringify(response.data.user))
              }

              // 如果勾选了记住我，保存用户名
              if (this.loginForm.rememberMe) {
                localStorage.setItem('savedUsername', this.loginForm.username)
              } else {
                localStorage.removeItem('savedUsername')
              }

              // 跳转到仪表盘
              this.$router.push('/dashboard')
            } else {
              // 登录失败时刷新验证码
              this.refreshCaptcha()
              this.$message.error('登录失败：' + response.message)
            }
          } catch (error) {
            // 登录失败时刷新验证码
            this.refreshCaptcha()
            // 显示从API服务中提取的具体错误信息
            this.$message.error(error.message || '登录失败，请重试')
            console.error('登录错误:', error)
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
          this.loginForm.captchaToken = response.captchaToken
          this.loginForm.captchaCode = ''
        }
      } catch (error) {
        this.$message.error('获取验证码失败，请重试')
        console.error('获取验证码错误:', error)
      }
    },

    // 跳转到注册页面
    goToRegister() {
      this.$router.push('/register')
    },

    // 显示忘记密码模态框
    showForgotPasswordModal() {
      this.forgotPasswordVisible = true;
      // 重置表单
      this.$refs.forgotPasswordForm?.resetFields();
      // 获取忘记密码验证码
      this.refreshResetPasswordCaptcha();
    },

    // 新增：刷新忘记密码验证码
    refreshResetPasswordCaptcha() {
      try {
        const response = this.$api.getCaptcha();
        if (response.success) {
          this.resetPasswordCaptchaImage = response.captchaImage;
          this.forgotPasswordForm.captchaToken = response.captchaToken;
          this.forgotPasswordForm.captchaCode = '';
        }
      } catch (error) {
        this.$message.error('获取验证码失败，请重试');
        console.error('获取验证码错误:', error);
      }
    },

    // 移除：sendVerificationCode和startCountdown方法

    // 修改：重置密码方法，使用图文验证码
    async resetPassword() {
      this.$refs.forgotPasswordForm.validate(async (valid) => {
        if (valid) {
          this.resetPasswordLoading = true;
          console.log(this.forgotPasswordForm)
          // try {
          const response = await this.$api.resetPassword({
            username: this.forgotPasswordForm.username,
            // email: this.forgotPasswordForm.email,
            // captchaCode: this.forgotPasswordForm.captchaCode, // 修改为captchaCode
            // captchaToken: this.forgotPasswordForm.captchaToken, // 添加token
            newPassword: this.forgotPasswordForm.newPassword
          });
          console.log(response)
          if (response.success) {
            this.$message.success('密码重置成功，请使用新密码登录');
            this.forgotPasswordVisible = false;
          } else {
            // 验证码错误时刷新验证码
            this.refreshResetPasswordCaptcha();
            this.$message.error(response.message || '密码重置失败');
          }
          // } catch (error) {
          //   this.refreshResetPasswordCaptcha();
          //   this.$message.error('密码重置失败，请重试');
          //   console.error('重置密码错误:', error);
          // } finally {
          //   this.resetPasswordLoading = false;
          // }
        }
      });
    }
  },
  mounted() {
    // 检查是否有记住的用户信息
    const savedUsername = localStorage.getItem('savedUsername')
    if (savedUsername) {
      this.loginForm.username = savedUsername
      this.loginForm.rememberMe = true
    }

    // 初始化验证码
    this.refreshCaptcha()
  },
  beforeDestroy() {
    // 清理定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
}

.login-form {
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

/* 验证码样式 */
.captcha-input {
  width: 200px;
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

/* 注册链接样式 */
.register-link {
  text-align: center;
  margin-top: 15px;
}

/* 忘记密码相关样式 */
.forgot-password-form {
  margin-top: 20px;
}

/* 确保验证码样式一致 */
.captcha-input {
  width: 200px;
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

.dialog-footer {
  text-align: center;
}
</style>