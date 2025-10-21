import axios from 'axios'

/**
 * API服务类，封装所有数据获取和操作的方法
 */
class ApiService {
  constructor() {
    this.isMockMode = false;  // 将false改为true，启用模拟数据模式
    this.mockDelay = 300 // 模拟延迟时间（毫秒）
    this.baseUrl = '/api' // 后端API基础路径，包含/api前缀
    this.timeout = 10000
    // 增强的token恢复逻辑，添加调试信息
    const savedToken = localStorage.getItem('authToken');
    this.authToken = savedToken || null;
    // console.log('API服务初始化，从localStorage恢复token:', this.authToken ? '存在' : '不存在');
  }

  /**
   * 设置认证令牌
   */
  setAuthToken(token) {
    // console.log('设置token:', token);
    this.authToken = token
    if (token) {
      localStorage.setItem('authToken', token)
      // 验证是否正确保存
      const storedToken = localStorage.getItem('authToken');
      // console.log('token保存验证:', storedToken === token ? '成功' : '失败');
    } else {
      localStorage.removeItem('authToken')
      // console.log('清除token');
    }
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return !!this.authToken
  }

  /**
   * 退出登录处理
   */
  handleLogout() {
    // console.log('执行退出登录操作');
    this.setAuthToken(null);
    // 清除用户信息
    localStorage.removeItem('userInfo');
    // 重定向到登录页面 - 修改为前端路由路径
    window.location.href = '/login';
  }

  /**
   * 基础请求方法
   */
  async _fetch(url, method = 'GET', data = null, options = {}) {
    // 添加额外的检查，确保请求前authToken是最新状态
    const currentToken = localStorage.getItem('authToken');
    // console.log('当前token:', this.authToken, currentToken);
    if (currentToken !== this.authToken) {
      // console.log('检测到token不一致，更新内存中的token');
      this.authToken = currentToken || null;
    }

    // 如果没有认证令牌，除了登录接口和登出接口外都返回401
    if (!this.authToken && url !== '/login' && url !== '/auth/login' && url !== '/logout' && url !== '/users/reset-password') {
      // console.warn('Token为空，执行退出登录');       
      this.handleLogout();
      throw new Error('未授权访问，请先登录');
    }

    // 检查是否需要使用模拟数据
    if (this.isMockMode || !navigator.onLine) {
      return this._fetchMockData(url, method, data)
    }

    try {
      const requestConfig = {
        url: `${this.baseUrl}${url}`,
        method,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          ...options.headers
        },
        credentials: 'include',
        timeout: this.timeout
      };

      // console.log('发送请求:', url, 'Authorization:', this.authToken ? '存在' : '不存在');

      // 调试日志
      // console.log(`发送请求到: ${requestConfig.url}`);
      // console.log('请求头包含token:', this.authToken);

      const response = await axios(requestConfig);

      // 检查响应中是否有新的token并更新
      this._checkAndUpdateToken(response.data);

      return response.data
    } catch (error) {
      // 网络错误或超时，切换到模拟数据模式
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        // console.warn('API请求失败，切换到模拟数据模式');
        this.isMockMode = true;
        return this._fetchMockData(url, method, data);
      }

      // 处理其他错误
      if (error.response) {
        // 检查响应中是否有新的token并更新（即使在错误响应中）
        if (error.response.data) {
          this._checkAndUpdateToken(error.response.data);
        }

        if (error.response.status === 401 || error.response.status === 403) {
          // 401: 未授权, 403: 禁止访问(通常表示token过期)
          this.handleLogout();
          throw new Error('登录已过期，请重新登录');
        }
        // 提取并显示后端返回的错误信息
        const errorMessage = this._extractErrorMessage(error.response)
        throw new Error(errorMessage || 'API请求失败')
      }

      throw error;
    }
  }

  /**
   * 检查响应中是否有新的token并更新
   */
  _checkAndUpdateToken(responseData) {
    if (!responseData) return;

    // 检查各种可能的token字段格式
    let newToken = null;
    if (responseData.token) {
      newToken = responseData.token;
    } else if (responseData.access_token) {
      newToken = responseData.access_token;
    } else if (responseData.accessToken) {
      newToken = responseData.accessToken;
    } else if (responseData.data && typeof responseData.data === 'object') {
      // 检查嵌套在data中的token
      if (responseData.data.token) {
        newToken = responseData.data.token;
      } else if (responseData.data.access_token) {
        newToken = responseData.data.access_token;
      } else if (responseData.data.accessToken) {
        newToken = responseData.data.accessToken;
      }
    }

    // 如果发现新token且与当前token不同，则更新
    if (newToken && newToken !== this.authToken) {
      // console.log('发现新token，更新认证信息');
      this.setAuthToken(newToken);
    }
  }

  /**
   * 从错误响应中提取错误信息
   */
  _extractErrorMessage(response) {
    if (!response || !response.data) {
      return null
    }

    // 处理各种可能的错误信息格式
    if (typeof response.data === 'string') {
      return response.data
    }

    if (response.data.message) {
      return response.data.message
    }

    if (response.data.error) {
      return typeof response.data.error === 'string' ? response.data.error : JSON.stringify(response.data.error)
    }

    if (response.data.msg) {
      return response.data.msg
    }

    return null
  }

  /**
   * 获取模拟数据
   */
  async _fetchMockData(url, method, data) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, this.mockDelay))

    // 检查是否是用户头像上传请求（按照接口文档格式）
    if (url.match(/^\/users\/[^/]+\/avatar$/) && method === 'POST') {
      return {
        success: true,
        message: '头像上传成功',
        data: {
          avatar: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto'
        }
      };
    }

    // 检查是否是获取默认头像请求
    if (url === '/users/default-avatar' && method === 'GET') {
      return {
        success: true,
        message: '获取默认头像成功',
        data: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto'
      };
    }

    // 检查是否是文件上传请求（原有逻辑）
    if (url === '/upload' && method === 'POST') {
      return this._mockUploadFile(data);
    }

    // 根据URL选择对应的模拟数据生成方法
    if (url === '/login' && method === 'POST') {
      return this._mockLogin(data)
    } else if (url === '/auth/login' && method === 'POST') {
      return this._mockLogin(data)
    } else if (url === '/auth/register' && method === 'POST') {
      return this._mockRegister(data)
    } else if (url === '/auth/captcha' && method === 'GET') {
      return this._mockGetCaptcha()
    } else if (url === '/logout' && method === 'POST') {
      return this._mockLogout()
    } else if (url === '/auth/reset-password/code' && method === 'POST') {
      // 模拟发送验证码
      return {
        success: true,
        message: '验证码已发送到您的邮箱'
      };
    } else if (url === '/auth/reset-password' && method === 'POST') {
      // 模拟重置密码，使用图文验证码验证
      // 简单验证：验证码必须为123456（可以根据实际验证码生成逻辑调整）
      if (data.captchaCode === '123456' && data.captchaToken) {
        return {
          success: true,
          message: '密码重置成功'
        };
      } else {
        return {
          success: false,
          message: '验证码错误'
        };
      }
    } else if (url === '/projects' && method === 'GET') {
      return this._mockGetProjects()
    } else if (url.startsWith('/users/page') && method === 'GET') {
      // 解析URL参数
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const page = parseInt(urlParams.get('page') || '0');
      const size = parseInt(urlParams.get('size') || '10');
      return this._mockGetUsersPage(page, size);
    } else if (url.startsWith('/projects/') && method === 'GET') {
      const id = url.split('/')[2]
      return this._mockGetProjectById(id)
    } else if (url === '/projects' && method === 'POST') {
      return this._mockCreateProject(data)
    } else if (url.startsWith('/projects/') && method === 'PUT') {
      const id = url.split('/')[2]
      return this._mockUpdateProject(id, data)
    } else if (url.startsWith('/projects/') && method === 'DELETE') {
      const id = url.split('/')[2]
      return this._mockDeleteProject(id)
    } else if (url === '/team-members' && method === 'GET') {
      return this._mockGetTeamMembers()
    } else if (url === '/project-statistics' && method === 'GET') {
      return this._mockGetProjectStatistics()
    } else if (url.startsWith('/chart-data/') && method === 'GET') {
      const type = url.split('/')[2]
      return this._mockGetChartData(type)
    } else if (url === '/users' && method === 'GET') {
      return this._mockGetUsers()
    } else if (url === '/users' && method === 'POST') {
      return this._mockCreateUser(data)
    } else if (url === '/users/filter' && method === 'POST') {
      return this._mockFilterUsers(data)
    } else if (url.startsWith('/users/') && method === 'PUT') {
      const id = url.split('/')[2]
      return this._mockUpdateUser(id, data)
    } else if (url.startsWith('/users/') && method === 'DELETE') {
      const id = url.split('/')[2]
      return this._mockDeleteUser(id)
    } else if (url === '/departments' && method === 'GET') {
      return this._mockGetDepartments()
    } else if (url.startsWith('/departments/') && method === 'GET') {
      const id = url.split('/')[2]
      return this._mockGetDepartmentById(id)
    } else if (url === '/departments' && method === 'POST') {
      return this._mockCreateDepartment(data)
    } else if (url.startsWith('/departments/') && method === 'PUT') {
      const id = url.split('/')[2]
      return this._mockUpdateDepartment(id, data)
    } else if (url.startsWith('/departments/') && method === 'DELETE') {
      const id = url.split('/')[2]
      return this._mockDeleteDepartment(id)
    }

    // 默认返回空数据
    return null
  }

  /**
   * 为模拟模式添加模拟上传功能
   */
  async _mockUploadFile(formData) {
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 返回模拟的上传结果
    return {
      success: true,
      url: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto',
      filename: formData.get('file')?.name || 'avatar.jpg'
    };
  }

  /**
   * 用户登录
   */
  async login(loginData) {
    try {
      // 支持两种调用方式：login({username, password}) 或 login(username, password)
      let username, password, captchaCode, captchaToken;
      if (typeof loginData === 'object') {
        username = loginData.username;
        password = loginData.password;
        captchaCode = loginData.captchaCode;
        captchaToken = loginData.captchaToken;
      }

      // 使用正确的后端登录API路径
      const response = await this._fetch('/auth/login', 'POST', {
        username,
        password,
        captchaCode,
        captchaToken
      })

      // 增强token提取逻辑，支持更多可能的token格式
      let token = null;

      // 检查常见的token字段格式
      if (response.token) {
        token = response.token;
      } else if (response.data && response.data.token) {
        token = response.data.token;
      } else if (response.access_token) {
        token = response.access_token;
      } else if (response.data && response.data.access_token) {
        token = response.data.access_token;
      } else if (response.accessToken) {
        token = response.accessToken;
      } else if (response.data && response.data.accessToken) {
        token = response.data.accessToken;
      }

      // 如果找到token，则设置它
      if (token) {
        // console.log('登录成功，设置token:', token);
        this.setAuthToken(token);
      } else {
        // console.warn('登录成功但未找到token');
      }

      return response;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  /**
   * 用户注册
   * @param {Object} registerData - 注册数据
   * @param {string} registerData.username - 用户名
   * @param {string} registerData.password - 密码
   * @param {string} registerData.email - 邮箱
   * @param {string} registerData.captchaCode - 验证码
   * @param {string} registerData.captchaToken - 验证码token
   * @returns {Promise<Object>} 注册响应
   */
  async register(registerData) {
    try {
      // 构建符合后端API要求的请求参数
      const requestData = {
        username: registerData.username.trim(),
        password: registerData.password,
        email: registerData.email.trim(),
        captchaCode: registerData.captchaCode,
        captchaToken: registerData.captchaToken
      }

      // 调用后端注册API
      const response = await this._fetch('/auth/register', 'POST', requestData)

      // 处理后端响应，确保返回格式统一
      if (response && response.success !== undefined) {
        return response
      }

      // 对于没有明确success字段的响应，视为成功
      return {
        success: true,
        data: response
      }
    } catch (error) {
      // console.error('注册失败:', error)

      // 处理网络错误或超时
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        throw new Error('网络连接失败，请检查网络设置后重试')
      }

      // 其他错误保持原样抛出，让调用方处理
      throw error
    }
  }

  /**
   * 获取验证码（前端生成）
   */
  getCaptcha() {
    try {
      // 直接调用前端生成验证码的方法，不再发送API请求
      return this._generateCaptcha()
    } catch (error) {
      console.error('获取验证码失败:', error)
      throw error
    }
  }

  /**
   * 前端生成验证码
   */
  _generateCaptcha() {
    // 生成随机验证码字符
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let captchaCode = ''
    const length = 4 // 验证码长度
    for (let i = 0; i < length; i++) {
      captchaCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // 生成验证码图片（SVG格式）
    const width = 120
    const height = 40
    const svg = this._generateCaptchaSvg(captchaCode, width, height)
    const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))

    // 生成验证码token
    const captchaToken = 'captcha-' + Date.now()

    // 存储验证码信息以便验证
    localStorage.setItem('captcha_' + captchaToken, captchaCode)

    return {
      success: true,
      captchaImage: svgBase64,
      captchaToken: captchaToken,
      captchaCode: captchaCode // 仅用于开发环境调试
    }
  }

  /**
   * 生成验证码SVG图片
   */
  _generateCaptchaSvg(text, width, height) {
    // 创建SVG元素
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`

    // 添加背景
    svg += `<rect width="${width}" height="${height}" fill="#f8f8f8" stroke="#ddd"/>`

    // 添加干扰线
    for (let i = 0; i < 5; i++) {
      const x1 = Math.random() * width
      const y1 = Math.random() * height
      const x2 = Math.random() * width
      const y2 = Math.random() * height
      const strokeWidth = 1 + Math.random() * 2
      const color = this._getRandomColor(80, 150)
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" stroke-opacity="0.6"/>`
    }

    // 添加干扰点
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = 1 + Math.random() * 2
      const color = this._getRandomColor(80, 180)
      svg += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" fill-opacity="0.6"/>`
    }

    // 添加文字
    const fontSize = 20 + Math.random() * 5
    const letters = text.split('')
    letters.forEach((letter, index) => {
      // 每个字符的位置和旋转角度略有不同
      const x = 25 + index * 22
      const y = 28 + (Math.random() - 0.5) * 10
      const rotate = (Math.random() - 0.5) * 20
      const color = this._getRandomColor(30, 120)
      svg += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${color}" text-anchor="middle" transform="rotate(${rotate}, ${x}, ${y})" font-weight="bold">${letter}</text>`
    })

    svg += '</svg>'
    return svg
  }

  /**
   * 生成随机颜色
   */
  _getRandomColor(min, max) {
    const r = Math.floor(Math.random() * (max - min + 1)) + min
    const g = Math.floor(Math.random() * (max - min + 1)) + min
    const b = Math.floor(Math.random() * (max - min + 1)) + min
    return `rgb(${r},${g},${b})`
  }

  /**
   * 用户登出
   */
  async logout() {
    try {
      await this._fetch('/logout', 'POST')
      this.setAuthToken(null)
      return true
    } catch (error) {
      console.error('登出失败:', error)
      this.setAuthToken(null) // 无论如何都清除token
      return true
    }
  }

  /**
   * 发送重置密码验证码
   */
  async sendResetPasswordCode(data) {
    return this._fetch('/auth/reset-password/code', 'POST', data);
  }

  /**
   * 重置密码
   */
  async resetPassword(data) {
    return this._fetch('/users/reset-password', 'POST', data);
  }



  /**
   * 获取项目列表
   */
  async getProjects(page = 0, size = 10, status = '', departmentId = '', keyword = '') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (status) params.append('status', status);
    if (departmentId) params.append('departmentId', departmentId);
    if (keyword) params.append('keyword', keyword);

    // 正确的调用方式：第二个参数是method字符串，params作为options的一部分
    const response = await this._fetch('/projects', 'GET', null, { params });

    return response.data; // 后端返回的数据在data对象中
  }

  /**
   * 获取单个项目
   */
  async getProjectById(id) {
    try {
      return await this._fetch(`/projects/${id}`, 'GET')
    } catch (error) {
      console.error('获取项目详情失败:', error)
      throw error
    }
  }

  /**
   * 创建新项目
   */
  async createProject(projectData) {
    try {
      return await this._fetch('/projects', 'POST', projectData)
    } catch (error) {
      console.error('创建项目失败:', error)
      throw error
    }
  }

  /**
   * 更新项目
   */
  async updateProject(id, projectData) {
    try {
      return await this._fetch(`/projects/${id}`, 'PUT', projectData)
    } catch (error) {
      console.error('更新项目失败:', error)
      throw error
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(id) {
    try {
      return await this._fetch(`/projects/${id}`, 'DELETE')
    } catch (error) {
      console.error('删除项目失败:', error)
      throw error
    }
  }

  /**
   * 获取团队成员（分页版）
   */
  async getTeamMembers(page = 0, size = 10) {
    // console.log('getTeamMembers 被调用2');
    try {
      return await this._fetch(`/users/page?page=${page}&size=${size}`, 'GET')
    } catch (error) {
      console.error('获取团队成员失败:', error)
      throw error
    }
  }

  /**
   * 获取用户列表
   */
  async getUsers() {
    try {
      return await this._fetch('/users', 'GET')
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  /**
   * 筛选用户列表
   * @param {Object} filterParams - 筛选参数
   * @param {string} filterParams.departmentId - 部门ID
   * @param {string} filterParams.username - 用户名（支持模糊匹配）
   * @param {string} filterParams.email - 邮箱
   * @param {string} filterParams.phone - 手机号
   * @param {string} filterParams.role - 用户角色
   * @param {boolean} filterParams.isActive - 是否活跃
   * @returns {Promise<Object>} 筛选结果
   */
  async filterUsers(filterParams) {
    try {
      return await this._fetch('/users/filter', 'POST', filterParams)
    } catch (error) {
      console.error('筛选用户列表失败:', error)
      throw error
    }
  }

  /**
   * 创建用户
   */
  async createUser(userData) {
    try {
      // 构建符合后端API要求的请求参数
      const requestData = {
        username: userData.username.trim(),
        password: userData.password,
        name: userData.name.trim(),
        email: userData.email.trim(),
        role: userData.role || 'user',
        department: userData.department
      }

      const response = await this._fetch('/users', 'POST', requestData)

      // 处理后端响应，确保返回格式统一
      if (response && response.success !== undefined) {
        return response
      }

      return {
        success: true,
        data: response
      }
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    }
  }

  /**
   * 更新用户
   */
  async updateUser(userId, userData) {
    try {
      // 构建符合后端API要求的请求参数
      const requestData = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        role: userData.role || 'user',
        username: userData.username || '',
        department: userData.department // 增加department参数
      }

      // 如果提供了密码，则更新密码
      if (userData.password && userData.password.trim()) {
        requestData.password = userData.password.trim()
      }

      const response = await this._fetch(`/users/${userId}`, 'PUT', requestData)

      // 处理后端响应，确保返回格式统一
      if (response && response.success !== undefined) {
        return response
      }

      return {
        success: true,
        data: response
      }
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  async getUserInfo() {
    try {
      // 尝试从API获取用户信息
      const response = await this._fetch('/auth/info', 'GET');
      // 保存到localStorage供后续使用
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 尝试从localStorage获取缓存的用户信息
      try {
        const cachedUserInfo = localStorage.getItem('userInfo');
        if (cachedUserInfo) {
          return JSON.parse(cachedUserInfo);
        }
      } catch (e) {
        console.error('解析缓存的用户信息失败:', e);
      }
      // 返回模拟数据作为备用
      return this._mockUserInfo();
    }
  }

  /**
   * 上传用户头像
   * @param {File} avatarFile - 头像文件
   */
  async uploadAvatar(avatarFile) {
    try {
      // 创建FormData对象
      const formData = new FormData();
      // 修改字段名为'file'，与后端接口要求一致
      formData.append('file', avatarFile);

      // 上传文件，设置特殊的headers
      const response = await this._fetch('/users/avatar', 'POST', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // 更新localStorage中的用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.avatar = response.avatarUrl || userInfo.avatar;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      return response;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  }

  /**
   * 按照接口文档要求上传用户头像
   * @param {string} userId - 用户ID
   * @param {File} file - 头像文件
   */
  async uploadUserAvatar(userId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this._fetch(`/users/${userId}/avatar`, 'POST', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response;
    } catch (error) {
      console.error('上传用户头像失败:', error);
      throw error;
    }
  }

  /**
   * 获取默认头像URL
   */
  async getDefaultAvatar() {
    try {
      const response = await this._fetch('/users/default-avatar', 'GET');
      return response;
    } catch (error) {
      console.error('获取默认头像失败:', error);
      throw error;
    }
  }

  /**
   * 文件上传方法
   */
  async uploadFile(formData) {
    try {
      // 文件上传需要特殊的请求配置
      const response = await axios({
        url: `${this.baseUrl}/upload`, // 根据实际接口调整
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
        },
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      console.error('文件上传失败:', error);

      // 错误处理
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        this.handleLogout();
        throw new Error('登录已过期，请重新登录');
      }

      throw error;
    }
  }

  /**
   * 生成模拟用户信息（备用）
   */
  _mockUserInfo() {
    const defaultAvatar = 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1763168553&t=eddfc58c26901fd446b900d0d234ac3d';
    return {
      id: '1',
      username: 'admin',
      name: '系统管理员',
      email: 'admin@example.com',
      role: 'ADMIN',
      avatar: defaultAvatar,
      createTime: '2023-01-01 10:00:00'
    };
  }

  /**
   * 删除用户
   */
  async deleteUser(userId) {
    try {
      const response = await this._fetch(`/users/${userId}`, 'DELETE')

      // 处理后端响应，确保返回格式统一
      if (response && response.success !== undefined) {
        return response
      }

      return { success: true, data: response }
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  /**
   * 获取部门列表
   */
  async getDepartments() {
    try {
      const response = await this._fetch('/departments', 'GET')
      return response.data
    } catch (error) {
      console.error('获取部门列表失败:', error)
      throw error
    }
  }

  /**
   * 获取单个部门
   */
  async getDepartmentById(id) {
    try {
      return await this._fetch(`/departments/${id}`, 'GET')
    } catch (error) {
      console.error('获取部门详情失败:', error)
      throw error
    }
  }

  /**
   * 创建部门
   */
  async createDepartment(departmentData) {
    try {
      return await this._fetch('/departments', 'POST', departmentData)
    } catch (error) {
      console.error('创建部门失败:', error)
      throw error
    }
  }

  /**
   * 更新部门
   */
  async updateDepartment(id, departmentData) {
    try {
      return await this._fetch(`/departments/${id}`, 'PUT', departmentData)
    } catch (error) {
      console.error('更新部门失败:', error)
      throw error
    }
  }

  /**
   * 删除部门
   */
  async deleteDepartment(id) {
    try {
      return await this._fetch(`/departments/${id}`, 'DELETE')
    } catch (error) {
      console.error('删除部门失败:', error)
      throw error
    }
  }

  /**
   * 获取项目统计数据
   */
  async getProjectStatistics() {
    try {

      const response = await this._fetch('/projects/statistics/comprehensive', 'GET')
      return response.data
    } catch (error) {
      console.error('获取项目统计数据失败:', error)
      throw error
    }
  }

  /**
   * 获取图表数据
   */
  async getChartData(params) {
    try {
      // 构建查询字符串
      let queryString = ''
      if (typeof params === 'object' && params !== null) {
        const searchParams = new URLSearchParams()
        if (params.projectId !== undefined) {
          searchParams.append('projectId', params.projectId)
        }
        if (params.startDate) {
          searchParams.append('startDate', params.startDate)
        }
        if (params.endDate) {
          searchParams.append('endDate', params.endDate)
        }
        if (params.dateRangeType) {
          searchParams.append('dateRangeType', params.dateRangeType)
        }
        queryString = searchParams.toString() ? `?${searchParams.toString()}` : ''
      }

      // 发送请求
      const response = await this._fetch(`/chart-data/progressTrend${queryString}`, 'GET')
      return response
    } catch (error) {
      console.error('获取图表数据失败:', error)
      throw error
    }
  }

  // 以下是模拟数据生成方法

  /**
   * 模拟登录
   */
  _mockLogin(data) {
    // 验证码检查 - 从localStorage中获取验证码进行验证
    if (data.captchaToken && data.captchaCode) {
      const storedCaptcha = localStorage.getItem('captcha_' + data.captchaToken)
      if (!storedCaptcha || storedCaptcha.toLowerCase() !== data.captchaCode.toLowerCase()) {
        throw new Error('验证码错误')
      }
      // 验证成功后清除存储的验证码
      localStorage.removeItem('captcha_' + data.captchaToken)
    } else if (data.captchaCode) {
      throw new Error('验证码不完整')
    }

    if ((data.username === 'admin' || data.username === 'user') && data.password === 'password') {
      const token = 'mock-jwt-token-' + Date.now()
      this.setAuthToken(token)

      // 构建用户信息对象
      const userInfo = {
        id: data.username === 'admin' ? '1' : '2',
        username: data.username,
        name: data.username === 'admin' ? '管理员' : '普通用户',
        email: data.username === 'admin' ? 'admin@example.com' : 'user@example.com',
        role: data.username === 'admin' ? 'admin' : 'user',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjBlNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      }

      // 保存用户信息到localStorage
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      return {
        success: true,
        token,
        user: userInfo
      }
    }
    throw new Error('用户名或密码错误')
  }

  /**
   * 模拟获取用户列表
   */
  _mockGetUsers() {
    // 从localStorage获取模拟用户数据
    let users = localStorage.getItem('mockUsers')
    if (users) {
      try {
        users = JSON.parse(users)
      } catch (error) {
        users = null
      }
    }

    // 如果没有用户数据，使用默认的模拟数据
    if (!users || !users.length) {
      users = [
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
      // 保存默认用户数据到localStorage
      localStorage.setItem('mockUsers', JSON.stringify(users))
    }

    return {
      success: true,
      data: users
    }
  }

  /**
   * 模拟获取分页的用户数据
   */
  _mockGetUsersPage(page = 0, size = 10) {
    // 获取所有团队成员数据
    const allMembers = this._mockGetTeamMembers();

    // 计算分页
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedMembers = allMembers.slice(startIndex, endIndex);

    // 返回分页格式的数据
    return {
      content: paginatedMembers,
      page: page,
      size: size,
      totalElements: allMembers.length,
      totalPages: Math.ceil(allMembers.length / size),
      last: endIndex >= allMembers.length
    };
  }

  /**
   * 模拟筛选用户列表
   */
  _mockFilterUsers(filterParams) {
    // 获取所有用户数据
    let users = this._mockGetUsers().data || [];

    // 按部门ID筛选
    if (filterParams.departmentId) {
      users = users.filter(user => user.departmentId === filterParams.departmentId);
    }

    // 按用户名模糊匹配
    if (filterParams.username) {
      const keyword = filterParams.username.toLowerCase();
      users = users.filter(user =>
        user.username.toLowerCase().includes(keyword)
      );
    }

    // 按邮箱筛选
    if (filterParams.email) {
      users = users.filter(user =>
        user.email === filterParams.email
      );
    }

    // 按手机号筛选
    if (filterParams.phone) {
      users = users.filter(user =>
        user.phone === filterParams.phone
      );
    }

    // 按角色筛选
    if (filterParams.role) {
      users = users.filter(user =>
        user.role === filterParams.role.toLowerCase()
      );
    }

    // 按活跃状态筛选
    if (filterParams.isActive !== undefined) {
      users = users.filter(user =>
        user.isActive === filterParams.isActive
      );
    }

    return {
      success: true,
      data: users,
      total: users.length
    };
  }

  /**
   * 模拟创建用户
   */
  _mockCreateUser(data) {
    // 从localStorage获取模拟用户数据
    let users = localStorage.getItem('mockUsers')
    if (users) {
      try {
        users = JSON.parse(users)
      } catch (error) {
        users = []
      }
    } else {
      users = []
    }

    // 检查用户名是否已存在
    const existingUser = users.find(user => user.username === data.username)
    if (existingUser) {
      throw new Error('用户名已存在')
    }

    // 创建新用户
    const newUser = {
      id: String(Date.now()), // 使用时间戳作为ID
      username: data.username,
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      createTime: new Date().toLocaleString('zh-CN')
    }

    // 添加到用户列表
    users.push(newUser)

    // 保存更新后的用户数据到localStorage
    localStorage.setItem('mockUsers', JSON.stringify(users))

    return {
      success: true,
      data: newUser
    }
  }

  /**
   * 模拟更新用户
   */
  _mockUpdateUser(id, data) {
    // 从localStorage获取模拟用户数据
    let users = localStorage.getItem('mockUsers')
    if (users) {
      try {
        users = JSON.parse(users)
      } catch (error) {
        users = []
      }
    } else {
      users = []
    }

    // 查找要更新的用户
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }

    // 不允许修改admin用户的角色
    if (users[userIndex].username === 'admin') {
      delete data.role // 移除角色更新
      delete data.username // 移除用户名更新
    }

    // 更新用户数据
    users[userIndex] = {
      ...users[userIndex],
      ...data
    }

    // 保存更新后的用户数据到localStorage
    localStorage.setItem('mockUsers', JSON.stringify(users))

    // 如果更新的是当前登录用户，也要更新userInfo
    const currentUserInfo = localStorage.getItem('userInfo')
    if (currentUserInfo) {
      try {
        const currentUser = JSON.parse(currentUserInfo)
        if (currentUser.id === id) {
          currentUser.name = data.name || currentUser.name
          currentUser.email = data.email || currentUser.email
          currentUser.role = data.role || currentUser.role
          localStorage.setItem('userInfo', JSON.stringify(currentUser))
        }
      } catch (error) {
        console.error('更新当前用户信息失败:', error)
      }
    }

    return {
      success: true,
      data: users[userIndex]
    }
  }

  /**
   * 模拟删除用户
   */
  _mockDeleteUser(id) {
    // 从localStorage获取模拟用户数据
    let users = localStorage.getItem('mockUsers')
    if (users) {
      try {
        users = JSON.parse(users)
      } catch (error) {
        users = []
      }
    } else {
      users = []
    }

    // 查找要删除的用户
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }

    // 不允许删除admin用户
    if (users[userIndex].username === 'admin') {
      throw new Error('管理员用户不能删除')
    }

    // 删除用户
    users.splice(userIndex, 1)

    // 保存更新后的用户数据到localStorage
    localStorage.setItem('mockUsers', JSON.stringify(users))

    return {
      success: true,
      message: '用户删除成功'
    }
  }

  /**
   * 模拟注册 - 模拟后端API的注册验证和处理逻辑
   */
  _mockRegister(data) {
    // 详细的注册验证逻辑，模拟后端API的验证行为

    // 1. 验证必填字段
    if (!data.username) {
      throw new Error('用户名不能为空')
    }
    if (!data.password) {
      throw new Error('密码不能为空')
    }
    if (!data.email) {
      throw new Error('邮箱不能为空')
    }

    // 2. 验证用户名格式和长度
    if (data.username.length < 4 || data.username.length > 20) {
      throw new Error('用户名长度必须在4-20个字符之间')
    }
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      throw new Error('用户名只能包含字母、数字和下划线')
    }

    // 3. 验证用户名是否已存在
    if (data.username === 'admin' || data.username === 'user') {
      throw new Error('用户名已存在，请更换一个')
    }

    // 4. 验证密码强度
    if (data.password.length < 6 || data.password.length > 20) {
      throw new Error('密码长度必须在6-20个字符之间')
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/.test(data.password)) {
      throw new Error('密码必须包含字母和数字')
    }

    // 5. 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('请输入有效的邮箱地址')
    }

    // 6. 验证码检查 - 从localStorage中获取验证码进行验证
    if (data.captchaToken && data.captchaCode) {
      const storedCaptcha = localStorage.getItem('captcha_' + data.captchaToken)
      if (!storedCaptcha) {
        throw new Error('验证码已过期，请重新获取')
      }
      if (storedCaptcha.toLowerCase() !== data.captchaCode.toLowerCase()) {
        throw new Error('验证码错误，请重新输入')
      }
      // 验证成功后清除存储的验证码
      localStorage.removeItem('captcha_' + data.captchaToken)
    } else if (data.captchaCode) {
      throw new Error('验证码不完整')
    } else {
      throw new Error('请输入验证码')
    }

    // 7. 模拟数据库存储用户信息
    // 在实际应用中，这里会将用户信息存储到数据库中
    const mockUserId = 'user_' + Date.now()
    const mockCreateTime = new Date().toISOString()

    // 8. 注册成功，返回标准格式的响应
    return {
      success: true,
      code: 200,
      message: '注册成功，请登录',
      data: {
        userId: mockUserId,
        username: data.username,
        email: data.email,
        createTime: mockCreateTime,
        // 其他用户信息...
      }
    }
  }

  /**
     * 模拟获取验证码（已改为前端生成，此方法保留用于兼容性）
     */
  _mockGetCaptcha() {
    return this._generateCaptcha()
  }

  /**
   * 模拟登出
   */
  _mockLogout() {
    this.setAuthToken(null)
    return { success: true }
  }

  /**
   * 模拟获取所有项目
   */
  _mockGetProjects() {
    return [
      {
        id: '1',
        name: '企业网站重构',
        manager: '张三',
        progress: 75,
        status: 'in-progress',
        deadline: '2023-12-31',
        description: '对企业官网进行全面重构，包括前端设计和后端功能优化。',
        team: ['张三', '李四', '王五'],
        budget: 200000,
        spent: 150000,
        startDate: '2023-10-01',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZFRkJCQiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48cGF0aCBkPSJNMzUgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMwMEI4RDIiLz48cGF0aCBkPSJNNTAgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMwMEI4RDIiLz48cGF0aCBkPSJNNjUgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMwMEI4RDIiLz48L3N2Zz4='
      },
      {
        id: '2',
        name: '移动应用开发',
        manager: '李四',
        progress: 45,
        status: 'in-progress',
        deadline: '2024-02-15',
        description: '开发一款跨平台的移动应用，支持iOS和Android系统。',
        team: ['李四', '赵六', '钱七'],
        budget: 300000,
        spent: 135000,
        startDate: '2023-11-01',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZGRkJCQiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48cGF0aCBkPSJNMzUgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNGRjQ0NDIiLz48cGF0aCBkPSJNNTAgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNGRjQ0NDIiLz48cGF0aCBkPSJNNjUgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNGRjQ0NDIiLz48L3N2Zz4='
      },
      {
        id: '3',
        name: '数据分析平台',
        manager: '王五',
        progress: 100,
        status: 'completed',
        deadline: '2023-11-20',
        description: '构建企业级数据分析平台，支持实时数据处理和可视化展示。',
        team: ['王五', '孙八', '周九'],
        budget: 150000,
        spent: 145000,
        startDate: '2023-09-01',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZFRkJCQiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48cGF0aCBkPSJNMzUgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMzMDhFMTYiLz48cGF0aCBkPSJNNTAgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMzMDhFMTYiLz48cGF0aCBkPSJNNjUgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMzMDhFMTYiLz48L3N2Zz4='
      },
      {
        id: '4',
        name: '客户关系管理系统',
        manager: '赵六',
        progress: 20,
        status: 'planned',
        deadline: '2024-03-30',
        description: '开发客户关系管理系统，优化客户服务流程和销售管理。',
        team: ['赵六', '钱七', '孙八'],
        budget: 180000,
        spent: 36000,
        startDate: '2023-12-01',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZFRkJCQiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48cGF0aCBkPSJNMzUgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiM5QzIwQkMiLz48cGF0aCBkPSJNNTAgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiM5QzIwQkMiLz48cGF0aCBkPSJNNjUgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiM5QzIwQkMiLz48L3N2Zz4='
      },
      {
        id: '5',
        name: '内部协作平台',
        manager: '孙八',
        progress: 30,
        status: 'delayed',
        deadline: '2023-12-15',
        description: '构建内部员工协作平台，提升团队沟通和工作效率。',
        team: ['孙八', '周九', '吴十'],
        budget: 120000,
        spent: 50000,
        startDate: '2023-10-15',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZFRkJCQiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48cGF0aCBkPSJNMzUgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNEMjkyQTgiLz48cGF0aCBkPSJNNTAgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNEMjkyQTgiLz48cGF0aCBkPSJNNjUgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNEMjkyQTgiLz48L3N2Zz4='
      }
    ]
  }

  /**
   * 模拟获取单个项目
   */
  _mockGetProjectById(id) {
    const projects = this._mockGetProjects()
    return projects.find(project => project.id === id) || null
  }

  /**
   * 模拟创建项目
   */
  _mockCreateProject(data) {
    const projects = this._mockGetProjects()
    const newId = String(projects.length + 1)
    const newProject = {
      id: newId,
      ...data,
      avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0ZFRkJCQiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48cGF0aCBkPSJNMzUgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMyRjY3QkUiLz48cGF0aCBkPSJNNTAgMzVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMyRjY3QkUiLz48cGF0aCBkPSJNNjUgNjVjMC01LjUyMyA0LjQ3Ny0xMCAxMC0xMCA1LjUyMyAwIDEwIDQuNDc3IDEwIDEwcy00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMyRjY3QkUiLz48L3N2Zz4='
    }
    // 在实际应用中，这里会将新项目添加到数组中
    return newProject
  }

  /**
   * 模拟更新项目
   */
  _mockUpdateProject(id, data) {
    const project = this._mockGetProjectById(id)
    if (project) {
      // 合并更新数据
      const updatedProject = { ...project, ...data }
      return updatedProject
    }
    throw new Error('项目不存在')
  }

  /**
   * 模拟删除项目
   */
  _mockDeleteProject(id) {
    const project = this._mockGetProjectById(id)
    if (project) {
      // 在实际应用中，这里会从数组中删除项目
      return { success: true }
    }
    throw new Error('项目不存在')
  }

  /**
   * 模拟获取团队成员
   */
  _mockGetTeamMembers() {
    return [
      {
        id: '1',
        name: '张三',
        position: '项目经理',
        email: 'zhangsan@example.com',
        projectCount: 3,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjBlNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      },
      {
        id: '2',
        name: '李四',
        position: '前端开发',
        email: 'lisi@example.com',
        projectCount: 2,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjVmNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      },
      {
        id: '3',
        name: '王五',
        position: '后端开发',
        email: 'wangwu@example.com',
        projectCount: 3,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjVmNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      },
      {
        id: '4',
        name: '赵六',
        position: 'UI设计师',
        email: 'zhaoliu@example.com',
        projectCount: 2,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjVmNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      },
      {
        id: '5',
        name: '钱七',
        position: '产品经理',
        email: 'qianqi@example.com',
        projectCount: 3,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjVmNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      },
      {
        id: '6',
        name: '孙八',
        position: '测试工程师',
        email: 'sunba@example.com',
        projectCount: 2,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjVmNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      },
      {
        id: '7',
        name: '周九',
        position: '运维工程师',
        email: 'zhoujiu@example.com',
        projectCount: 2,
        avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCBmaWxsPSIjZjVmNWY1IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiLz48cGF0aCBmaWxsPSIjOGNmZDJlIiBkPSJNMzIgMjRjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOCAzLjU4IDggOC0zLjU4IDgtOCA4LTggMy41OC04IDgtMy41OC04LTgtOHoiLz48cGF0aCBmaWxsPSIjNDc5OTJjIiBkPSJNMCAwaDY0djY0SDB6Ii8+PC9zdmc+'
      }
    ]
  }

  /**
   * 模拟获取项目统计数据
   */
  _mockGetProjectStatistics() {
    return {
      totalProjects: 5,
      completedProjects: 1,
      inProgressProjects: 2,
      plannedProjects: 1,
      delayedProjects: 1,
      totalBudget: 950000,
      totalSpent: 416000,
      avgProgress: 54
    }
  }

  /**
   * 模拟获取图表数据
   */
  _mockGetChartData(type) {
    switch (type) {
      case 'progress-trends':
        return [
          { month: '10月', completed: 1, inProgress: 2, delayed: 0 },
          { month: '11月', completed: 2, inProgress: 1, delayed: 0 },
          { month: '12月', completed: 0, inProgress: 2, delayed: 1 },
          { month: '1月', completed: 0, inProgress: 2, delayed: 1 },
          { month: '2月', completed: 0, inProgress: 1, delayed: 1 },
          { month: '3月', completed: 0, inProgress: 0, delayed: 1 }
        ]
      case 'project-status':
        return [
          { name: '进行中', value: 2 },
          { name: '已完成', value: 1 },
          { name: '计划中', value: 1 },
          { name: '延期', value: 1 }
        ]
      case 'resource-allocation':
        return [
          { name: '张三', projects: 3 },
          { name: '李四', projects: 2 },
          { name: '王五', projects: 3 },
          { name: '赵六', projects: 2 },
          { name: '钱七', projects: 3 },
          { name: '孙八', projects: 2 },
          { name: '周九', projects: 2 }
        ]
      default:
        return []
    }
  }

  /**
   * 模拟部门数据
   */
  _mockDepartmentsData() {
    // 从localStorage获取模拟部门数据
    let departments = localStorage.getItem('mockDepartments')
    if (departments) {
      try {
        departments = JSON.parse(departments)
      } catch (error) {
        departments = null
      }
    }

    // 如果没有部门数据，使用默认的模拟数据
    if (!departments || !departments.length) {
      departments = [
        {
          id: '1',
          name: '研发部',
          description: '负责产品开发和技术创新',
          managerId: '1',
          manager: {
            id: '1',
            name: '张三',
            position: '项目经理'
          },
          members: [
            { id: '1', name: '张三', position: '项目经理' },
            { id: '2', name: '李四', position: '前端开发' },
            { id: '3', name: '王五', position: '后端开发' },
            { id: '6', name: '孙八', position: '测试工程师' },
            { id: '7', name: '周九', position: '运维工程师' }
          ]
        },
        {
          id: '2',
          name: '设计部',
          description: '负责UI/UX设计和产品原型',
          managerId: '4',
          manager: {
            id: '4',
            name: '赵六',
            position: 'UI设计师'
          },
          members: [
            { id: '4', name: '赵六', position: 'UI设计师' }
          ]
        },
        {
          id: '3',
          name: '产品部',
          description: '负责产品规划和需求分析',
          managerId: '5',
          manager: {
            id: '5',
            name: '钱七',
            position: '产品经理'
          },
          members: [
            { id: '5', name: '钱七', position: '产品经理' }
          ]
        }
      ]
      // 保存默认部门数据到localStorage
      localStorage.setItem('mockDepartments', JSON.stringify(departments))
    }
    return departments
  }

  /**
   * 模拟获取部门列表
   */
  _mockGetDepartments() {
    return this._mockDepartmentsData()
  }

  /**
   * 模拟获取单个部门
   */
  _mockGetDepartmentById(id) {
    const departments = this._mockDepartmentsData()
    return departments.find(department => department.id === id) || null
  }

  /**
   * 模拟创建部门
   */
  _mockCreateDepartment(data) {
    const departments = this._mockDepartmentsData()
    const teamMembers = this._mockGetTeamMembers()

    // 查找部门经理信息
    const manager = teamMembers.find(member => member.id === data.managerId) || null

    // 创建新部门
    const newDepartment = {
      id: String(Date.now()), // 使用时间戳作为ID
      name: data.name,
      description: data.description || '',
      managerId: data.managerId || '',
      manager: manager,
      members: []
    }

    // 添加到部门列表
    departments.push(newDepartment)

    // 保存更新后的部门数据到localStorage
    localStorage.setItem('mockDepartments', JSON.stringify(departments))

    return newDepartment
  }

  /**
   * 模拟更新部门
   */
  _mockUpdateDepartment(id, data) {
    const departments = this._mockDepartmentsData()
    const teamMembers = this._mockGetTeamMembers()

    // 查找要更新的部门
    const departmentIndex = departments.findIndex(department => department.id === id)
    if (departmentIndex === -1) {
      throw new Error('部门不存在')
    }

    // 查找部门经理信息
    const manager = data.managerId ?
      teamMembers.find(member => member.id === data.managerId) || null : null

    // 更新部门数据
    departments[departmentIndex] = {
      ...departments[departmentIndex],
      ...data,
      manager: manager
    }

    // 保存更新后的部门数据到localStorage
    localStorage.setItem('mockDepartments', JSON.stringify(departments))

    return departments[departmentIndex]
  }

  /**
   * 模拟删除部门
   */
  _mockDeleteDepartment(id) {
    const departments = this._mockDepartmentsData()

    // 查找要删除的部门
    const departmentIndex = departments.findIndex(department => department.id === id)
    if (departmentIndex === -1) {
      throw new Error('部门不存在')
    }

    // 删除部门
    departments.splice(departmentIndex, 1)

    // 保存更新后的部门数据到localStorage
    localStorage.setItem('mockDepartments', JSON.stringify(departments))

    return { success: true }
  }
}

// 创建API服务实例
export const api = new ApiService()

export default {
  install(Vue) {
    // 全局注册API服务
    Vue.prototype.$api = api
  }
}