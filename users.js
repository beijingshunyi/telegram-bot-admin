// 确保DOM加载完成后再执行
document.addEventListener('DOMContentLoaded', async function() {
    // 检查用户是否已登录
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    // 加载用户列表
    await loadUsers();
    
    // 确保元素存在后再添加事件监听器
    const banUserBtn = document.getElementById('banUserBtn');
    if (banUserBtn) {
        banUserBtn.addEventListener('click', openBanModal);
    }
    
    const closeModalBtn = document.getElementById('closeBanModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeBanModal);
    }
    
    const submitBanBtn = document.getElementById('submitBan');
    if (submitBanBtn) {
        submitBanBtn.addEventListener('click', submitBan);
    }
    
    // 登出按钮事件
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            const { error } = await logout();
            if (error) {
                alert('登出失败: ' + error);
            } else {
                window.location.href = '/login.html';
            }
        });
    }
});

// 加载用户列表
async function loadUsers() {
    showLoader();
    
    const { data, error } = await getUsers();
    
    hideLoader();
    
    if (error) {
        showError('加载用户失败: ' + error);
        return;
    }
    
    const userListElement = document.getElementById('userList');
    if (!userListElement) return;
    
    userListElement.innerHTML = '';
    
    if (!data || data.length === 0) {
        userListElement.innerHTML = '<tr><td colspan="4" class="text-center py-4">没有用户数据</td></tr>';
        return;
    }
    
    data.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="py-3 px-4">${user.id}</td>
            <td class="py-3 px-4">${user.username || 'N/A'}</td>
            <td class="py-3 px-4">${new Date(user.created_at).toLocaleString()}</td>
            <td class="py-3 px-4">
                <button onclick="prepareBanUser('${user.id}', '${user.username || ''}')" 
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                    禁言
                </button>
            </td>
        `;
        
        userListElement.appendChild(row);
    });
}

// 准备禁言用户
function prepareBanUser(userId, username) {
    document.getElementById('banUserId').value = userId;
    document.getElementById('banUsernameDisplay').textContent = username;
    document.getElementById('banReason').value = '';
    openBanModal();
}

// 打开禁言模态框
function openBanModal() {
    const modal = document.getElementById('banModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 关闭禁言模态框
function closeBanModal() {
    const modal = document.getElementById('banModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 提交禁言
async function submitBan() {
    const userId = document.getElementById('banUserId').value;
    const reason = document.getElementById('banReason').value;
    
    if (!userId || !reason) {
        alert('请填写禁言原因');
        return;
    }
    
    showLoader();
    
    const { error } = await banUser(userId, reason);
    
    hideLoader();
    
    if (error) {
        alert('禁言失败: ' + error);
    } else {
        alert('禁言成功');
        closeBanModal();
        await loadUsers();
        // 尝试更新禁言列表（如果在同一页面）
        if (typeof loadBannedUsers === 'function') {
            await loadBannedUsers();
        }
    }
}

// 显示加载器
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}

// 隐藏加载器
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// 显示错误信息
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        
        // 3秒后自动隐藏错误信息
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 3000);
    }
}
