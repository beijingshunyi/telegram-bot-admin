// 完整的loadAllData函数，带详细错误日志
function loadAllData() {
    // 显示加载指示器
    showLoader();
    
    // 记录开始时间用于性能分析
    const startTime = Date.now();
    const startDateTime = new Date().toISOString();
    console.log(`[${startDateTime}] 开始加载所有数据`);
    
    // 先加载用户数据，再并行加载其他数据
    fetchUsersData()
        .then(() => {
            const userLoadTime = Date.now() - startTime;
            console.log(`[${new Date().toISOString()}] 用户数据加载完成，耗时: ${userLoadTime}ms`);
            
            // 并行加载其他数据
            return Promise.all([
                fetchTeachersData(),
                fetchKeywordsData(),
                fetchBannedKeywordsData()
            ]);
        })
        .then(() => {
            const totalLoadTime = Date.now() - startTime;
            console.log(`[${new Date().toISOString()}] 所有数据加载完成，总耗时: ${totalLoadTime}ms`);
            
            // 隐藏加载指示器并提示成功
            hideLoader();
            showDataLoadedAlert();
        })
        .catch(error => {
            // 详细错误日志记录
            const errorTime = new Date().toISOString();
            const errorDuration = Date.now() - startTime;
            
            console.error(`===== [${errorTime}] 数据加载流程中断 (耗时: ${errorDuration}ms) =====`);
            console.error('错误名称:', error.name);
            console.error('错误消息:', error.message);
            console.error('错误堆栈:', error.stack);
            
            // 检查是否有额外错误信息
            if (error.response) {
                console.error('响应状态:', error.response.status);
                console.error('响应状态文本:', error.response.statusText);
            }
            
            console.error('=============================================');
            
            // 确保隐藏加载指示器，避免一直显示"加载中"
            hideLoader();
            
            // 显示用户友好的错误提示
            showAlert(`数据加载失败: ${error.message}`, 'danger');
        });
}

// 辅助函数：显示加载指示器
function showLoader() {
    const loader = document.getElementById('data-loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

// 辅助函数：隐藏加载指示器
function hideLoader() {
    const loader = document.getElementById('data-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// 辅助函数：显示数据加载成功提示
function showDataLoadedAlert() {
    showAlert('所有数据加载完成', 'success');
}

// 通用提示框显示函数
function showAlert(message, type = 'info') {
    // 假设页面中有一个alert容器
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // 3秒后自动关闭提示
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                alert.classList.add('fade');
            }
        }, 3000);
    }
}
