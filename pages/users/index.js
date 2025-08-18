import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../../components/layout/Layout';
import { FiSearch, FiEdit, FiTrash2, FiPlusCircle, FiDollarSign } from 'react-icons/fi';
import { userAPI } from '../../lib/api';

// 用户编辑模态框
const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    user_id: user.user_id,
    display_name: user.display_name || '',
    points: user.points || 0,
    username: user.username || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    last_sign_date: user.last_sign_date || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">编辑用户</h3>
          <button onClick={onClose} className="text-dark-2 hover:text-dark">
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">用户ID</label>
            <input 
              type="text" 
              name="user_id" 
              value={formData.user_id} 
              readOnly
              className="form-input bg-light-1 cursor-not-allowed"
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label">显示名称</label>
            <input 
              type="text" 
              name="display_name" 
              value={formData.display_name} 
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label">积分</label>
            <input 
              type="number" 
              name="points" 
              value={formData.points} 
              onChange={handleChange}
              className="form-input"
              min="0"
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label">用户名</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="form-label">名</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="flex-1">
              <label className="form-label">姓</label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="form-label">最后签到日期</label>
            <input 
              type="text" 
              name="last_sign_date" 
              value={formData.last_sign_date || '从未签到'} 
              readOnly
              className="form-input bg-light-1 cursor-not-allowed"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-outline"
            >
              取消
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 调整积分模态框
const AdjustPointsModal = ({ user, onClose, onSave }) => {
  const [pointsChange, setPointsChange] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pointsChange === 0) return;
    onSave(user.user_id, pointsChange);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">调整积分</h3>
          <button onClick={onClose} className="text-dark-2 hover:text-dark">
            <FiX size={20} />
          </button>
        </div>
        
        <p className="mb-4">
          用户: {user.display_name || user.username || '未知用户'}
          <br />
          当前积分: {user.points || 0}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="form-label">积分变动 (正数增加，负数减少)</label>
            <input 
              type="number" 
              value={pointsChange} 
              onChange={(e) => setPointsChange(Number(e.target.value))}
              className="form-input"
            />
            <p className="text-xs text-dark-2 mt-1">
              最终积分不会低于0
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-outline"
            >
              取消
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
            >
              确认调整
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 删除确认模态框
const DeleteConfirmModal = ({ user, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-2">确认删除</h3>
        <p className="text-dark-2 mb-6">
          您确定要删除用户 <span className="font-medium">{user.display_name || user.username || '未知用户'}</span> 吗？
          <br />
          此操作不可撤销。
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="btn btn-outline"
          >
            取消
          </button>
          <button 
            onClick={() => onConfirm(user.user_id)}
            className="btn btn-danger"
          >
            <FiTrash2 size={16} />
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Users() {
  const { data: users, mutate } = useSWR('/api/users');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [adjustingUser, setAdjustingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 过滤用户
  const filteredUsers = users 
    ? users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
          (user.display_name && user.display_name.toLowerCase().includes(search)) ||
          (user.username && user.username.toLowerCase().includes(search)) ||
          (user.first_name && user.first_name.toLowerCase().includes(search)) ||
          (user.last_name && user.last_name.toLowerCase().includes(search)) ||
          user.user_id.toString().includes(search)
        );
      })
    : [];

  // 保存用户编辑
  const handleSaveUser = async (userData) => {
    try {
      setLoading(true);
      await userAPI.update(userData);
      setMessage('用户更新成功');
      setEditingUser(null);
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('更新用户失败:', error);
      setMessage('更新用户失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 调整用户积分
  const handleAdjustPoints = async (userId, pointsChange) => {
    try {
      setLoading(true);
      await userAPI.adjustPoints(userId, pointsChange);
      setMessage('积分调整成功');
      setAdjustingUser(null);
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('调整积分失败:', error);
      setMessage('调整积分失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await userAPI.delete(userId);
      setMessage('用户删除成功');
      setDeletingUser(null);
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('删除用户失败:', error);
      setMessage('删除用户失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 关闭消息提示
  const closeMessage = () => setMessage('');

  if (!users) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <p className="text-dark-2">管理所有用户账户和积分</p>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
          message.includes('失败') ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
        }`}>
          <span>{message}</span>
          <button onClick={closeMessage} className="text-dark-2 hover:text-dark">
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="card mb-6">
        <div className="relative">
          <FiSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-2" />
          <input
            type="text"
            placeholder="搜索用户名称、ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* 用户列表 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">用户列表 ({filteredUsers.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">用户ID</th>
                <th className="table-header">显示名称</th>
                <th className="table-header">积分</th>
                <th className="table-header">最后签到</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.user_id} className="table-row">
                  <td className="table-cell">{user.user_id}</td>
                  <td className="table-cell">
                    {user.display_name || 
                     `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                     user.username || '未知用户'}
                  </td>
                  <td className="table-cell">{user.points || 0}</td>
                  <td className="table-cell">
                    {user.last_sign_date || '从未签到'}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setAdjustingUser(user)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded"
                        title="调整积分"
                      >
                        <FiDollarSign size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded"
                        title="编辑"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeletingUser(user)}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded"
                        title="删除"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-dark-2">
                    没有找到匹配的用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框 */}
      {editingUser && (
        <UserEditModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleSaveUser} 
        />
      )}
      
      {adjustingUser && (
        <AdjustPointsModal 
          user={adjustingUser} 
          onClose={() => setAdjustingUser(null)} 
          onSave={handleAdjustPoints} 
        />
      )}
      
      {deletingUser && (
        <DeleteConfirmModal 
          user={deletingUser} 
          onClose={() => setDeletingUser(null)} 
          onConfirm={handleDeleteUser} 
        />
      )}
      
      {/* 加载中遮罩 */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span>处理中...</span>
          </div>
        </div>
      )}
    </Layout>
  );
}
