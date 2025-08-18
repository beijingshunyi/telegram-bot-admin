// 加载封禁列表
function loadBannedUsers() {
    API.getBannedUsers().then(bannedUsers => {
        renderBannedList(bannedUsers);
    });
}

// 渲染封禁列表
function renderBannedList(bannedUsers) {
    const bannedListElement = document.getElementById('banned-list');
    bannedListElement.innerHTML = '';
    
    if (bannedUsers.length === 0) {
        bannedListElement.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">没有封禁的用户</td>
            </tr>
        `;
        return;
    }
    
    bannedUsers.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.innerHTML = `
            <td>${item.userId}</td>
            <td>${item.banTime}</td>
            <td>
                <button class="text-green-600 hover:text-green-800 unban-btn" data-userid="${item.userId}">
                    <i class="fa fa-check"></i> 解封
                </button>
            </td>
        `;
        bannedListElement.appendChild(tr);
    });
    
    // 添加解封事件监听
    addUnbanListeners();
}

// 添加解封按钮监听
function addUnbanListeners() {
    document.querySelectorAll('.unban-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = parseInt(btn.getAttribute('data-userid'));
            if (confirm(`确定要解封用户ID为${userId}的用户吗？`)) {
                API.removeBannedUser(userId).then(success => {
                    if (success) {
                        loadBannedUsers();
                        loadUsers(); // 同时更新用户列表
                    }
                });
            }
        });
    });
}

// 添加封禁用户
document.getElementById('add-ban-btn').addEventListener('click', () => {
    const userId = parseInt(document.getElementById('ban-user-id').value.trim());
    
    if (isNaN(userId)) {
        alert('请输入有效的用户ID');
        return;
    }
    
    // 检查用户是否存在
    const users = DataStore.getUsers();
    const userExists = users.some(u => u.id === userId);
    
    if (!userExists) {
        alert('该用户ID不存在');
        return;
    }
    
    // 检查是否已封禁
    const bannedUsers = DataStore.getBannedUsers();
    const alreadyBanned = bannedUsers.some(b => b.userId === userId);
    
    if (alreadyBanned) {
        alert('该用户已被封禁');
        return;
    }
    
    if (confirm(`确定要封禁用户ID为${userId}的用户吗？`)) {
        API.addBannedUser(userId).then(success => {
            if (success) {
                loadBannedUsers();
                loadUsers(); // 同时更新用户列表
                // 清空输入框
                document.getElementById('ban-user-id').value = '';
            }
        });
    }
});
