// 禁言词管理模块变量
let currentBannedPage = 1;
const bannedPageSize = 20;

// 加载禁言词列表
async function loadBannedKeywords(page = 1, search = '') {
    try {
        showLoading();
        
        const result = await API.BannedKeyword.getAll(page, bannedPageSize, search);
        
        const tableBody = document.getElementById('banned-table-body');
        tableBody.innerHTML = '';
        
        if (result.banned.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                        没有找到禁言词数据
                    </td>
                </tr>
            `;
        } else {
            result.banned.forEach(banned => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${banned.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${banned.keyword}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formatDate(banned.created_at)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="text-blue-600 hover:text-blue-900 edit-banned" data-id="${banned.id}">
                            <i class="fa fa-pencil"></i> 编辑
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // 添加编辑事件监听
            document.querySelectorAll('.edit-banned').forEach(btn => {
                btn.addEventListener('click', () => editBannedKeyword(btn.dataset.id));
            });
        }
        
        // 更新分页信息
        document.getElementById('banned-showing').textContent = result.banned.length;
        document.getElementById('banned-total').textContent = result.total;
        
        // 更新分页按钮状态
        const prevBtn = document.getElementById('banned-prev');
        const nextBtn = document.getElementById('banned-next');
        
        prevBtn.disabled = result.page <= 1;
        nextBtn.disabled = result.page >= result.totalPages;
        
        prevBtn.onclick = () => {
            if (result.page > 1) {
                currentBannedPage = result.page - 1;
                loadBannedKeywords(currentBannedPage, search);
            }
        };
        
        nextBtn.onclick = () => {
            if (result.page < result.totalPages) {
                currentBannedPage = result.page + 1;
                loadBannedKeywords(currentBannedPage, search);
            }
        };
        
        currentBannedPage = result.page;
        
    } catch (error) {
        console.error('加载禁言词失败:', error);
        showNotification('加载禁言词失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
}

// 编辑禁言词
async function editBannedKeyword(bannedId) {
    try {
        showLoading();
        
        // 重置表单
        resetBannedForm();
        
        if (bannedId) {
            // 编辑现有禁言词
            const banned = await API.BannedKeyword.getById(bannedId);
            
            if (banned) {
                document.getElementById('banned-id').value = banned.id;
                document.getElementById('banned-text').value = banned.keyword || '';
                
                document.getElementById('banned-modal-title').textContent = '编辑禁言词';
            }
        } else {
            // 添加新禁言词
            document.getElementById('banned-modal-title').textContent = '添加禁言词';
        }
        
        document.getElementById('banned-modal').classList.add('show');
        
    } catch (error) {
        console.error('获取禁言词信息失败:', error);
        showNotification('获取禁言词信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 重置禁言词表单
function resetBannedForm() {
    document.getElementById('banned-id').value = '';
    document.getElementById('banned-text').value = '';
}

// 保存禁言词
async function saveBannedKeyword() {
    try {
        showLoading();
        
        const bannedId = document.getElementById('banned-id').value;
        const text = document.getElementById('banned-text').value;
        
        // 简单验证
        if (!text) {
            throw new Error('请输入禁言词');
        }
        
        const bannedData = {
            keyword: text
        };
        
        if (bannedId) {
            // 更新现有禁言词
            bannedData.id = parseInt(bannedId);
            await API.BannedKeyword.update(bannedData);
        } else {
            // 创建新禁言词
            await API.BannedKeyword.create(bannedData);
        }
        
        // 关闭模态框
        document.getElementById('banned-modal').classList.remove('show');
        
        // 重新加载禁言词列表
        loadBannedKeywords(currentBannedPage);
        
        showNotification(bannedId ? '禁言词已更新' : '禁言词已添加', 'success');
        
    } catch (error) {
        console.error('保存禁言词失败:', error);
        showNotification('保存禁言词失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 删除禁言词
async function deleteBannedKeyword() {
    if (!confirm('确定要删除这个禁言词吗？此操作不可撤销！')) {
        return;
    }
    
    try {
        showLoading();
        
        const bannedId = document.getElementById('banned-id').value;
        await API.BannedKeyword.delete(bannedId);
        
        // 关闭模态框
        document.getElementById('banned-modal').classList.remove('show');
        
        // 重新加载禁言词列表
        loadBannedKeywords(currentBannedPage);
        
        showNotification('禁言词已删除', 'success');
        
    } catch (error) {
        console.error('删除禁言词失败:', error);
        showNotification('删除禁言词失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 初始化禁言词管理事件
function initBannedEvents() {
    // 添加禁言词
    document.getElementById('add-banned-btn').addEventListener('click', () => editBannedKeyword(''));
    
    // 保存禁言词
    document.getElementById('save-banned-btn').addEventListener('click', saveBannedKeyword);
    
    // 删除禁言词
    document.getElementById('delete-banned-btn').addEventListener('click', deleteBannedKeyword);
    
    // 关闭禁言词模态框
    document.getElementById('close-banned-modal').addEventListener('click', () => {
        document.getElementById('banned-modal').classList.remove('show');
    });
    
    // 点击模态框外部关闭
    document.getElementById('banned-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('banned-modal')) {
            document.getElementById('banned-modal').classList.remove('show');
        }
    });
}

// 导出禁言词管理函数
window.Banned = {
    load: loadBannedKeywords,
    initEvents: initBannedEvents
};
