// 工具函数集合

// 显示成功消息
export function showSuccess(message) {
    // 检查是否已存在消息元素
    let messageElement = document.getElementById('successMessage');
    
    if (messageElement) {
        // 更新现有消息
        messageElement.querySelector('p').textContent = message;
        messageElement.classList.remove('hidden');
    } else {
        // 创建新消息元素
        messageElement = document.createElement('div');
        messageElement.id = 'successMessage';
        messageElement.className = 'fixed top-20 right-4 bg-secondary text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
        messageElement.innerHTML = `
            <div class="flex items-center">
                <i class="fa fa-check-circle mr-3 text-xl"></i>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(messageElement);
    }
    
    // 3秒后自动隐藏
    setTimeout(() => {
        if (messageElement) {
            messageElement.classList.add('opacity-0', 'translate-y-[-10px]');
            setTimeout(() => {
                messageElement.classList.add('hidden');
            }, 300);
        }
    }, 3000);
}

// 显示错误消息
export function showError(message) {
    // 检查是否已存在消息元素
    let messageElement = document.getElementById('errorMessage');
    
    if (messageElement) {
        // 更新现有消息
        messageElement.querySelector('p').textContent = message;
        messageElement.classList.remove('hidden');
    } else {
        // 创建新消息元素
        messageElement = document.createElement('div');
        messageElement.id = 'errorMessage';
        messageElement.className = 'fixed top-20 right-4 bg-danger text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
        messageElement.innerHTML = `
            <div class="flex items-center">
                <i class="fa fa-exclamation-circle mr-3 text-xl"></i>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(messageElement);
    }
    
    // 5秒后自动隐藏
    setTimeout(() => {
        if (messageElement) {
            messageElement.classList.add('opacity-0', 'translate-y-[-10px]');
            setTimeout(() => {
                messageElement.classList.add('hidden');
            }, 300);
        }
    }, 5000);
}

// 显示加载状态
export function showLoading(targetElement = null) {
    // 如果指定了目标元素，在其内部显示加载状态
    if (targetElement) {
        // 保存原始内容
        const originalContent = targetElement.innerHTML;
        targetElement.setAttribute('data-original-content', originalContent);
        
        targetElement.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8">
                <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-gray-500">加载中...</p>
            </div>
        `;
        
        return targetElement;
    }
    
    // 检查是否已存在全局加载元素
    let loadingElement = document.getElementById('globalLoading');
    
    if (loadingElement) {
        loadingElement.classList.remove('hidden');
    } else {
        // 创建新的全局加载元素
        loadingElement = document.createElement('div');
        loadingElement.id = 'globalLoading';
        loadingElement.className = 'fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50';
        loadingElement.innerHTML = `
            <div class="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
                <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-gray-600 font-medium">加载中...</p>
            </div>
        `;
        
        document.body.appendChild(loadingElement);
    }
    
    return loadingElement;
}

// 隐藏加载状态
export function hideLoading(targetElement = null) {
    // 如果指定了目标元素，恢复其原始内容
    if (targetElement) {
        const originalContent = targetElement.getAttribute('data-original-content');
        if (originalContent) {
            targetElement.innerHTML = originalContent;
            targetElement.removeAttribute('data-original-content');
        }
        return;
    }
    
    // 隐藏全局加载元素
    const loadingElement = document.getElementById('globalLoading');
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
}

// 格式化日期
export function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // 检查是否为有效日期
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 计算日期差值（天）
export function getDateDifference(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// 检查项目是否延期
export function isProjectDelayed(project) {
    if (!project.dueDate || project.status === 'Completed') return false;
    
    const today = new Date();
    const dueDate = new Date(project.dueDate);
    
    // 忽略时间部分，只比较日期
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return today > dueDate;
}

// 防抖函数
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 平滑滚动到指定元素
export function scrollToElement(elementId, offset = 80) {
    const element = document.getElementById(elementId);
    if (element) {
        const yOffset = -offset;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
    }
}

// 生成唯一ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 复制文本到剪贴板
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('复制失败:', error);
        
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            console.error('降级复制方案也失败:', err);
            document.body.removeChild(textArea);
            return false;
        }
    }
}