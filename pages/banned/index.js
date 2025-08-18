import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../../components/layout/Layout';
import { FiSearch, FiEdit, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import { bannedKeywordAPI } from '../../lib/api';

// 禁言词编辑/创建模态框
const BannedKeywordModal = ({ keyword, onClose, onSave, isNew }) => {
  const initialData = keyword || {
    keyword: ''
  };

  const [formData, setFormData] = useState(initialData);

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
          <h3 className="text-lg font-bold">{isNew ? '添加新禁言词' : '编辑禁言词'}</h3>
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
          
          <div className="mb-6">
            <label className="form-label">禁言词 *</label>
            <input 
              type="text" 
              name="keyword" 
              value={formData.keyword} 
              onChange={handleChange}
              className="form-input"
              required
              placeholder="用户发送包含此词将被禁言"
            />
            <p className="text-xs text-dark-2 mt-1">
              当用户发送的消息中包含此关键词时，将被自动禁言1小时
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
          您确定要删除禁言词 <span className="font-medium">{keyword.keyword}</span> 吗？
          <br />
          删除后，包含此词的消息将不会再触发禁言。
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

export default function BannedKeywords() {
  const { data: bannedKeywords, mutate } = useSWR('/api/banned');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [creatingKeyword, setCreatingKeyword] = useState(false);
  const [deletingKeyword, setDeletingKeyword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 过滤禁言词
  const filteredKeywords = bannedKeywords 
    ? bannedKeywords.filter(keyword => 
        searchTerm === '' || keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // 保存禁言词
  const handleSaveKeyword = async (keywordData) => {
    try {
      setLoading(true);
      if (keywordData.id) {
        await bannedKeywordAPI.update(keywordData);
        setMessage('禁言词更新成功');
        setEditingKeyword(null);
      } else {
        await bannedKeywordAPI.create(keywordData);
        setMessage('新禁言词添加成功');
        setCreatingKeyword(false);
      }
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('保存禁言词失败:', error);
      setMessage('操作失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 删除禁言词
  const handleDeleteKeyword = async (id) => {
    try {
      setLoading(true);
      await bannedKeywordAPI.delete(id);
      setMessage('禁言词删除成功');
      setDeletingKeyword(null);
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('删除禁言词失败:', error);
      setMessage('删除失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 关闭消息提示
  const closeMessage = () => setMessage('');

  if (!bannedKeywords) {
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
        <h1 className="text-2xl font-bold">禁言词管理</h1>
        <p className="text-dark-2">管理会触发自动禁言的敏感词</p>
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

      {/* 搜索和添加栏 */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <FiSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-2" />
            <input
              type="text"
              placeholder="搜索禁言词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => setCreatingKeyword(true)}
              className="btn btn-primary w-full"
            >
              <FiPlusCircle size={16} />
              添加新禁言词
            </button>
          </div>
        </div>
      </div>

      {/* 禁言词列表 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">禁言词列表 ({filteredKeywords.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">禁言词</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.map(keyword => (
                <tr key={keyword.id} className="table-row">
                  <td className="table-cell">{keyword.id}</td>
                  <td className="table-cell font-medium">{keyword.keyword}</td>
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
                  <td colSpan="3" className="py-8 text-center text-dark-2">
                    没有找到匹配的禁言词
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框 */}
      {editingKeyword && (
        <BannedKeywordModal 
          keyword={editingKeyword} 
          onClose={() => setEditingKeyword(null)} 
          onSave={handleSaveKeyword} 
          isNew={false}
        />
      )}
      
      {creatingKeyword && (
        <BannedKeywordModal 
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
