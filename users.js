// 加载用户列表
function loadUsers() {
    API.getUsers().then(users => {
        renderUserList(users);
    });
}

// 渲染用户列表
function renderUserList(users) {
    const userListElement = document.getElementById('user-list');
    userListElement.innerHTML = '';
    
    if (users.length === 0) {
        userListElement.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">没有找到用户数据</td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.registerTime}</td>
            <td>
                <span class="px-2 py-1 rounded-full text-xs ${user.status === '正常' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${user.status}
                </span>
            </td>
            <td>
                ${user.status === '正常' ? 
                    `<button class="text-red-600 hover:text-red-800 mr-2 ban-user" data-id="${user.id}">
                        <i class="fa fa-ban"></i> 封禁
                    </button>` : 
                    `<button class="text-green-600 hover:text-green-800 mr-2 unban-user" data-id="${user.id}">
                        <i class="fa fa-check"></i> 解封
                    </button>`
                }
            </td>
        `;
        userListElement.appendChild(tr);
    });
    
    // 添加封禁/解封事件监听
    addUserActionListeners();
}

// 添加用户操作按钮监听
function addUserActionListeners() {
    // 封禁用户
    document.querySelectorAll('.ban-user').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.getAttribute('data-id'));
            API.banUser(userId).then(success => {
                if (success) {
                    loadUsers();
                    loadBannedUsers(); // 同时更新封禁列表
                }
            });
        });
    });
    
    // 解封用户
    document.querySelectorAll('.unban-user').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.getAttribute('data-id'));
            API.unbanUser(userId).then(success => {
                if (success) {
                    loadUsers();
                    loadBannedUsers(); // 同时更新封禁列表
                }
            });
        });
    });
}

// 搜索用户
document.getElementById('search-user-btn').addEventListener('click', () => {
    const keyword = document.getElementById('user-search').value.trim();
    API.searchUsers(keyword).then(users => {
        renderUserList(users);
    });
});

// 按回车键搜索
document.getElementById('user-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('search-user-btn').click();
    }
});
