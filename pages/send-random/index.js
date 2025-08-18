import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { FiSend, FiRefreshCw } from 'react-icons/fi';
import { teacherAPI } from '../../lib/api';

export default function SendRandomTeacher() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // 获取已批准的老师
  const fetchApprovedTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await teacherAPI.get('status=eq.approved');
      setTeachers(response.data);
      
      // 自动选择第一个老师
      if (response.data.length > 0) {
        setSelectedTeacher(response.data[0]);
      }
    } catch (error) {
      console.error('获取老师列表失败:', error);
      setMessage('获取老师列表失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoadingTeachers(false);
    }
  };

  // 选择随机老师
  const selectRandomTeacher = () => {
    if (teachers.length === 0) return;
    const randomIndex = Math.floor(Math.random() * teachers.length);
    setSelectedTeacher(teachers[randomIndex]);
  };

  // 发送老师信息到频道
  const sendTeacher = async () => {
    if (!selectedTeacher) {
      setMessage('请先选择一位老师');
      return;
    }

    try {
      setLoading(true);
      await teacherAPI.sendRandom();
      setMessage(`成功发送老师 "${selectedTeacher.nickname}" 到所有频道和群组`);
    } catch (error) {
      console.error('发送老师失败:', error);
      setMessage('发送失败: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取老师列表
  useState(() => {
    fetchApprovedTeachers();
  }, []);

  // 关闭消息提示
  const closeMessage = () => setMessage('');

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">发送随机老师</h1>
        <p className="text-dark-2">将随机选择的老师资料发送到所有频道和群组</p>
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
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-bold mb-4">选择要发送的老师</h2>
        
        {loadingTeachers ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="py-8 text-center text-dark-2">
            没有已批准的老师，请先在老师管理中批准老师
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              {teachers.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`px-4 py-2 rounded-lg text-sm border ${
                    selectedTeacher?.id === teacher.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-light-2 hover:border-primary hover:text-primary'
                  }`}
                >
                  {teacher.nickname}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={selectRandomTeacher}
                className="btn btn-outline"
              >
                <FiRefreshCw size={16} />
                随机选择
              </button>
              
              <button
                onClick={fetchApprovedTeachers}
                className="btn btn-outline"
              >
                <FiRefreshCw size={16} />
                刷新列表
              </button>
            </div>
          </>
        )}
      </div>

      {selectedTeacher && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold mb-4">将发送以下老师资料</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="space-y-4">
                <div>
                  <h4 className="text-dark-2 text-sm mb-1">基本信息</h4>
                  <div className="bg-light-1 rounded-lg p-3 space-y-2">
                    <p><span className="font-medium">花名:</span> {selectedTeacher.nickname}</p>
                    <p><span className="font-medium">年龄:</span> {selectedTeacher.age || '未填写'}</p>
                    <p><span className="font-medium">地区:</span> {selectedTeacher.region || '未填写'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-dark-2 text-sm mb-1">联系方式</h4>
                  <div className="bg-light-1 rounded-lg p-3 space-y-2">
                    <p><span className="font-medium">Telegram:</span> {selectedTeacher.telegram_account || '未填写'}</p>
                    <p><span className="font-medium">频道:</span> {selectedTeacher.channel || '未填写'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="mb-4">
                <h4 className="text-dark-2 text-sm mb-1">服务信息</h4>
                <div className="bg-light-1 rounded-lg p-3 space-y-2">
                  <p><span className="font-medium">服务类型:</span> {selectedTeacher.service_type || '未填写'}</p>
                  <p><span className="font-medium">修车费:</span> {selectedTeacher.repair_cost || '未填写'}</p>
                  <p><span className="font-medium">自我介绍:</span> {selectedTeacher.intro || '未填写'}</p>
                </div>
              </div>
              
              {selectedTeacher.photo_url_1 && (
                <div>
                  <h4 className="text-dark-2 text-sm mb-1">预览图片</h4>
                  <img 
                    src={selectedTeacher.photo_url_1} 
                    alt={`${selectedTeacher.nickname}的照片`}
                    className="w-full max-w-md rounded-lg border border-light-2 mt-2"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={sendTeacher}
          disabled={loading || !selectedTeacher}
          className="btn btn-primary text-lg px-8 py-3"
        >
          {loading ? (
            <>
              <FiRefreshCw size={18} className="animate-spin" />
              发送中...
            </>
          ) : (
            <>
              <FiSend size={18} />
              发送到所有频道和群组
            </>
          )}
        </button>
      </div>
    </Layout>
  );
}
