// 加载用户列表
function loadUsers() {
    API.getUsers().then(users => {
        DataStore.setUsers(users);
        renderUsersList(users);
        updateUserStats(users);
    });
}

// 渲染用户列表
function renderUsersList(users) {
    const usersListElement = document.getElementById('users-list');
    usersListElement.innerHTML = '';
    
    if (users.length === 0) {
        usersListElement.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">没有用户数据</td>
            </tr>
        `;
        return;
    }
    
    // 获取封禁用户ID列表
    const bannedUserIds = DataStore.getBannedUsers().map(b => b.user_id);
    const bannedUserIds = DataStore.getBannedUsers().map(b => b.user_id);
    
    users.forEach(user => {
        const isBanned = bannedUserIds.includes(user.id);
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${user.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${user.name || '未设置'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(user.created_at)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${isBanned ? '已封禁' : '正常'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${isBanned ? 
                    `<button class="text-green-600 hover:text-green-800 unban-btn" data-userid="${user.id}">
                        <i class="fa fa-check"></i> 解封
                    </button>` : 
                    `<button class="text-red-600 hover:text-red-800 ban-btn" data-userid="${user.id}">
                        <i class="fa fa-ban"></i> 封禁
                    </button>`
                }
            </td>
        `;
        usersListElement.appendChild(tr);
    });
    
    // 添加封禁/解封事件监听
    addUserActionListeners();
}

// 添加用户操作监听
function addUserActionListeners() {
    // 封禁按钮
    document.querySelectorAll('.ban-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.getAttribute('data-userid'));
            if (confirm(`确定要封禁用户ID为${userId}的用户吗？`)) {
                API.addBannedUser(userId).then(success => {
                    if (success) {
                        loadUsers();
                        loadBannedUsers();
                        showNotification('用户已封禁', 'success');
                    } else {
                        showNotification('封禁用户失败', 'error');
                    }
                });
            }
        });
    });
    
    // 解封按钮
    document.querySelectorAll('.unban-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.getAttribute('data-userid'));
            if (confirm(`确定要解封用户ID为${userId}的用户吗？`)) {
                API.removeBannedUser(userId).then(success => {
                    if (success) {
                        loadUsers();
                        loadBannedUsers();
                        showNotification('用户已解封', 'success');
                    } else {
                        showNotification('解封用户失败', 'error');
                    }
                });
            }
        });
    });
}

// 更新用户统计
function updateUserStats(users) {
    // 这里可以添加更复杂的统计逻辑
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = users.filter(user => {
        return new Date(user.created_at) >= today;
    }).length;
    
    // 更新增长百分比显示
    document.getElementById('users-growth').textContent = `${newUsersToday > 0 ? '+' : ''}${newUsersToday} 新增`;
    
    // 更新最近活动
    updateRecentActivities(users);
}

// 更新最近活动
function updateRecentActivities(users) {
    const activitiesContainer = document.getElementById('recent-activities');
    activitiesContainer.innerHTML = '';
    
    // 获取所有类型的活动并排序
    const activities = [
        ...users.map(user => ({
            type: 'user',
            action: '注册',
            time: user.created_at,
            name: user.name || `用户 ${user.id}`,
            id: user.id
        })),
        ...DataStore.getBannedUsers().map(banned => ({
            type: 'ban',
            action: '被封禁',
            time: banned.ban_time,
            name: `用户 ${banned.user_id}`,
            id: banned.user_id
        })),
        ...DataStore.getKeywords().map(keyword => ({
            type: 'keyword',
            action: '关键词添加',
            time: keyword.created_at,
            name: keyword.keyword,
            id: keyword.id
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
    
    if (activities.length === 0) {
        activitiesContainer.innerHTML = '<div class="text-center text-gray-500 py-2">暂无活动记录</div>';
        return;
    }
    
    activities.forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = 'p-3 border-l-2 rounded bg-gray-50';
        
        let iconClass = '';
        switch(activity.type) {
            case 'user':
                iconClass = 'fa-user text-blue-500';
                break;
            case 'ban':
                iconClass = 'fa-ban text-red-500';
                break;
            case 'keyword':
                iconClass = 'fa-key text-purple-500';
                break;
        }
        
        activityEl.innerHTML = `
            <div class="flex items-start">
                <i class="fa ${iconClass} mt-1 mr-3"></i>
                <div>
                    <p class="text-gray-800">${activity.name} ${activity.action}</p>
                    <p class="text-xs text-gray-500 mt-1">${formatDate(activity.time)}</p>
                </div>
            </div>
        `;
        
        activitiesContainer.appendChild(activityEl);
    });
}
