// 1. 核心配置
const LOADING_CONFIG = {
    maxTotalTime: 15000, // 全局最大加载时间（15秒），超过强制结束
    timeout: 10000, // 单个API请求超时时间
};

// 2. 超时处理工具函数
function fetchWithTimeout(url, options, timeout = LOADING_CONFIG.timeout) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`请求超时 (${timeout}ms)，URL: ${url}`)), timeout)
        )
    ]);
}

// 3. 加载指示器控制（确保100%能隐藏）
let loaderTimer = null; // 全局加载计时器

function showLoader() {
    const loader = document.getElementById('data-loader');
    if (loader) {
        loader.style.display = 'flex';
        loader.setAttribute('data-loading', 'true');
    }
    
    // 强制超时兜底：无论任何情况，超过maxTotalTime必须隐藏
    loaderTimer = setTimeout(() => {
        if (isLoading()) {
            console.error(`===== 全局加载超时 (${LOADING_CONFIG.maxTotalTime}ms)，强制结束 =====`);
            hideLoader();
            showAlert(`数据加载超时，请刷新页面重试`, 'danger');
        }
    }, LOADING_CONFIG.maxTotalTime);
}

function hideLoader() {
    // 清除强制超时计时器
    if (loaderTimer) {
        clearTimeout(loaderTimer);
        loaderTimer = null;
    }
    
    // 隐藏加载指示器
    const loader = document.getElementById('data-loader');
    if (loader) {
        loader.style.display = 'none';
        loader.removeAttribute('data-loading');
    }
}

function isLoading() {
    const loader = document.getElementById('data-loader');
    return loader && loader.hasAttribute('data-loading');
}

// 4. 数据加载主函数（带完整异常捕获）
function loadAllData() {
    // 双重保险：先强制隐藏一次，防止之前的残留状态
    hideLoader();
    // 显示加载指示器
    showLoader();
    
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] 开始加载所有数据`);
    
    // 全局异常捕获（防止内部未捕获的错误）
    try {
        fetchUsersData()
            .then(() => {
                console.log(`[${new Date().toISOString()}] 用户数据加载完成，耗时: ${Date.now() - startTime}ms`);
                return Promise.allSettled([ // 使用allSettled确保所有请求完成后再处理
                    fetchTeachersData(),
                    fetchKeywordsData(),
                    fetchBannedKeywordsData()
                ]);
            })
            .then(results => {
                // 检查是否有请求失败
                const failed = results.filter(r => r.status === 'rejected');
                if (failed.length > 0) {
                    console.warn(`部分数据加载失败，共${failed.length}项`);
                    failed.forEach((err, i) => {
                        console.error(`失败项${i+1}:`, err.reason);
                    });
                }
                
                console.log(`[${new Date().toISOString()}] 所有数据加载流程完成，总耗时: ${Date.now() - startTime}ms`);
                hideLoader();
                showAlert(failed.length > 0 ? `部分数据加载失败，请查看控制台` : '所有数据加载完成', failed.length > 0 ? 'warning' : 'success');
            })
            .catch(error => {
                console.error(`[${new Date().toISOString()}] 数据加载主流程出错:`);
                console.error('错误详情:', error);
                console.error('错误堆栈:', error.stack);
                hideLoader();
                showAlert(`数据加载失败: ${error.message}`, 'danger');
            });
    } catch (globalError) {
        // 捕获函数内部任何未被处理的异常
        console.error(`[${new Date().toISOString()}] 加载函数内部未捕获异常:`);
        console.error(globalError);
        hideLoader();
        showAlert(`系统错误: ${globalError.message}`, 'danger');
    }
}

// 5. 具体数据加载函数（每个都添加独立错误处理）
function fetchUsersData() {
    const url = config.apiUrl + '/api/users';
    console.log(`[${new Date().toISOString()}] 开始加载用户数据: ${url}`);
    
    return fetchWithTimeout(url, {
        headers: { 'Admin-Key': config.adminKey }
    })
    .then(response => {
        if (!response.ok) throw new Error(`用户数据请求失败 (状态码: ${response.status})`);
        return response.json().catch(() => {
            throw new Error('用户数据不是有效的JSON格式');
        });
    })
    .then(users => {
        if (!Array.isArray(users)) throw new Error('用户数据格式错误（预期数组）');
        renderUsersData(users); // 渲染函数
    })
    .catch(error => {
        console.error(`用户数据加载失败:`, error);
        document.getElementById('users-container').innerHTML = `
            <tr><td colspan="7" class="text-center py-3 text-danger">用户数据加载失败: ${error.message}</td></tr>
        `;
        throw error; // 继续抛出，让上层感知
    });
}

function fetchTeachersData() {
    const url = config.apiUrl + '/api/teachers';
    console.log(`[${new Date().toISOString()}] 开始加载老师数据: ${url}`);
    
    return fetchWithTimeout(url, {
        headers: { 'Admin-Key': config.adminKey }
    })
    .then(response => {
        if (!response.ok) throw new Error(`老师数据请求失败 (状态码: ${response.status})`);
        return response.json().catch(() => {
            throw new Error('老师数据不是有效的JSON格式');
        });
    })
    .then(teachers => {
        if (!Array.isArray(teachers)) throw new Error('老师数据格式错误（预期数组）');
        renderTeachersData(teachers); // 渲染函数
    })
    .catch(error => {
        console.error(`老师数据加载失败:`, error);
        document.getElementById('teachers-container').innerHTML = `
            <tr><td colspan="8" class="text-center py-3 text-danger">老师数据加载失败: ${error.message}</td></tr>
        `;
        throw error;
    });
}

// 其他数据加载函数（keywords、banned keywords）类似，此处省略

// 6. 渲染函数（添加异常捕获）
function renderUsersData(users) {
    try {
        const container = document.getElementById('users-container');
        if (!container) throw new Error('未找到用户数据容器');
        
        // 渲染逻辑（示例）
        container.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <!-- 其他字段 -->
            </tr>
        `).join('');
    } catch (error) {
        console.error('用户数据渲染失败:', error);
        throw new Error(`渲染用户数据时出错: ${error.message}`);
    }
}

// 7. 全局异常捕获（最后一道防线）
window.addEventListener('error', (event) => {
    console.error(`===== 全局未捕获错误 =====`);
    console.error('错误信息:', event.error);
    console.error('错误位置:', event.filename, '行:', event.lineno);
    
    // 如果此时仍在加载中，强制结束
    if (isLoading()) {
        hideLoader();
        showAlert(`系统异常: ${event.error.message}`, 'danger');
    }
});

// 8. 提示框工具函数
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container') || createAlertContainer();
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) alert.classList.remove('show');
    }, 5000);
}

// 自动创建提示框容器（如果页面中没有）
function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.className = 'position-fixed top-3 right-3 z-50';
    document.body.appendChild(container);
    return container;
}
