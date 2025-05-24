import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://virtual-study-room-backend.onrender.com',
});

export default axiosInstance;