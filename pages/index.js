import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import { 
  FiUsers, 
  FiUserPlus, 
  FiTag, 
  FiBan, 
  FiBarChart2 
} from 'react-icons/fi';
import { userAPI, teacherAPI, keywordAPI, bannedKeywordAPI } from '../lib/api';

// 统计卡片组件
const StatCard = ({ title, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-dark-2 text-sm">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    teachers: 0,
    keywords: 0,
    bannedKeywords: 0,
    topUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 并行请求所有数据
        const [
          usersRes, 
          teachersRes, 
          keywordsRes, 
          bannedRes
        ] = await Promise.all([
          userAPI.getAll(),
          teacherAPI.getAll(),
          keywordAPI.getAll(),
          bannedKeywordAPI.getAll()
        ]);
        
        // 处理用户数据，按积分排序
        const sortedUsers = [...usersRes.data].sort(
          (a, b) => (b.points || 0) - (a.points || 0)
        );
        
        setStats({
          users: usersRes.data.length,
          teachers: teachersRes.data.length,
          keywords: keywordsRes.data.length,
          bannedKeywords: bannedRes.data.length,
          topUsers: sortedUsers.slice(0, 5)
        });
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-danger text-center py-8">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <p className="text-dark-2">系统概览和关键统计数据</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="总用户数" 
          value={stats.users} 
          icon={<FiUsers size={24} className="text-white" />}
          color="bg-primary"
        />
        <StatCard 
          title="老师数量" 
          value={stats.teachers} 
          icon={<FiUserPlus size={24} className="text-white" />}
          color="bg-secondary"
        />
        <StatCard 
          title="关键词数量" 
          value={stats.keywords} 
          icon={<FiTag size={24} className="text-white" />}
          color="bg-success"
        />
        <StatCard 
          title="禁言词数量" 
          value={stats.bannedKeywords} 
          icon={<FiBan size={24} className="text-white" />}
          color="bg-danger"
        />
      </div>

      {/* 积分排行 */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FiBarChart2 size={20} />
            积分排行 Top 5
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header w-16">排名</th>
                <th className="table-header">用户名称</th>
                <th className="table-header">积分</th>
                <th className="table-header">最后签到</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUsers.map((user, index) => (
                <tr key={user.user_id} className="table-row">
                  <td className="table-cell font-medium">
                    {index + 1}
                    {index < 3 && (
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        index === 0 ? 'bg-warning text-white' : 
                        index === 1 ? 'bg-gray-300 text-dark' : 
                        'bg-orange-600 text-white'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    {user.display_name || 
                     `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                     user.username || '未知用户'}
                  </td>
                  <td className="table-cell">{user.points || 0}</td>
                  <td className="table-cell">
                    {user.last_sign_date || '从未签到'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
