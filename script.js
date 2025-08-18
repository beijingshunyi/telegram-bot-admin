// 添加超时处理的辅助函数
function fetchWithTimeout(url, options, timeout = 10000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`请求超时 (${timeout}ms)`)), timeout)
        )
    ]);
}

// 修改用户数据加载相关函数，添加详细错误处理
function loadAllData() {
    showLoader();
    
    // 记录开始时间用于调试
    const startTime = Date.now();
    console.log('开始加载所有数据:', new Date().toISOString());
    
    // 先单独加载用户数据，便于调试
    fetchUsersData()
        .then(() => {
            console.log('用户数据加载完成，耗时:', Date.now() - startTime, 'ms');
            // 用户数据加载成功后再加载其他数据
            return Promise.all([
                fetchTeachersData(),
                fetchKeywordsData(),
                fetchBannedKeywordsData()
            ]);
        })
        .then(() => {
            console.log('所有数据加载完成，总耗时:', Date.now() - startTime, 'ms');
            hideLoader();
            showDataLoadedAlert();
        })
        .catch(error => {
            console.error('数据加载流程中断:', error);
            hideLoader();
            showAlert('数据加载失败: ' + error.message, 'danger');
            console.error('数据加载错误详情:', error);
        });
}

// 从API获取用户数据 - 添加详细调试信息和超时处理
function fetchUsersData() {
    const url = config.apiUrl + '/api/users';
    console.log('尝试获取用户数据 from:', url);
    
    return fetchWithTimeout(url, {
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

// 从API获取老师数据 - 添加超时处理
function fetchTeachersData() {
    const url = config.apiUrl + '/api/teachers';
    console.log('尝试获取老师数据 from:', url);
    
    // 使用带超时的fetch
    return fetchWithTimeout(url, {
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

// 从API获取关键词数据 - 添加超时处理
function fetchKeywordsData() {
    const url = config.apiUrl + '/api/keywords';
    console.log('尝试获取关键词数据 from:', url);
    
    return fetchWithTimeout(url, {
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

// 从API获取禁言词数据 - 添加超时处理
function fetchBannedKeywordsData() {
    const url = config.apiUrl + '/api/banned';
    console.log('尝试获取禁言词数据 from:', url);
    
    return fetchWithTimeout(url, {
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

// 提交数据到API的通用函数 - 添加超时处理
function submitDataToAPI(action, table, data) {
    const url = config.apiUrl + '/admin-api';
    console.log(`提交数据到API: ${action} ${table}`, data);
    
    return fetchWithTimeout(url, {
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
    }, 15000) // 提交操作超时时间设为15秒
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

// 其余函数(renderXXX, handleXXX等)保持不变
