import axios from 'axios';

const api = axios.create({
  baseURL: "https//api.capt.today",
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