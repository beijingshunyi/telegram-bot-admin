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
        const url = config.apiUrl + '/users';
        console.log('尝试获取用户数据 from:', url);
        
        return fetch(url)
            .then(response => {
                console.log('用户数据请求响应状态:', response.status, response.statusText);
                
                if (!response.ok) {
                    // 详细说明错误状态
                    if (response.status === 404) {
                        throw new Error('用户数据API地址不存在 (404)');
                    } else if (response.status === 500) {
                        throw new Error('服务器内部错误 (500)');
                    } else if (response.status === 403) {
                        throw new Error('没有访问权限 (403)');
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
    
    // 确保config正确加载
    function checkConfig() {
        if (typeof config === 'undefined' || !config.apiUrl) {
            showAlert('配置错误: 未找到有效的API地址', 'danger');
            console.error('配置错误: config对象不存在或apiUrl未设置');
            return false;
        }
        console.log('使用的API地址:', config.apiUrl);
        return true;
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
    
