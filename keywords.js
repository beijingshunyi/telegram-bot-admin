// 加载关键词列表
function loadKeywords() {
    API.getKeywords().then(keywords => {
        DataStore.setKeywords(keywords);
        renderKeywordsList(keywords);
    });
}

// 渲染关键词列表
function renderKeywordsList(keywords) {
    const keywordsListElement = document.getElementById('keywords-list');
    keywordsListElement.innerHTML = '';
    
    if (keywords.length === 0) {
        keywordsListElement.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">没有关键词数据</td>
            </tr>
        `;
        return;
    }
    
    keywords.forEach(keyword => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap font-medium">${keyword.keyword}</td>
            <td class="px-6 py-4">${truncateText(keyword.response, 50)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(keyword.created_at)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-blue-600 hover:text-blue-800 edit-keyword-btn mr-3" data-id="${keyword.id}">
                    <i class="fa fa-pencil"></i> 编辑
                </button>
                <button class="text-red-600 hover:text-red-800 delete-keyword-btn" data-id="${keyword.id}">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        `;
        keywordsListElement.appendChild(tr);
    });
    
    // 添加编辑和删除事件监听
    addKeywordActionListeners();
}

// 添加关键词操作监听
function addKeywordActionListeners() {
    // 编辑按钮
    document.querySelectorAll('.edit-keyword-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const keyword = DataStore.getKeywords().find(k => k.id === id);
            
            if (keyword) {
                document.getElementById('edit-keyword-id').value = keyword.id;
                document.getElementById('edit-keyword').value = keyword.keyword;
                document.getElementById('edit-keyword-response').value = keyword.response;
                
                // 显示模态框
                document.getElementById('edit-keyword-modal').classList.remove('hidden');
            }
        });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-keyword-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const keyword = DataStore.getKeywords().find(k => k.id === id);
            
            if (confirm(`确定要删除关键词 "${keyword.keyword}" 吗？`)) {
                API.deleteKeyword(id).then(success => {
                    if (success) {
                        loadKeywords();
                        showNotification('关键词已删除', 'success');
                    } else {
                        showNotification('删除关键词失败', 'error');
                    }
                });
            }
        });
    });
}

// 添加关键词表单提交
document.getElementById('add-keyword-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const keyword = document.getElementById('keyword').value.trim();
    const response = document.getElementById('keyword-response').value.trim();
    
    if (!keyword || !response) {
        showNotification('关键词和回复内容不能为空', 'error');
        return;
    }
    
    // 检查关键词是否已存在
    const existingKeyword = DataStore.getKeywords().find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
    if (existingKeyword) {
        showNotification('该关键词已存在', 'error');
        return;
    }
    
    API.addKeyword(keyword, response).then(success => {
        if (success) {
            // 重置表单
            document.getElementById('add-keyword-form').reset();
            // 重新加载关键词列表
            loadKeywords();
            showNotification('关键词添加成功', 'success');
        } else {
            showNotification('添加关键词失败', 'error');
        }
    });
});

// 编辑关键词表单提交
document.getElementById('edit-keyword-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('edit-keyword-id').value);
    const keyword = document.getElementById('edit-keyword').value.trim();
    const response = document.getElementById('edit-keyword-response').value.trim();
    
    if (!keyword || !response) {
        showNotification('关键词和回复内容不能为空', 'error');
        return;
    }
    
    // 检查是否与其他关键词冲突
    const conflict = DataStore.getKeywords().some(k => 
        k.id !== id && k.keyword.toLowerCase() === keyword.toLowerCase()
    );
    
    if (conflict) {
        showNotification('该关键词已存在', 'error');
        return;
    }
    
    API.updateKeyword(id, keyword, response).then(success => {
        if (success) {
            // 隐藏模态框
            document.getElementById('edit-keyword-modal').classList.add('hidden');
            // 重新加载关键词列表
            loadKeywords();
            showNotification('关键词已更新', 'success');
        } else {
            showNotification('更新关键词失败', 'error');
        }
    });
});

// 截断文本
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
