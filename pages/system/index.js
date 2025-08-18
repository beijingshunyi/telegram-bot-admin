import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { FiCheckCircle, FiXCircle, FiDatabase, FiServer, FiClock } from 'react-icons/fi';
import { systemAPI } from '../../lib/api';

// 状态卡片组件
const StatusCard = ({ title, status, icon, details }) => (
  <div className="card">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <div className={`flex items-center gap-1.5 ${
          status === 'ok' ? 'text-success' : 'text-danger'
        }`}>
          {status === 'ok' ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
          <span>{status === 'ok' ? '正常' : '异常'}</span>
        </div>
        {details && (
          <p className="text-sm text-dark-2 mt-2">{details}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${
        status === 'ok' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
      }`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function SystemStatus() {
  const [dbStatus, setDbStatus] = useState('checking');
  const [dbDetails, setDbDetails] = useState('正在检查数据库连接...');
  const [lastChecked, setLastChecked] = useState(null);
  const [loading, setLoading] = useState(false);

  // 测试数据库连接
  const testDatabase = async () => {
    try {
      setLoading(true);
      setDbStatus('checking');
      setDbDetails('正在检查数据库连接...');
      
      const response = await systemAPI.testDB();
      const now = new Date();
      setLastChecked(now.toLocaleString());
      
      if (response.data.status === 'success') {
        setDbStatus('ok');
        setDbDetails(`连接成功，当前用户数: ${response.data.users_count}`);
      } else {
        setDbStatus('error');
        setDbDetails(`连接失败: ${response.data.message}`);
      }
    } catch (error) {
      const now = new Date();
      setLastChecked(now.toLocaleString());
      setDbStatus('error');
      setDbDetails(`连接失败: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时检查数据库
  useEffect(() => {
    testDatabase();
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">系统状态</h1>
        <p className="text-dark-2">查看系统各组件的运行状态</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatusCard 
          title="数据库连接"
          status={dbStatus}
          details={dbDetails}
          icon={<FiDatabase size={24} />}
        />
        <StatusCard 
          title="后端服务"
          status="ok"
          details="Cloudflare Worker 运行正常"
          icon={<FiServer size={24} />}
        />
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">系统信息</h2>
          <div className="text-sm text-dark-2 flex items-center gap-1">
            <FiClock size={14} />
            最后检查: {lastChecked || '未检查'}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-light-1">
            <