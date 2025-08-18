import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../../components/layout/Layout';
import { FiSearch, FiEdit, FiTrash2, FiPlusCircle, FiImage, FiVideo } from 'react-icons/fi';
import { teacherAPI } from '../../lib/api';

// 老师编辑/创建模态框
const TeacherModal = ({ teacher, onClose, onSave, isNew }) => {
  const initialData = teacher || {
    nickname: '',
    age: '',
    region: '',
    telegram_account: '',
    channel: '',
    service_type: '',
    repair_cost: '',
    intro: '',
    photo_url_1: '',
    photo_url_2: '',
    photo_url_3: '',
    video_url: '',
    status: 'pending'
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
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{isNew ? '添加新老师' : '编辑老师信息'}</h3>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">花名 *</label>
              <input 
                type="text" 
                name="nickname" 
                value={formData.nickname} 
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="form-label">年龄</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="form-label">地区</label>
            <input 
              type="text" 
              name="region" 
              value={formData.region} 
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Telegram账号</label>
              <input 
                type="text" 
                name="telegram_account" 
                value={formData.telegram_account} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">频道链接</label>
              <input 
                type="text" 
                name="channel" 
                value={formData.channel} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">服务类型</label>
              <input 
                type="text" 
                name="service_type" 
                value={formData.service_type} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">修车费</label>
              <input 
                type="text" 
                name="repair_cost" 
                value={formData.repair_cost} 
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="form-label">自我介绍</label>
            <textarea 
              name="intro" 
              value={formData.intro} 
              onChange={handleChange}
              className="form-input min-h-[100px]"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="form-label">状态</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="form-input"
            >
              <option value="pending">待审核</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="form-label block mb-3">照片URLs (最多3张)</label>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <FiImage size={18} className="text-dark-2 mt-2.5" />
                <input 
                  type="url" 
                  name="photo_url_1" 
                  value={formData.photo_url_1 || ''} 
                  onChange={handleChange}
                  placeholder="照片1 URL"
                  className="form-input"
                />
              </div>
              
              <div className="flex gap-2">
                <FiImage size={18} className="text-dark-2 mt-2.5" />
                <input 
                  type="url" 
                  name="photo_url_2" 
                  value={formData.photo_url_2 || ''} 
                  onChange={handleChange}
                  placeholder="照片2 URL"
                  className="form-input"
                />
              </div>
              
              <div className="flex gap-2">
                <FiImage size={18} className="text-dark-2 mt-2.5" />
                <input 
                  type="url" 
                  name="photo_url_3" 
                  value={formData.photo_url_3 || ''} 
                  onChange={handleChange}
                  placeholder="照片3 URL"
                  className="form-input"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="form-label">视频URL</label>
            <div className="flex gap-2">
              <FiVideo size={18} className="text-dark-2 mt-2.5" />
              <input 
                type="url" 
                name="video_url" 
                value={formData.video_url || ''} 
                onChange={handleChange}
                placeholder="视频URL"
                className="form-input"
              />
            </div>
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

// 查看老师详情
const TeacherDetailModal = ({ teacher, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{teacher.nickname} 的详细信息</h3>
          <button onClick={onClose} className="text-dark-2 hover:text-dark">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧信息 */}
          <div className="md:col-span-1">
            <div className="space-y-4">
              <div>
                <h4 className="text-dark-2 text-sm mb-1">基本信息</h4>
                <div className="bg-light-1 rounded-lg p-3 space-y-2">
                  <p><span className="font-medium">ID:</span> {teacher.id}</p>
                  <p><span className="font-medium">花名:</span> {teacher.nickname}</p>
                  <p><span className="font-medium">年龄:</span> {teacher.age || '未填写'}</p>
                  <p><span className="font-medium">地区:</span> {teacher.region || '未填写'}</p>
                  <p><span className="font-medium">状态:</span> 
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      teacher.status === 'approved' ? 'bg-success/20 text-success' :
                      teacher.status === 'pending' ? 'bg-warning/20 text-warning' :
                      'bg-danger/20 text-danger'
                    }`}>
                      {teacher.status === 'approved' ? '已批准' :
                       teacher.status === 'pending' ? '待审核' : '已拒绝'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-dark-2 text-sm mb-1">联系方式</h4>
                <div className="bg-light-1 rounded-lg p-3 space-y-2">
                  <p><span className="font-medium">Telegram:</span> {teacher.telegram_account || '未填写'}</p>
                  <p><span className="font-medium">频道:</span> {teacher.channel ? 
                    <a href={teacher.channel} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      查看频道
                    </a> : '未填写'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-dark-2 text-sm mb-1">服务信息</h4>
                <div className="bg-light-1 rounded-lg p-3 space-y-2">
                  <p><span className="font-medium">服务类型:</span> {teacher.service_type || '未填写'}</p>
                  <p><span className="font-medium">修车费:</span> {teacher.repair_cost || '未填写'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧内容 */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h4 className="text-dark-2 text-sm mb-1">自我介绍</h4>
              <div className="bg-light-1 rounded-lg p-3 min-h-[100px]">
                {teacher.intro || '未填写自我介绍'}
              </div>
            </div>
            
            {teacher.photo_url_1 || teacher.photo_url_2 || teacher.photo_url_3 || teacher.video_url ? (
              <div>
                <h4 className="text-dark-2 text-sm mb-1">媒体内容</h4>
                <div className="space-y-4 mt-2">
                  {/* 照片 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {teacher.photo_url_1 && (
                      <div className="rounded-lg overflow-hidden border border-light-2">
                        <img 
                          src={teacher.photo_url_1} 
                          alt={`${teacher.nickname}的照片`}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {teacher.photo_url_2 && (
                      <div className="rounded-lg overflow-hidden border border-light-2">
                        <img 
                          src={teacher.photo_url_2} 
                          alt={`${teacher.nickname}的照片`}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {teacher.photo_url_3 && (
                      <div className="rounded-lg overflow-hidden border border-light-2">
                        <img 
                          src={teacher.photo_url_3} 
                          alt={`${teacher.nickname}的照片`}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* 视频 */}
                  {teacher.video_url && (
                    <div className="rounded-lg overflow-hidden border border-light-2">
                      <video 
                        src={teacher.video_url} 
                        controls
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-light-1 rounded-lg p-4 text-center text-dark-2">
                没有媒体内容
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 删除确认模态框
const DeleteConfirmModal = ({ teacher, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-2">确认删除</h3>
        <p className="text-dark-2 mb-6">
          您确定要删除老师 <span className="font-medium">{teacher.nickname}</span> 吗？
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
            onClick={() => onConfirm(teacher.id)}
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

export default function Teachers() {
  const { data: teachers, mutate } = useSWR('/api/teachers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 过滤老师
  const filteredTeachers = teachers 
    ? teachers.filter(teacher => {
        const matchesSearch = searchTerm === '' || 
          (teacher.nickname && teacher.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (teacher.region && teacher.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (teacher.service_type && teacher.service_type.toLowerCase().includes(searchTerm.toLowerCase()));
          
        const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // 保存老师信息
  const handleSaveTeacher = async (teacherData) => {
    try {
      setLoading(true);
      if (teacherData.id) {
        await teacherAPI.update(teacherData);
        setMessage('老师信息更新成功');
        setEditingTeacher(null);
      } else {
        await teacherAPI.create(teacherData);
        setMessage('新老师添加成功');
        setCreatingTeacher(false);
      }
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('保存老师信息失败:', error);
      setMessage('操作失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 删除老师
  const handleDeleteTeacher = async (id) => {
    try {
      setLoading(true);
      await teacherAPI.delete(id);
      setMessage('老师信息删除成功');
      setDeletingTeacher(null);
      mutate(); // 重新获取数据
    } catch (error) {
      console.error('删除老师失败:', error);
      setMessage('删除失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 关闭消息提示
  const closeMessage = () => setMessage('');

  if (!teachers) {
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
        <h1 className="text-2xl font-bold">老师管理</h1>
        <p className="text-dark-2">管理所有老师信息和资料</p>
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
              placeholder="搜索花名、地区、服务类型..."
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
              <option value="pending">待审核</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={() => setCreatingTeacher(true)}
              className="btn btn-primary w-full"
            >
              <FiPlusCircle size={16} />
              添加新老师
            </button>
          </div>
        </div>
      </div>

      {/* 老师列表 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">老师列表 ({filteredTeachers.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">花名</th>
                <th className="table-header">年龄</th>
                <th className="table-header">地区</th>
                <th className="table-header">服务类型</th>
                <th className="table-header">状态</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="table-row">
                  <td className="table-cell">{teacher.id}</td>
                  <td className="table-cell">{teacher.nickname}</td>
                  <td className="table-cell">{teacher.age || '-'}</td>
                  <td className="table-cell">{teacher.region || '-'}</td>
                  <td className="table-cell">{teacher.service_type || '-'}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      teacher.status === 'approved' ? 'bg-success/20 text-success' :
                      teacher.status === 'pending' ? 'bg-warning/20 text-warning' :
                      'bg-danger/20 text-danger'
                    }`}>
                      {teacher.status === 'approved' ? '已批准' :
                       teacher.status === 'pending' ? '待审核' : '已拒绝'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setViewingTeacher(teacher)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded"
                        title="查看详情"
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingTeacher(teacher)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded"
                        title="编辑"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeletingTeacher(teacher)}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded"
                        title="删除"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-dark-2">
                    没有找到匹配的老师
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模态框 */}
      {editingTeacher && (
        <TeacherModal 
          teacher={editingTeacher} 
          onClose={() => setEditingTeacher(null)} 
          onSave={handleSaveTeacher} 
          isNew={false}
        />
      )}
      
      {creatingTeacher && (
        <TeacherModal 
          onClose={() => setCreatingTeacher(false)} 
          onSave={handleSaveTeacher} 
          isNew={true}
        />
      )}
      
      {viewingTeacher && (
        <TeacherDetailModal 
          teacher={viewingTeacher} 
          onClose={() => setViewingTeacher(null)} 
        />
      )}
      
      {deletingTeacher && (
        <DeleteConfirmModal 
          teacher={deletingTeacher} 
          onClose={() => setDeletingTeacher(null)} 
          onConfirm={handleDeleteTeacher} 
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
