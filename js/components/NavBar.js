// 导航栏组件
import { getCurrentUser, logout } from '../auth.js';

class NavBar {
    constructor() {
        this.element = null;
        this.userInfo = null;
    }
    
    async render() {
        // 获取当前登录用户信息
        const user = await getCurrentUser();
        this.userInfo = user;
        
        const html = `
            <header class="bg-white shadow-md fixed top-0 left-0 right-0 z-50 transition-all duration-300" id="mainHeader">
                <div class="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="icon bar-chart text-primary text-2xl"></div>
                        <h1 class="text-xl font-bold text-dark">项目进度统计系统</h1>
                    </div>
                    
                    <!-- 导航链接 - 桌面端 -->
                    <nav class="hidden md:flex items-center space-x-6">
                        <a href="#dashboard" class="text-gray-600 hover:text-primary transition-colors font-medium">仪表盘</a>
                        <a href="#projects" class="text-gray-600 hover:text-primary transition-colors font-medium">项目管理</a>
                        <a href="#team" class="text-gray-600 hover:text-primary transition-colors font-medium">团队成员</a>
                        <a href="#reports" class="text-gray-600 hover:text-primary transition-colors font-medium">报表分析</a>
                    </nav>
                    
                    <!-- 用户信息和操作 -->
                    <div class="flex items-center space-x-4 header-actions">
                        <button class="relative text-gray-600 hover:text-primary transition-colors">
                            <div class="icon bell text-xl"></div>
                            <span class="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                        </button>
                        
                        <!-- 用户信息 -->
                        ${this.userInfo ? `
                            <div class="flex items-center space-x-2">
                                <img src="${this.userInfo.avatar}" alt="${this.userInfo.name}" class="w-8 h-8 rounded-full object-cover border-2 border-primary">
                                <span class="hidden md:inline font-medium">${this.userInfo.name}</span>
                            </div>
                        ` : ''}
                        
                        <!-- 登出按钮 -->
                        <button id="logoutBtn" class="text-gray-600 hover:text-primary transition-colors">
                            <div class="icon sign-out text-xl"></div>
                        </button>
                        
                        <!-- 移动端菜单按钮 -->
                        <button class="md:hidden text-gray-600 hover:text-primary transition-colors" id="mobileMenuBtn">
                            <div class="icon bars text-xl"></div>
                        </button>
                    </div>
                </div>
                
                <!-- 移动端导航菜单 -->
                <div class="md:hidden hidden bg-white border-t border-gray-200" id="mobileMenu">
                    <div class="container mx-auto px-4 py-3 space-y-3">
                        <a href="#dashboard" class="block py-2 text-gray-600 hover:text-primary transition-colors font-medium">仪表盘</a>
                        <a href="#projects" class="block py-2 text-gray-600 hover:text-primary transition-colors font-medium">项目管理</a>
                        <a href="#team" class="block py-2 text-gray-600 hover:text-primary transition-colors font-medium">团队成员</a>
                        <a href="#reports" class="block py-2 text-gray-600 hover:text-primary transition-colors font-medium">报表分析</a>
                        ${this.userInfo ? `
                            <a href="#" id="mobileLogoutBtn" class="block py-2 text-gray-600 hover:text-primary transition-colors font-medium">
                                <div class="icon sign-out mr-2"></div>登出
                            </a>
                        ` : ''}
                    </div>
                </div>
            </header>
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
        
        // 移动端菜单切换
        const mobileMenuBtn = this.element.querySelector('#mobileMenuBtn');
        const mobileMenu = this.element.querySelector('#mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // 登出按钮
        const logoutBtn = this.element.querySelector('#logoutBtn');
        const mobileLogoutBtn = this.element.querySelector('#mobileLogoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('确定要退出登录吗？')) {
                    logout();
                }
            });
        }
        
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('确定要退出登录吗？')) {
                    logout();
                }
            });
        }
        
        // 导航栏滚动效果
        const mainHeader = this.element.querySelector('#mainHeader');
        
        if (mainHeader) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    mainHeader.classList.add('header-scrolled');
                } else {
                    mainHeader.classList.remove('header-scrolled');
                }
            });
        }
        
        // 平滑滚动
        this.element.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // 关闭移动端菜单
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });
    }
}

export default NavBar;