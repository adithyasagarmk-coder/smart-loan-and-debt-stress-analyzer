import axios from "axios";

/**
 * Base Axios instance
 * Uses VITE_API_URL from .env
 * Example:
 * VITE_API_URL=https://smart-loan-analyzer-backend.onrender.com/api
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // IMPORTANT: JWT via headers, not cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
API.interceptors.response.use(
  (response) => {
    console.log('API Success Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
        message: error.response.data?.message,
      });
    } else if (error.request) {
      console.error('No response received:', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  me: () => API.get("/auth/me"),
};

// ================= HEALTH CHECK =================
export const healthAPI = {
  check: () => API.get("/health"),
};

// ================= DASHBOARD =================
export const dashboardService = {
  getData: () => API.get("/dashboard"),
  updateFinancialInfo: (data) =>
    API.put("/dashboard/financial-info", data),
};

// ================= LOANS =================
export const loanService = {
  getLoans: () => API.get("/loan"),
  create: (data) => API.post("/loan", data),
  update: (id, data) => API.put(`/loan/${id}`, data),
  delete: (id) => API.delete(`/loan/${id}`),
  simulate: (loan, whatIf) =>
    API.post("/loan/simulate", { loan, whatIf }),
};

// ================= FINANCE =================
export const financeService = {
  analyze: ({ monthlyIncome, monthlyExpenses, loans }) =>
    API.post("/finance/analyze", { monthlyIncome, monthlyExpenses, loans }),
  stressTrend: () => API.get("/finance/stress-trend"),
};

// ================= STRESS =================
export const stressService = {
  analyze: (data) => API.post("/stress/analyze", data),
};

// ================= AI ASSISTANT =================
export const assistantService = {
  chat: (payload) => API.post("/assistant/chat", payload),
};

// ================= ADMIN =================
export const adminService = {
  getUsers: () => API.get("/admin/users"),
  getLoans: () => API.get("/admin/loans"),
};

// ================= DOCUMENTS =================
export const documentService = {
  getDocuments: () => API.get("/documents"),
  uploadDocument: (data) => API.post("/documents/upload", data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (id) => API.delete(`/documents/${id}`),
  downloadDocument: (id) => API.get(`/documents/${id}/download`, { responseType: 'blob' })
};

// ================= SUGGESTIONS / OFFERS =================
export const suggestionsService = {
  get: (data) => API.post("/suggestions/get", data),
};

export default API;
