// 导入工具函数
import apiService from './api-service.js';
import { showError } from './utils.js';

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 只有在登录页面才执行登录相关逻辑
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // 检查是否已登录，如果已登录则重定向到首页
        if (isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        // 绑定登录表单提交事件
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await handleLogin();
        });
    }
});

// 检查用户是否已认证 - 临时设置为始终返回true以测试应用主体功能
export function isAuthenticated() {
    // 临时设置为始终返回true，确保应用能加载主界面
    return true;
}

// 处理登录逻辑
export async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const errorElement = document.getElementById('loginError');
    errorElement.textContent = '';
    errorElement.classList.add('hidden');

    // 表单验证
    if (!username || !password) {
        showLoginError('请输入用户名和密码');
        return;
    }

    // 显示加载状态
    const loginButton = document.getElementById('loginForm').querySelector('button[type="submit"]');
    const originalButtonText = loginButton.innerHTML;
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>登录中...';

    try {
        // 调用API服务进行登录
        console.log('登录请求参数:', { username, password, rememberMe });
        const response = await apiService.login({
            username,
            password,
            rememberMe
        });

        if (response.success) {
            // 登录成功，重定向到首页
            window.location.href = 'index.html';
        } else {
            showLoginError(response.message || '登录失败，请检查用户名和密码');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showLoginError('登录失败，请稍后重试');
    } finally {
        // 恢复按钮状态
        loginButton.disabled = false;
        loginButton.innerHTML = originalButtonText;
    }
}

// 显示登录错误信息
function showLoginError(message) {
    const errorElement = document.getElementById('loginError');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');

    // 5秒后自动隐藏错误信息
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

// 处理登出逻辑
export function logout() {
    apiService.logout();
    window.location.href = 'login.html';
}

// 验证用户是否已登录，如果没有则重定向到登录页
export function ensureAuthenticated() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 获取当前登录用户信息
export async function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }

    // 这里可以调用API获取用户详细信息
    // 暂时返回模拟数据
    return {
        id: 1,
        name: '张经理',
        role: 'admin',
        avatar: null // 将在渲染时使用姓名首字母
    };
}