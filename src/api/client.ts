// FOXE AI AGENT — Typed Backend Client

export async function fetchAuthSession() {
  const res = await fetch('/api/auth/session');
  if (!res.ok) throw new Error('Failed to fetch auth session');
  return res.json();
}

export async function setAuthSession(data: { email: string; fullName?: string; avatarUrl?: string; accessToken?: string }) {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to set auth session');
  return res.json();
}

export async function logoutAuthSession() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to log out session');
  return res.json();
}

export async function cancelTask(id: string) {
  const res = await fetch(`/api/tasks/${id}/cancel`, { method: 'POST' });
  return res.json();
}

export async function disconnectApp(id: string) {
  const res = await fetch(`/api/connected-apps/${id}/disconnect`, { method: 'POST' });
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch('/api/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchConversations() {
  const res = await fetch('/api/conversations');
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function sendChatMessage(content: string, conversationId?: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, conversationId }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function sendFeedback(messageId: string, rating: 'like' | 'dislike') {
  await fetch('/api/chat/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId, rating }),
  });
}

export async function fetchTasks() {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(title: string, instruction: string, assignedAgent: string) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, instruction, assignedAgent }),
  });
  return res.json();
}

export async function pauseTask(id: string) {
  const res = await fetch(`/api/tasks/${id}/pause`, { method: 'POST' });
  return res.json();
}

export async function resumeTask(id: string) {
  const res = await fetch(`/api/tasks/${id}/resume`, { method: 'POST' });
  return res.json();
}

export async function retryTask(id: string) {
  const res = await fetch(`/api/tasks/${id}/retry`, { method: 'POST' });
  return res.json();
}

export async function deleteTask(id: string) {
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
}

export async function fetchBrowserSession() {
  const res = await fetch('/api/browser');
  return res.json();
}

export async function navigateBrowser(url: string) {
  const res = await fetch('/api/browser/navigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function toggleBrowserControl(interactiveMode: boolean) {
  const res = await fetch('/api/browser/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interactiveMode }),
  });
  return res.json();
}

export async function fetchConnectedApps() {
  const res = await fetch('/api/connected-apps');
  return res.json();
}

export async function toggleApp(id: string) {
  const res = await fetch(`/api/connected-apps/${id}/toggle`, { method: 'POST' });
  return res.json();
}

export async function syncApp(id: string) {
  const res = await fetch(`/api/connected-apps/${id}/sync`, { method: 'POST' });
  return res.json();
}

export async function testAppConnection(id: string) {
  const res = await fetch(`/api/connected-apps/${id}/test`, { method: 'POST' });
  return res.json();
}

export async function fetchAutomations() {
  const res = await fetch('/api/automations');
  return res.json();
}

export async function createAutomation(name: string, instruction: string, frequency: string, targetApp: string) {
  const res = await fetch('/api/automations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, instruction, frequency, targetApp }),
  });
  return res.json();
}

export async function toggleAutomation(id: string) {
  const res = await fetch(`/api/automations/${id}/toggle`, { method: 'POST' });
  return res.json();
}

export async function runAutomation(id: string) {
  const res = await fetch(`/api/automations/${id}/run`, { method: 'POST' });
  return res.json();
}

export async function deleteAutomation(id: string) {
  await fetch(`/api/automations/${id}`, { method: 'DELETE' });
}

export async function fetchMemories() {
  const res = await fetch('/api/memory');
  return res.json();
}

export async function addMemory(category: string, key: string, value: string) {
  const res = await fetch('/api/memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, key, value }),
  });
  return res.json();
}

export async function deleteMemory(id: string) {
  await fetch(`/api/memory/${id}`, { method: 'DELETE' });
}

export async function fetchFiles() {
  const res = await fetch('/api/files');
  return res.json();
}

export async function addFile(filename: string, fileType: string, size: number, content: string) {
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, fileType, size, content }),
  });
  return res.json();
}

export async function renameFile(id: string, filename: string) {
  const res = await fetch(`/api/files/${id}/rename`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
  return res.json();
}

export async function deleteFile(id: string) {
  await fetch(`/api/files/${id}`, { method: 'DELETE' });
}

export async function fetchNotifications() {
  const res = await fetch('/api/notifications');
  return res.json();
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  return res.json();
}

export async function markAllNotificationsRead() {
  await fetch('/api/notifications/read-all', { method: 'POST' });
}

export async function deleteNotification(id: string) {
  await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
}

export async function fetchDevices() {
  const res = await fetch('/api/devices');
  return res.json();
}

export async function toggleDeviceAutomation(id: string) {
  const res = await fetch(`/api/devices/${id}/toggle`, { method: 'POST' });
  return res.json();
}

export async function fetchSecurity() {
  const res = await fetch('/api/security');
  return res.json();
}

export async function approveSecurityAction(id: string) {
  const res = await fetch(`/api/security/approve/${id}`, { method: 'POST' });
  return res.json();
}

export async function rejectSecurityAction(id: string) {
  const res = await fetch(`/api/security/reject/${id}`, { method: 'POST' });
  return res.json();
}

export async function fetchActivityHistory() {
  const res = await fetch('/api/history');
  return res.json();
}

export async function clearActivityHistory() {
  await fetch('/api/history/clear', { method: 'DELETE' });
}

export async function fetchWorkspace() {
  const res = await fetch('/api/workspace');
  return res.json();
}

export async function updateWorkspaceStatus(status: string) {
  const res = await fetch('/api/workspace/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function fetchProfile() {
  const res = await fetch('/api/profile');
  return res.json();
}

export async function updateProfile(data: any) {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function sendDirectEmail(data: {
  from?: string;
  to: string;
  subject?: string;
  message: string;
  accessToken?: string;
}) {
  const res = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Email dispatch failed with HTTP ${res.status}`);
  }
  return res.json();
}
