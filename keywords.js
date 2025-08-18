// 关键词管理模块变量
let currentKeywordPage = 1;
const keywordsPageSize = 20;

// 加载关键词列表
async function loadKeywords(page = 1, search = '') {
    try {
        showLoading();
        
        const result = await API.Keyword.getAll(page, keywordsPageSize, search);
        
        const tableBody = document.getElementById('keywords-table-body');
        tableBody.innerHTML = '';
        
        if (result.keywords.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        没有找到关键词数据
                    </td>
                </tr>
            `;
        } else {
            result.keywords.forEach(keyword => {
                let statusClass = keyword.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                let statusText = keyword.is_active ? '启用' : '禁用';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${keyword.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${keyword.keyword}</td>
                    <td class="px-6 py-4">${keyword.response.substring(0, 50)}${keyword.response.length > 50 ? '...' : ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="text-blue-600 hover:text-blue-900 edit-keyword" data-id="${keyword.id}">
                            <i class="fa fa-pencil"></i> 编辑
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // 添加编辑事件监听
            document.querySelectorAll('.edit-keyword').forEach(btn => {
                btn.addEventListener('click', () => editKeyword(btn.dataset.id));
            });
        }
        
        // 更新分页信息
        document.getElementById('keywords-showing').textContent = result.keywords.length;
        document.getElementById('keywords-total').textContent = result.total;
        
        // 更新分页按钮状态
        const prevBtn = document.getElementById('keywords-prev');
        const nextBtn = document.getElementById('keywords-next');
        
        prevBtn.disabled = result.page <= 1;
        nextBtn.disabled = result.page >= result.totalPages;
        
        prevBtn.onclick = () => {
            if (result.page > 1) {
                currentKeywordPage = result.page - 1;
                loadKeywords(currentKeywordPage, search);
            }
        };
        
        nextBtn.onclick = () => {
            if (result.page < result.totalPages) {
                currentKeywordPage = result.page + 1;
                loadKeywords(currentKeywordPage, search);
            }
        };
        
        currentKeywordPage = result.page;
        
    } catch (error) {
        console.error('加载关键词失败:', error);
        showNotification('加载关键词失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 编辑关键词
async function editKeyword(keywordId) {
    try {
        showLoading();
        
        // 重置表单
        resetKeywordForm();
        
        if (keywordId) {
            // 编辑现有关键词
            const keyword = await API.Keyword.getById(keywordId);
            
            if (keyword) {
                document.getElementById('keyword-id').value = keyword.id;
                document.getElementById('keyword-text').value = keyword.keyword || '';
                document.getElementById('keyword-response').value = keyword.response || '';
                document.getElementById('keyword-active').checked = keyword.is_active !== false;
                
                document.getElementById('keyword-modal-title').textContent = '编辑关键词';
            }
        } else {
            // 添加新关键词
            document.getElementById('keyword-modal-title').textContent = '添加关键词';
        }
        
        document.getElementById('keyword-modal').classList.add('show');
        
    } catch (error) {
        console.error('获取关键词信息失败:', error);
        showNotification('获取关键词信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 重置关键词表单
function resetKeywordForm() {
    document.getElementById('keyword-id').value = '';
    document.getElementById('keyword-text').value = '';
    document.getElementById('keyword-response').value = '';
    document.getElementById('keyword-active').checked = true;
}

// 保存关键词
async function saveKeyword() {
    try {
        showLoading();
        
        const keywordId = document.getElementById('keyword-id').value;
        const text = document.getElementById('keyword-text').value;
        const response = document.getElementById('keyword-response').value;
        const active = document.getElementById('keyword-active').checked;
        
        // 简单验证
        if (!text) {
            throw new Error('请输入关键词');
        }
        
        if (!response) {
            throw new Error('请输入回复内容');
        }
        
        const keywordData = {
            keyword: text,
            response,
            is_active: active
        };
        
        if (keywordId) {
            // 更新现有关键词
            keywordData.id = parseInt(keywordId);
            await API.Keyword.update(keywordData);
        } else {
            // 创建新关键词
            await API.Keyword.create(keywordData);
        }
        
        // 关闭模态框
        document.getElementById('keyword-modal').classList.remove('show');
        
        // 重新加载关键词列表
        loadKeywords(currentKeywordPage);
        
        showNotification(keywordId ? '关键词已更新' : '关键词已添加', 'success');
        
    } catch (error) {
        console.error('保存关键词失败:', error);
        showNotification('保存关键词失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 删除关键词
async function deleteKeyword() {
    if (!confirm('确定要删除这个关键词吗？此操作不可撤销！')) {
        return;
    }
    
    try {
        showLoading();
        
        const keywordId = document.getElementById('keyword-id').value;
        await API.Keyword.delete(keywordId);
        
        // 关闭模态框
        document.getElementById('keyword-modal').classList.remove('show');
        
        // 重新加载关键词列表
        loadKeywords(currentKeywordPage);
        
        showNotification('关键词已删除', 'success');
        
    } catch (error) {
        console.error('删除关键词失败:', error);
        showNotification('删除关键词失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 初始化关键词管理事件
function initKeywordEvents() {
    // 添加关键词
    document.getElementById('add-keyword-btn').addEventListener('click', () => editKeyword(''));
    
    // 保存关键词
    document.getElementById('save-keyword-btn').addEventListener('click', saveKeyword);
    
    // 删除关键词
    document.getElementById('delete-keyword-btn').addEventListener('click', deleteKeyword);
    
    // 关闭关键词模态框
    document.getElementById('close-keyword-modal').addEventListener('click', () => {
        document.getElementById('keyword-modal').classList.remove('show');
    });
    
    // 点击模态框外部关闭
    document.getElementById('keyword-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('keyword-modal')) {
            document.getElementById('keyword-modal').classList.remove('show');
        }
    });
}

// 导出关键词管理函数
window.Keywords = {
    load: loadKeywords,
    initEvents: initKeywordEvents
};
