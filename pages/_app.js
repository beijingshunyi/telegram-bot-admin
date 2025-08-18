import '../styles/globals.css';
import { SWRConfig } from 'swr';
import axios from 'axios';

// SWR配置
const fetcher = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'Admin-Key': '9712202273aA.'
      }
    });
    return response.data;
  } catch (error) {
    console.error('请求错误:', error);
    throw error;
  }
};

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: false }}>
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
