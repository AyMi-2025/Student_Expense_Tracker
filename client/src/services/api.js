const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('campus_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Unauthorized / token expired
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  // Handle CSV export or binary responses if needed
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.text();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Expenses
  getExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/expenses${query ? `?${query}` : ''}`);
  },
  getCategories: () => request('/expenses/categories'),
  createExpense: (body) => request('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  updateExpense: (id, body) => request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
  exportCsvUrl: () => `${API_BASE}/expenses/export/csv`,

  // Analytics & Stats
  getStatsSummary: () => request('/stats/summary'),

  // System & LAN Mobile helper
  getNetworkIp: () => request('/network-ip'),
};
