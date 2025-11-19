import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// api.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore.getState().token;
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default api;