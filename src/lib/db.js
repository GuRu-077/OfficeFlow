/**
 * OfficeFlow API Client
 *
 * Points to the standalone Express backend (http://localhost:4000) by default.
 * The backend must be started separately with: npm run backend
 *
 * To switch back to Next.js built-in API routes, set NEXT_PUBLIC_API_URL="" (empty).
 */

const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
    : 'http://localhost:4000';

async function fetchApi(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // send cookies for auth_token
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    const error = new Error(json.error || 'API Request failed');
    error.details = json.details;
    error.alternatives = json.alternatives;
    throw error;
  }
  return json.data;
}

export const db = {
  async login(email, password) {
    return fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  async getUsers() {
    return fetchApi('/api/users');
  },
  async getRooms() {
    return fetchApi('/api/rooms');
  },
  async getResources() {
    return fetchApi('/api/resources');
  },
  async getMeetings() {
    return fetchApi('/api/meetings');
  },
  async createMeeting(meeting) {
    return fetchApi('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(meeting),
    });
  },
  async updateMeeting(id, updates) {
    return fetchApi(`/api/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async getNotifications(userId) {
    return fetchApi(`/api/users/${userId}/notifications`);
  },

  // Rooms CRUD
  async createRoom(room) {
    return fetchApi('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    });
  },
  async updateRoom(id, updates) {
    return fetchApi(`/api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteRoom(id) {
    return fetchApi(`/api/rooms/${id}`, { method: 'DELETE' });
  },

  // Resources CRUD
  async createResource(resource) {
    return fetchApi('/api/resources', {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  },
  async updateResource(id, updates) {
    return fetchApi(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  async deleteResource(id) {
    return fetchApi(`/api/resources/${id}`, { method: 'DELETE' });
  },
};
