import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const client = axios.create({ baseURL: API_URL });

// The store is injected from app/store.js to avoid a circular import
let store;
export const injectStore = (s) => { store = s; };

// Send the JWT with every request
client.interceptors.request.use((config) => {
  const token = store?.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired / invalid token -> log out so the user is sent back to the login page
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && store?.getState().auth.token) {
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(err);
  }
);

// Turn an axios error into a readable message
export const errorMessage = (err) =>
  err.response?.data?.message ||
  (err.request && !err.response ? 'Cannot reach the server. Please try again in a moment.' : err.message);

export default client;
