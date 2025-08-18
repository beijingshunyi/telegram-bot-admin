import Layout from '../components/layout/Layout';
import { useState } from 'react';
import { sendRandomTeacher } from '../lib/api';
import { FaRobot, FaSend, FaSyncAlt } from 'react-icons/fa';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendRandom = async () => {
    try {
      setLoading(true);
      setMessage('正在发送随机老师推荐...');
      await sendRandomTeacher();
      setMessage('随机老师推荐已成功发送！');
    } catch (err) {
      setMessage('发送失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Telegram北京修车超级机器人管理后台</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          欢迎使用管理后台，在这里你可以管理用户、老师信息、关键词和禁言词。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaRobot className="text-2xl text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">机器人操作</h2>
          <p className="text-gray-600 mb-4">发送随机老师推荐到所有频道和群组</p>
          <button
            onClick={handleSendRandom}
            disabled={loading}
            className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <FaSyncAlt className="mr-2 animate-spin" />
                发送中...
              </>
            ) : (
              <>
                <FaSend className="mr-2" />
                发送随机老师
              </>
            )}
          </button>
          {message && (
            <div className="mt-4 p-3 rounded bg-gray-100">
              {message}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">使用指南</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>使用左侧菜单导航到不同管理功能</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>在用户管理中可以调整用户积分</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>在老师管理中可以添加新老师信息</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>设置关键词可以自动回复用户消息</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
