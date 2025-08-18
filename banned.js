// 确保DOM加载完成后再执行
document.addEventListener('DOMContentLoaded', async function() {
    // 检查用户是否已登录
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;
    
    // 加载被禁用户列表
    await loadBannedUsers();
    
    // 确保元素存在后再添加事件监听器
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '/users.html';
        });
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

// 加载被禁用户列表
async function loadBannedUsers() {
    showLoader();
    
    const { data, error } = await getBannedUsers();
    
    hideLoader();
    
    if (error) {
        showError('加载被禁用户失败: ' + error);
        return;
    }
    
    const bannedListElement = document.getElementById('bannedList');
    if (!bannedListElement) return;
    
    bannedListElement.innerHTML = '';
    
    if (!data || data.length === 0) {
        bannedListElement.innerHTML = '<tr><td colspan="5" class="text-center py-4">没有被禁言的用户</td></tr>';
        return;
    }
    
    data.forEach(bannedUser => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="py-3 px-4">${bannedUser.id}</td>
            <td class="py-3 px-4">${bannedUser.user_id}</td>
            <td class="py-3 px-4">${bannedUser.username || 'N/A'}</td>
            <td class="py-3 px-4">${bannedUser.reason}</td>
            <td class="py-3 px-4">${new Date(bannedUser.banned_at).toLocaleString()}</td>
            <td class="py-3 px-4">
                <button onclick="unban('${bannedUser.id}')" 
                        class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
                    解除禁言
                </button>
            </td>
        `;
        
        bannedListElement.appendChild(row);
    });
}

// 解除禁言
async function unban(bannedUserId) {
    if (!confirm('确定要解除禁言吗？')) {
        return;
    }
    
    showLoader();
    
    const { error } = await unbanUser(bannedUserId);
    
    hideLoader();
    
    if (error) {
        alert('解除禁言失败: ' + error);
    } else {
        alert('解除禁言成功');
        await loadBannedUsers();
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
