// 加载关键词列表
function loadKeywords() {
    API.getKeywords().then(keywords => {
        renderKeywordList(keywords);
    });
}

// 渲染关键词列表
function renderKeywordList(keywords) {
    const keywordListElement = document.getElementById('keyword-list');
    keywordListElement.innerHTML = '';
    
    if (keywords.length === 0) {
        keywordListElement.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">没有找到关键词数据</td>
            </tr>
        `;
        return;
    }
    
    keywords.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.innerHTML = `
            <td>${item.keyword}</td>
            <td>${item.response}</td>
            <td>
                <button class="text-blue-600 hover:text-blue-800 mr-2 edit-keyword" data-keyword="${item.keyword}">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="text-red-600 hover:text-red-800 delete-keyword" data-keyword="${item.keyword}">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        `;
        keywordListElement.appendChild(tr);
    });
    
    // 添加关键词操作事件监听
    addKeywordActionListeners();
}

// 添加关键词操作按钮监听
function addKeywordActionListeners() {
    // 编辑关键词
    document.querySelectorAll('.edit-keyword').forEach(btn => {
        btn.addEventListener('click', () => {
            const keyword = btn.getAttribute('data-keyword');
            const keywords = DataStore.getKeywords();
            const item = keywords.find(k => k.keyword === keyword);
            
            if (item) {
                showEditKeywordModal(item);
            }
        });
    });
    
    // 删除关键词
    document.querySelectorAll('.delete-keyword').forEach(btn => {
        btn.addEventListener('click', () => {
            const keyword = btn.getAttribute('data-keyword');
            if (confirm(`确定要删除关键词"${keyword}"吗？`)) {
                API.deleteKeyword(keyword).then(success => {
                    if (success) {
                        loadKeywords();
                    }
                });
            }
        });
    });
}

// 添加关键词
document.getElementById('add-keyword-btn').addEventListener('click', () => {
    const keyword = document.getElementById('new-keyword').value.trim();
    const response = document.getElementById('keyword-response').value.trim();
    
    if (!keyword || !response) {
        alert('请填写关键词和回复内容');
        return;
    }
    
    // 检查关键词是否已存在
    const keywords = DataStore.getKeywords();
    const exists = keywords.some(k => k.keyword === keyword);
    
    if (exists) {
        alert('该关键词已存在，请使用不同的关键词');
        return;
    }
    
    API.addKeyword(keyword, response).then(success => {
        if (success) {
            loadKeywords();
            // 清空输入框
            document.getElementById('new-keyword').value = '';
            document.getElementById('keyword-response').value = '';
        }
    });
});

// 编辑关键词模态框
function showEditKeywordModal(item) {
    const modalContent = `
        <input type="hidden" id="old-keyword" value="${item.keyword}">
        <div class="mb-4">
            <label for="edit-keyword" class="block text-gray-700 mb-2">关键词</label>
            <input type="text" id="edit-keyword" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="${item.keyword}">
        </div>
        <div class="mb-4">
            <label for="edit-response" class="block text-gray-700 mb-2">回复内容</label>
            <input type="text" id="edit-response" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="${item.response}">
        </div>
    `;
    
    showModal('编辑关键词', modalContent, () => {
        const oldKeyword = document.getElementById('old-keyword').value;
        const newKeyword = document.getElementById('edit-keyword').value.trim();
        const newResponse = document.getElementById('edit-response').value.trim();
        
        if (!newKeyword || !newResponse) {
            alert('请填写关键词和回复内容');
            return false; // 不关闭模态框
        }
        
        // 检查新关键词是否已存在（排除自身）
        const keywords = DataStore.getKeywords();
        const exists = keywords.some(k => k.keyword === newKeyword && k.keyword !== oldKeyword);
        
        if (exists) {
            alert('该关键词已存在，请使用不同的关键词');
            return false; // 不关闭模态框
        }
        
        API.updateKeyword(oldKeyword, newKeyword, newResponse).then(success => {
            if (success) {
                loadKeywords();
            }
        });
    });
}
