// Frontend API client for PDR-26027 platform
// All API calls go through this service for consistent error handling

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || err.details || `Request failed: ${res.status}`);
  }

  return res.json();
}

// === TASKS ===

export async function fetchTasks(params?: { department?: string; status?: string; corridor_id?: string }) {
  const query = new URLSearchParams();
  if (params?.department && params.department !== 'ALL') query.set('department', params.department);
  if (params?.status) query.set('status', params.status);
  if (params?.corridor_id) query.set('corridor_id', params.corridor_id);
  const qs = query.toString();
  return request<any[]>(`/tasks${qs ? '?' + qs : ''}`);
}

export async function fetchTask(taskId: string) {
  return request<any>(`/tasks/${taskId}`);
}

export async function createTask(task: any) {
  return request<any>('/tasks', { method: 'POST', body: JSON.stringify(task) });
}

export async function updateTask(taskId: string, updates: any) {
  return request<any>(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deleteTask(taskId: string) {
  return request<any>(`/tasks/${taskId}`, { method: 'DELETE' });
}

export async function bulkUpdateTasks(updates: any[]) {
  return request<any[]>('/tasks/bulk-update', { method: 'POST', body: JSON.stringify({ updates }) });
}

// === CORRIDORS ===

export async function fetchCorridors() {
  return request<any[]>('/corridors');
}

export async function updateCorridor(corridorId: string, updates: any) {
  return request<any>(`/corridors/${corridorId}`, { method: 'PUT', body: JSON.stringify(updates) });
}

// === TRAINS ===

export async function fetchTrains(corridorId?: string) {
  const qs = corridorId ? `?corridor_id=${corridorId}` : '';
  return request<any[]>(`/trains${qs}`);
}

// === AUDIT LOGS ===

export async function fetchAuditLogs() {
  return request<any[]>('/audit-logs');
}

export async function createAuditLog(log: any) {
  return request<any>('/audit-logs', { method: 'POST', body: JSON.stringify(log) });
}

// === NOTIFICATIONS ===

export async function fetchNotifications() {
  return request<any[]>('/notifications');
}

export async function createNotification(notif: any) {
  return request<any>('/notifications', { method: 'POST', body: JSON.stringify(notif) });
}

export async function markNotificationRead(id: string) {
  return request<any>(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return request<any>('/notifications/read-all', { method: 'PUT' });
}

// === OPTIMIZATION ===

export async function runOptimization() {
  return request<{ tasks: any[]; conflicts: any[]; metrics: any }>('/optimize', { method: 'POST' });
}

export async function resolveConflict(conflictId: string) {
  return request<{ tasks: any[]; conflicts: any[] }>('/optimize/resolve-conflict', { method: 'POST', body: JSON.stringify({ conflict_id: conflictId }) });
}

// === AI COPILOT ===

export async function sendAiCopilotMessage(prompt: string, context: any) {
  return request<{ reply: string }>('/ai-copilot', { method: 'POST', body: JSON.stringify({ prompt, context }) });
}
