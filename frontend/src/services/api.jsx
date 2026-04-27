import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  register: (name, email, password) => API.post('/auth/register', { name, email, password }),
  login: (email, password) => API.post('/auth/login', { email, password }),
  me: () => API.get('/auth/me'),
};

export const financeService = {
  analyze: ({ monthlyIncome, monthlyExpenses, loans }) => API.post('/finance/analyze', { monthlyIncome, monthlyExpenses, loans }),
};

export const loanService = {
  simulate: (loan, whatIf) => API.post('/loan/simulate', { loan, whatIf }),
};

export const assistantService = {
  chat: (payload) => API.post('/assistant/chat', payload),
};

export default API;
