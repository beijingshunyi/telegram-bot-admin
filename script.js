// 初始化函数
document.addEventListener('DOMContentLoaded', () => {
  // 加载配置文件
  const script = document.createElement('script');
  script.src = 'config.js';
  document.head.appendChild(script);
  
  // 初始化页面
  script.onload = () => {
    loadRealData();
    setupEventListeners();
  };
});

// 加载真实数据
async function loadRealData() {
  try {
    // 加载用户数据
    const users = await fetchData('users', 'order=created_at.desc&limit=5');
    renderUserStats(users);
    
    // 加载老师数据
    const teachers = await fetchData('teachers', 'status=eq.pending');
    renderTeacherStats(teachers);
    
    // 加载关键词数据
    const keywords = await fetchData('keywords');
    renderKeywordStats(keywords);
    
    // 加载活动数据
    const activities = await fetchData('activities', 'order=timestamp.desc&limit=10');
    renderActivities(activities);
    
    // 加载图表数据
    loadCharts();
    
  } catch (error) {
    console.error('加载数据失败:', error);
    showAlert('danger', '数据加载失败，请检查网络连接');
  }
}

// 从后端获取数据 - 修改为符合您的要求
async function fetchData(table, filter = '') {
  try {
    const response = await fetch('https://telegram-bot.jbk123jbk.workers.dev/admin-api', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Admin-Key": config.ADMIN_API_KEY // 使用配置文件中的密钥
      },
      body: JSON.stringify({
        action: "get",
        table: table,
        filter: filter
      })
    });
    
    if (!response.ok) throw new Error('API请求失败');
    return await response.json();
  } catch (error) {
    console.error('获取数据错误:', error);
    showAlert('danger', '数据加载失败: ' + error.message);
    return [];
  }
}

// 以下代码保持不变...
// [保留您原有的 renderUserStats, renderTeacherStats, renderKeywordStats, renderActivities, formatDate, loadCharts, setupEventListeners 等函数]
