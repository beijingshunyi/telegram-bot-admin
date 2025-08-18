import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../../components/layout/Layout';
import { FiSearch, FiEdit, FiTrash2, FiPlusCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { keywordAPI } from '../../lib/api';

// 关键词编辑/创建模态框
const KeywordModal = ({ keyword, onClose, onSave, isNew }) => {
  const initialData = keyword || {
    keyword: '',
    response: '',
    is_active: true
  };

  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{isNew ? '添加新关键词' : '编辑关键词'}</h3>
          <button onClick={onClose} className="text-dark-2 hover:text-dark">
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isNew && (
            <div className="mb-4">
              <label className="form-label">ID</label>
              <input 
                type="text" 
                name="id" 
                value={formData.id || ''} 
                readOnly
                className="form-input bg-light-1 cursor-not-allowed"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="form-label">关键词 *</label>
            <input 
              type="text" 
              name="keyword" 
              value={formData.keyword} 
              onChange={handleChange}
              className="form-input"
              required
              placeholder="用户发送的关键词"
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label">回复内容 *</label>
            <textarea 
              name="response" 
              value={formData.response} 
              onChange={handleChange}
              className="form-input min-h-[150px]"
              required
              placeholder="收到关键词后回复的内容"
            ></textarea>
          </div>
          
          <div className="mb-6 flex items-center gap-2">
            <input 
              type="checkbox" 
              id="is_active"
              name="is_active" 
              checked={formData.is_active} 
              onChange={handleChange}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="font-medium">
              启用这个关键词回复
            </label>
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
              {isNew ? '添加' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 删除确认模态框
const DeleteConfirmModal = ({ keyword, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-2">确认删除</h3>
        <p className="text-dark-2 mb-6">
          您确定要删除关键词 <span className="font-medium">{keyword.keyword}</span> 吗？
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
            onClick={() => onConfirm(keyword.id)}
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

export default function Keywords() {
  const { data: keywords, mutate } = useSWR('/api/keywords');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [creatingKeyword, setCreatingKeyword] = useState(false);
  const [deletingKeyword, setDeletingKeyword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 过滤关键词
  const filteredKeywords = keywords 
    ? keywords.filter(keyword => {
        const matchesSearch = searchTerm === '' || 
          keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
          keyword.response.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'active' && keyword.is_active) ||
          (statusFilter === 'inactive' && !keyword.is_active);
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // 保存关键词
  const handleSaveKeyword = async (keywordData) => {
    try {
      setLoading(true);
      if (keywordData.id) {
        await keywordAPI.update(keywordData);
        setMessage('关键词更新成功');
        setEditingKeyword(null);
      } else {
        await keywordAPI.create(keywordData);
        setMessage('新关键词添加成功');
        setCreatingKeyword(false);
      }
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('保存关键词失败:', error);
      setMessage('操作失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 删除关键词
  const handleDeleteKeyword = async (id) => {
    try {
      setLoading(true);
      await keywordAPI.delete(id);
      setMessage('关键词删除成功');
      setDeletingKeyword(null);
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('删除关键词失败:', error);
      setMessage('删除失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 切换关键词状态
  const toggleKeywordStatus = async (keyword) => {
    try {
      setLoading(true);
      const updatedKeyword = {
        ...keyword,
        is_active: !keyword.is_active
      };
      await keywordAPI.update(updatedKeyword);
      setMessage(`关键词已${updatedKeyword.is_active ? '启用' : '禁用'}`);
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('切换关键词状态失败:', error);
      setMessage('操作失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 关闭消息提示
  const closeMessage = () => setMessage('');

  if (!keywords) {
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
        <h1 className="text-2xl font-bold">关键词回复管理</h1>
        <p className="text-dark-2">管理自动回复的关键词和内容</p>
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

      {/* 搜索和筛选栏 */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-2" />
            <input
              type="text"
              placeholder="搜索关键词或回复内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          
          <div>
            <label className="form-label">状态筛选</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">所有状态</option>
              <option value="active">已启用</option>
              <option value="inactive">已禁用</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => setCreatingKeyword(true)}
              className="btn btn-primary w-full"
            >
              <FiPlusCircle size={16} />
              添加新关键词
            </button>
          </div>
        </div>
      </div>

      {/* 关键词列表 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">关键词列表 ({filteredKeywords.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">关键词</th>
                <th className="table-header">回复内容</th>
                <th className="table-header">状态</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map(keyword => (
                <tr key={keyword.id} className="table-row">
                  <td className="table-cell">{keyword.id}</td>
                  <td className="table-cell font-medium">{keyword.keyword}</td>
                  <td className="table-cell max-w-xs truncate">
                    {keyword.response.length > 50 
                      ? `${keyword.response.substring(0, 50)}...` 
                      : keyword.response}
                  </td>
                  <td className="table-cell">
                    <button 
                      onClick={() => toggleKeywordStatus(keyword)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm ${
                        keyword.is_active 
                          ? 'bg-success/20 text-success hover:bg-success/30' 
                          : 'bg-dark-2/20 text-dark-2 hover:bg-dark-2/30'
                      }`}
                    >
                      {keyword.is_active ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                      {keyword.is_active ? '已启用' : '已禁用'}
                    </button>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingKeyword(keyword)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded"
                        title="编辑"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeletingKeyword(keyword)}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded"
                        title="删除"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredKeywords.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-dark-2">
                    没有找到匹配的关键词
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框 */}
      {editingKeyword && (
        <KeywordModal 
          keyword={editingKeyword} 
          onClose={() => setEditingKeyword(null)} 
          onSave={handleSaveKeyword} 
          isNew={false}
        />
      )}
      
      {creatingKeyword && (
        <KeywordModal 
          onClose={() => setCreatingKeyword(false)} 
          onSave={handleSaveKeyword} 
          isNew={true}
        />
      )}
      
      {deletingKeyword && (
        <DeleteConfirmModal 
          keyword={deletingKeyword} 
          onClose={() => setDeletingKeyword(null)} 
          onConfirm={handleDeleteKeyword} 
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
