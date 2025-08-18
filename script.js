// 修改用户数据加载相关函数，添加详细错误处理
function loadAllData() {
    showLoader();
    
    // 先单独加载用户数据，便于调试
    fetchUsersData()
        .then(() => {
            // 用户数据加载成功后再加载其他数据
            return Promise.all([
                fetchTeachersData(),
                fetchKeywordsData(),
                fetchBannedKeywordsData()
            ]);
        })
        .then(() => {
            hideLoader();
            showDataLoadedAlert();
        })
        .catch(error => {
            hideLoader();
            showAlert('数据加载失败: ' + error.message, 'danger');
            console.error('数据加载错误详情:', error);
        });
}

// 从API获取用户数据 - 添加详细调试信息
function fetchUsersData() {
    const url = config.apiUrl + '/api/users';
    console.log('尝试获取用户数据 from:', url);
    
    return fetch(url, {
        headers: {
            'Admin-Key': config.adminKey
        }
    })
    .then(response => {
        console.log('用户数据请求响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            // 详细说明错误状态
            if (response.status === 404) {
                throw new Error('用户数据API地址不存在 (404)');
            } else if (response.status === 500) {
                throw new Error('服务器内部错误 (500)');
            } else if (response.status === 403 || response.status === 401) {
                throw new Error('没有访问权限，请检查密钥 (401/403)');
            } else {
                throw new Error(`获取用户数据失败 (状态码: ${response.status})`);
            }
        }
        
        // 尝试解析响应内容
        return response.json().catch(() => {
            throw new Error('API返回的数据格式不是有效的JSON');
        });
    })
    .then(users => {
        console.log('成功获取用户数据:', users);
        
        // 验证数据格式
        if (!Array.isArray(users)) {
            throw new Error('用户数据格式错误，预期是数组');
        }
        
        renderUsersData(users);
    })
    .catch(error => {
        console.error('用户数据加载失败:', error);
        // 显示用户数据加载失败，但继续加载其他数据
        showAlert('用户数据加载失败: ' + error.message, 'danger');
        
        // 显示空数据状态
        const container = document.getElementById('users-container');
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-3 text-danger">
                    用户数据加载失败: ${error.message}
                </td>
            </tr>
        `;
        
        // 继续抛出错误，让上层处理
        throw error;
    });
}

// 从API获取老师数据
function fetchTeachersData() {
    const url = config.apiUrl + '/api/teachers';
    console.log('尝试获取老师数据 from:', url);
    
    return fetch(url, {
        headers: {
            'Admin-Key': config.adminKey
        }
    })
    .then(response => {
        console.log('老师数据请求响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`获取老师数据失败 (状态码: ${response.status})`);
        }
        
        return response.json().catch(() => {
            throw new Error('老师数据不是有效的JSON');
        });
    })
    .then(teachers => {
        console.log('成功获取老师数据:', teachers);
        renderTeachersData(teachers);
    })
    .catch(error => {
        console.error('老师数据加载失败:', error);
        showAlert('老师数据加载失败: ' + error.message, 'danger');
        
        const container = document.getElementById('teachers-container');
        container.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-3 text-danger">
                    老师数据加载失败: ${error.message}
                </td>
            </tr>
        `;
        
        throw error;
    });
}

// 从API获取关键词数据
function fetchKeywordsData() {
    const url = config.apiUrl + '/api/keywords';
    console.log('尝试获取关键词数据 from:', url);
    
    return fetch(url, {
        headers: {
            'Admin-Key': config.adminKey
        }
    })
    .then(response => {
        console.log('关键词数据请求响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`获取关键词数据失败 (状态码: ${response.status})`);
        }
        
        return response.json().catch(() => {
            throw new Error('关键词数据不是有效的JSON');
        });
    })
    .then(keywords => {
        console.log('成功获取关键词数据:', keywords);
        renderKeywordsData(keywords);
    })
    .catch(error => {
        console.error('关键词数据加载失败:', error);
        showAlert('关键词数据加载失败: ' + error.message, 'danger');
        
        const container = document.getElementById('keywords-container');
        container.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-3 text-danger">
                    关键词数据加载失败: ${error.message}
                </td>
            </tr>
        `;
        
        throw error;
    });
}

// 从API获取禁言词数据
function fetchBannedKeywordsData() {
    const url = config.apiUrl + '/api/banned';
    console.log('尝试获取禁言词数据 from:', url);
    
    return fetch(url, {
        headers: {
            'Admin-Key': config.adminKey
        }
    })
    .then(response => {
        console.log('禁言词数据请求响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`获取禁言词数据失败 (状态码: ${response.status})`);
        }
        
        return response.json().catch(() => {
            throw new Error('禁言词数据不是有效的JSON');
        });
    })
    .then(bannedKeywords => {
        console.log('成功获取禁言词数据:', bannedKeywords);
        renderBannedKeywordsData(bannedKeywords);
    })
    .catch(error => {
        console.error('禁言词数据加载失败:', error);
        showAlert('禁言词数据加载失败: ' + error.message, 'danger');
        
        const container = document.getElementById('banned-keywords-container');
        container.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3 text-danger">
                    禁言词数据加载失败: ${error.message}
                </td>
            </tr>
        `;
        
        throw error;
    });
}

// 渲染用户数据
function renderUsersData(users) {
    const container = document.getElementById('users-container');
    container.innerHTML = '';
    
    if (users.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-3 text-muted">暂无用户数据</td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.username || '-'}</td>
            <td>${user.display_name || '-'}</td>
            <td>${user.last_name || ''}${user.first_name || ''}</td>
            <td>${user.points || 0}</td>
            <td>${user.last_sign_date || '-'}</td>
            <td>
                <div class="flex space-x-1">
                    <button class="btn-action btn-edit edit-user" data-id="${user.user_id}" title="编辑">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn-action btn-points adjust-points" data-id="${user.user_id}" data-name="${(user.last_name || '') + (user.first_name || '')}" data-points="${user.points || 0}" title="调整积分">
                        <i class="fa fa-credit-card"></i>
                    </button>
                    <button class="btn-action btn-delete delete-item" data-type="user" data-id="${user.user_id}" title="删除">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        container.appendChild(row);
    });
    
    // 绑定用户相关按钮事件
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            openEditUserModal(userId);
        });
    });
    
    document.querySelectorAll('.adjust-points').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const userName = this.getAttribute('data-name');
            const userPoints = this.getAttribute('data-points');
            openPointsModal(userId, userName, userPoints);
        });
    });
    
    document.querySelectorAll('.delete-item[data-type="user"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            currentDeleteInfo = { type: 'user', id: id };
            confirmDeleteModal.show();
        });
    });
}

// 渲染老师数据
function renderTeachersData(teachers) {
    const container = document.getElementById('teachers-container');
    container.innerHTML = '';
    
    if (teachers.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-3 text-muted">暂无老师数据</td>
            </tr>
        `;
        return;
    }
    
    teachers.forEach(teacher => {
        let statusClass = '';
        let statusText = '';
        
        switch(teacher.status) {
            case 'approved':
                statusClass = 'text-green-600 bg-green-100';
                statusText = '已认证';
                break;
            case 'pending':
                statusClass = 'text-yellow-600 bg-yellow-100';
                statusText = '待审核';
                break;
            case 'rejected':
                statusClass = 'text-red-600 bg-red-100';
                statusText = '已拒绝';
                break;
        }
        
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.nickname}</td>
            <td>${teacher.age}</td>
            <td>${teacher.region}</td>
            <td>${teacher.service_type}</td>
            <td>${teacher.repair_cost}</td>
            <td><span class="px-2 py-1 rounded-full text-xs ${statusClass}">${statusText}</span></td>
            <td>
                <div class="flex space-x-1">
                    <button class="btn-action btn-edit edit-teacher" data-id="${teacher.id}" title="编辑">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn-action btn-delete delete-item" data-type="teacher" data-id="${teacher.id}" title="删除">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        container.appendChild(row);
    });
    
    // 绑定老师相关按钮事件
    document.querySelectorAll('.edit-teacher').forEach(btn => {
        btn.addEventListener('click', function() {
            const teacherId = this.getAttribute('data-id');
            openEditTeacherModal(teacherId);
        });
    });
    
    document.querySelectorAll('.delete-item[data-type="teacher"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            currentDeleteInfo = { type: 'teacher', id: id };
            confirmDeleteModal.show();
        });
    });
}

// 渲染关键词数据
function renderKeywordsData(keywords) {
    const container = document.getElementById('keywords-container');
    container.innerHTML = '';
    
    if (keywords.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-3 text-muted">暂无关键词数据</td>
            </tr>
        `;
        return;
    }
    
    keywords.forEach(keyword => {
        const statusClass = keyword.is_active ? 'text-green-600' : 'text-gray-400';
        const statusText = keyword.is_active ? '启用' : '禁用';
        
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${keyword.keyword}</td>
            <td>${keyword.response.substring(0, 30)}${keyword.response.length > 30 ? '...' : ''}</td>
            <td><span class="px-2 py-1 rounded-full text-xs ${statusClass}">${statusText}</span></td>
            <td>
                <div class="flex space-x-1">
                    <button class="btn-action btn-edit edit-keyword" data-id="${keyword.id}" title="编辑">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn-action btn-delete delete-item" data-type="keyword" data-id="${keyword.id}" title="删除">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        container.appendChild(row);
    });
    
    // 绑定关键词相关按钮事件
    document.querySelectorAll('.edit-keyword').forEach(btn => {
        btn.addEventListener('click', function() {
            const keywordId = this.getAttribute('data-id');
            openEditKeywordModal(keywordId);
        });
    });
    
    document.querySelectorAll('.delete-item[data-type="keyword"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            currentDeleteInfo = { type: 'keyword', id: id };
            confirmDeleteModal.show();
        });
    });
}

// 渲染禁言词数据
function renderBannedKeywordsData(bannedKeywords) {
    const container = document.getElementById('banned-keywords-container');
    container.innerHTML = '';
    
    if (bannedKeywords.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-3 text-muted">暂无禁言词数据</td>
            </tr>
        `;
        return;
    }
    
    bannedKeywords.forEach(keyword => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        row.innerHTML = `
            <td>${keyword.keyword}</td>
            <td>
                <div class="flex space-x-1">
                    <button class="btn-action btn-edit edit-banned" data-id="${keyword.id}" data-text="${keyword.keyword}" title="编辑">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn-action btn-delete delete-item" data-type="banned" data-id="${keyword.id}" title="删除">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        container.appendChild(row);
    });
    
    // 绑定禁言词相关按钮事件
    document.querySelectorAll('.edit-banned').forEach(btn => {
        btn.addEventListener('click', function() {
            const bannedId = this.getAttribute('data-id');
            const bannedText = this.getAttribute('data-text');
            openEditBannedModal(bannedId, bannedText);
        });
    });
    
    document.querySelectorAll('.delete-item[data-type="banned"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            currentDeleteInfo = { type: 'banned', id: id };
            confirmDeleteModal.show();
        });
    });
}

// 确保config正确加载
function checkConfig() {
    if (typeof config === 'undefined' || !config.apiUrl || !config.adminKey) {
        showAlert('配置错误: 未找到有效的API地址或管理员密钥', 'danger');
        console.error('配置错误: config对象不存在或apiUrl/adminKey未设置');
        return false;
    }
    console.log('使用的API地址:', config.apiUrl);
    return true;
}

// 提交数据到API的通用函数
function submitDataToAPI(action, table, data) {
    const url = config.apiUrl + '/admin-api';
    console.log(`提交数据到API: ${action} ${table}`, data);
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Admin-Key': config.adminKey
        },
        body: JSON.stringify({
            action: action,
            table: table,
            data: data
        })
    })
    .then(response => {
        console.log(`API响应状态 (${action} ${table}):`, response.status, response.statusText);
        
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || `操作失败 (状态码: ${response.status})`);
            }).catch(() => {
                throw new Error(`操作失败 (状态码: ${response.status})`);
            });
        }
        
        return response.json();
    });
}

// 处理用户表单提交
function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const mode = document.getElementById('user-form-mode').value;
    const userData = {
        user_id: document.getElementById('user_id').value,
        username: document.getElementById('username').value,
        display_name: document.getElementById('display_name').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        points: parseInt(document.getElementById('points').value) || 0
    };
    
    // 显示加载指示器
    showLoader();
    
    // 调用API
    submitDataToAPI(mode === 'add' ? 'insert' : 'update', 'users', userData)
        .then(() => {
            userModal.hide();
            loadUsersData();
            showAlert(mode === 'add' ? '用户添加成功' : '用户编辑成功', 'success');
        })
        .catch(error => {
            showAlert('操作失败: ' + error.message, 'danger');
            console.error('用户操作失败:', error);
        })
        .finally(() => {
            hideLoader();
        });
}

// 处理老师表单提交
function handleTeacherFormSubmit(e) {
    e.preventDefault();
    
    const mode = document.getElementById('teacher-form-mode').value;
    const teacherData = {
        id: mode === 'edit' ? document.getElementById('teacher_id').value : null,
        nickname: document.getElementById('nickname').value,
        age: parseInt(document.getElementById('age').value) || 0,
        region: document.getElementById('region').value,
        telegram_account: document.getElementById('telegram_account').value,
        channel: document.getElementById('channel').value,
        service_type: document.getElementById('service_type').value,
        repair_cost: document.getElementById('price').value, // 匹配数据库字段
        intro: document.getElementById('intro').value,
        status: document.getElementById('status').value
    };
    
    // 显示加载指示器
    showLoader();
    
    // 调用API
    submitDataToAPI(mode === 'add' ? 'insert' : 'update', 'teachers', teacherData)
        .then(() => {
            teacherModal.hide();
            loadTeachersData();
            showAlert(mode === 'add' ? '老师添加成功' : '老师编辑成功', 'success');
        })
        .catch(error => {
            showAlert('操作失败: ' + error.message, 'danger');
            console.error('老师操作失败:', error);
        })
        .finally(() => {
            hideLoader();
        });
}

// 处理关键词表单提交
function handleKeywordFormSubmit(e) {
    e.preventDefault();
    
    const mode = document.getElementById('keyword-form-mode').value;
    const keywordData = {
        id: mode === 'edit' ? document.getElementById('keyword_id').value : null,
        keyword: document.getElementById('keyword_text').value,
        response: document.getElementById('response_text').value,
        is_active: document.getElementById('is_active').checked
    };
    
    // 显示加载指示器
    showLoader();
    
    // 调用API
    submitDataToAPI(mode === 'add' ? 'insert' : 'update', 'keywords', keywordData)
        .then(() => {
            keywordModal.hide();
            loadKeywordsData();
            showAlert(mode === 'add' ? '关键词添加成功' : '关键词编辑成功', 'success');
        })
        .catch(error => {
            showAlert('操作失败: ' + error.message, 'danger');
            console.error('关键词操作失败:', error);
        })
        .finally(() => {
            hideLoader();
        });
}

// 处理禁言词表单提交
function handleBannedFormSubmit(e) {
    e.preventDefault();
    
    const mode = document.getElementById('banned-form-mode').value;
    const bannedData = {
        id: mode === 'edit' ? document.getElementById('banned_id').value : null,
        keyword: document.getElementById('banned_text').value
    };
    
    // 显示加载指示器
    showLoader();
    
    // 调用API
    submitDataToAPI(mode === 'add' ? 'insert' : 'update', 'banned_keywords', bannedData)
        .then(() => {
            bannedModal.hide();
            loadBannedKeywordsData();
            showAlert(mode === 'add' ? '禁言词添加成功' : '禁言词编辑成功', 'success');
        })
        .catch(error => {
            showAlert('操作失败: ' + error.message, 'danger');
            console.error('禁言词操作失败:', error);
        })
        .finally(() => {
            hideLoader();
        });
}

// 处理积分调整表单提交
function handlePointsFormSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('points_user_id').value;
    const change = parseInt(document.getElementById('points_change').value) || 0;
    
    // 显示加载指示器
    showLoader();
    
    // 调用API
    submitDataToAPI('adjust_points', 'users', {
        user_id: userId,
        points_change: change
    })
    .then(() => {
        pointsModal.hide();
        loadUsersData();
        showAlert('积分调整成功', 'success');
    })
    .catch(error => {
        showAlert('操作失败: ' + error.message, 'danger');
        console.error('积分调整失败:', error);
    })
    .finally(() => {
        hideLoader();
    });
}

// 确认删除
function confirmDelete() {
    if (!currentDeleteInfo) return;
    
    // 显示加载指示器
    showLoader();
    
    // 调用API
    submitDataToAPI('delete', currentDeleteInfo.type === 'banned' ? 'banned_keywords' : currentDeleteInfo.type, {
        id: currentDeleteInfo.id,
        user_id: currentDeleteInfo.type === 'user' ? currentDeleteInfo.id : null
    })
    .then(() => {
        confirmDeleteModal.hide();
        
        // 根据类型重新加载对应数据
        switch(currentDeleteInfo.type) {
            case 'user':
                loadUsersData();
                break;
            case 'teacher':
                loadTeachersData();
                break;
            case 'keyword':
                loadKeywordsData();
                break;
            case 'banned':
                loadBannedKeywordsData();
                break;
        }
        
        showAlert('删除成功', 'success');
        currentDeleteInfo = null;
    })
    .catch(error => {
        showAlert('删除失败: ' + error.message, 'danger');
        console.error('删除操作失败:', error);
    })
    .finally(() => {
        hideLoader();
    });
}

// 修改初始化函数，先检查配置
document.addEventListener('DOMContentLoaded', function() {
    // 先检查配置是否正确
    if (checkConfig()) {
        // 加载所有数据
        loadAllData();
    }
    
    // 绑定事件处理程序
    bindEventHandlers();
});
