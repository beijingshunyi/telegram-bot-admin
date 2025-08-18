import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import { userApi } from '../lib/api';
import UserList from '../components/users/UserList';
import PointsAdjuster from '../components/users/PointsAdjuster';
import { FaSyncAlt, FaSearch } from 'react-icons/fa';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPointsAdjuster, setShowPointsAdjuster] = useState(false);

  const router = useRouter();

  // 获取所有用户
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('获取用户失败: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和刷新
  useEffect(() => {
    fetchUsers();
  }, []);

  // 搜索过滤
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchLower)) ||
      user.user_id.toString().includes(searchTerm)
    );
  });

  // 调整积分
  const handleAdjustPoints = async (userId, pointsChange) => {
    try {
      await userApi.adjustPoints(userId, pointsChange);
      fetchUsers(); // 重新加载用户数据
      setShowPointsAdjuster(false);
    } catch (err) {
      setError('调整积分失败: ' + err.message);
      console.error(err);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await userApi.delete(userId);
        fetchUsers(); // 重新加载用户数据
      } catch (err) {
        setError('删除用户失败: ' + err.message);
        console.error(err);
      }
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">用户管理</h1>
        <p className="text-gray-600">管理所有使用机器人的用户，包括查看积分、调整积分等操作</p>
      </div>

      {/* 搜索和刷新 */}
      <div className="flex mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button
          onClick={fetchUsers}
          className="ml-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaSyncAlt className="mr-2" />
          刷新
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <UserList
          users={filteredUsers}
          loading={loading}
          onAdjustPoints={(user) => {
            setSelectedUser(user);
            setShowPointsAdjuster(true);
          }}
          onDeleteUser={handleDeleteUser}
        />
      </div>

      {/* 积分调整弹窗 */}
      {showPointsAdjuster && selectedUser && (
        <PointsAdjuster
          user={selectedUser}
          onClose={() => setShowPointsAdjuster(false)}
          onAdjust={handleAdjustPoints}
        />
      )}
    </Layout>
  );
}
