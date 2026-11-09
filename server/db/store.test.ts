import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './store';

test('DatabaseStore initializes default user, tasks, and connected apps', () => {
  const user = db.getUser();
  assert.ok(user, 'User must exist');
  assert.ok(user.role, 'User role must exist');

  const metrics = db.getDashboardMetrics();
  assert.ok(typeof metrics.activeTasks === 'number');
  assert.ok(typeof metrics.connectedAppsCount === 'number');
  assert.ok(metrics.connectedAppsCount >= 2, 'Should have connected apps seeded');
});

test('Task creation and state transition works end-to-end', () => {
  const task = db.createTask('Test Flight Radar', 'Track flight deals', 'Browser Agent');
  assert.equal(task.title, 'Test Flight Radar');
  assert.equal(task.status, 'RUNNING');
  assert.equal(task.steps.length, 1);

  const updated = db.updateTaskStatus(task.id, 'COMPLETED', 100, { success: true });
  assert.ok(updated);
  assert.equal(updated.status, 'COMPLETED');
  assert.equal(updated.progressPercent, 100);
});

test('Security Sentinel approval updates task and logs to audit trail', () => {
  const task = db.createTask('Test Cancellation', 'Cancel gym fee', 'Security Sentinel');
  db.data.approvals.unshift({
    id: `appr-test-1`,
    userId: 'user-foxe-001',
    taskId: task.id,
    title: 'Approve Cancellation',
    actionType: 'external_api',
    summary: 'Cancel monthly fee',
    details: {},
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  });

  const approved = db.decideApproval('appr-test-1', 'APPROVED');
  assert.ok(approved);
  assert.equal(approved.status, 'APPROVED');

  const taskAfter = db.getTaskById(task.id);
  assert.ok(taskAfter);
  assert.equal(taskAfter.status, 'COMPLETED');

  const logs = db.getAuditLogs();
  assert.ok(logs.some((l) => l.action === 'APPROVAL_GRANTED'));
});

test('Automations can be created, toggled, and executed', () => {
  const auto = db.createAutomation('Daily Meeting Summary', 'Summarize calendar', 'Daily at 9 AM', 'Google Calendar');
  assert.equal(auto.name, 'Daily Meeting Summary');
  assert.equal(auto.isActive, true);

  const toggled = db.toggleAutomation(auto.id);
  assert.equal(toggled?.isActive, false);

  const ran = db.runAutomation(auto.id);
  assert.ok(ran?.executionHistory.length! > 0);
  assert.equal(ran?.executionHistory[0].status, 'SUCCESS');
});

test('Memory management correctly persists and deletes items', () => {
  const mem = db.addMemory('preference', 'Seat Choice', 'Window 14A');
  assert.equal(mem.key, 'Seat Choice');

  const found = db.getMemories().find((m) => m.id === mem.id);
  assert.ok(found);

  db.deleteMemory(mem.id);
  const afterDelete = db.getMemories().find((m) => m.id === mem.id);
  assert.equal(afterDelete, undefined);
});

test('Files and notifications are properly updated', () => {
  const file = db.addFile('Project_Brief.pdf', 'application/pdf', 10240, 'Project goals and deliverables');
  assert.equal(file.filename, 'Project_Brief.pdf');

  const renamed = db.renameFile(file.id, 'Project_Brief_Final.pdf');
  assert.equal(renamed?.filename, 'Project_Brief_Final.pdf');

  const notif = db.addNotification('Alert', 'Test notification message', 'task_complete');
  assert.equal(notif.isRead, false);

  const read = db.markNotificationRead(notif.id);
  assert.equal(read?.isRead, true);
});

test('Google OAuth login sets active user, access token, and links Gmail automatically', () => {
  const testEmail = 'rk.engineer@gmail.com';
  const testName = 'Rk Engineer';
  const testToken = 'ya29.sample_verified_oauth_token';

  const user = db.setAuthenticatedUser(testEmail, testName, undefined, testToken);
  assert.equal(user.email, testEmail);
  assert.equal(user.fullName, testName);
  assert.equal(db.isAuthenticated, true);
  assert.equal(db.getAccessToken(), testToken);

  // Verify that same Google account is automatically linked to Gmail in Connected Apps
  const gmailApp = db.getConnectedApps().find((a) => a.provider === 'gmail');
  assert.ok(gmailApp, 'Gmail connected app record must exist');
  assert.equal(gmailApp.accountEmail, testEmail, 'Gmail connected email must match logged in Google account');
  assert.equal(gmailApp.status, 'connected');
  assert.ok(gmailApp.grantedScopes.includes('gmail.send'));
});

test('Task cancel and retry transition states correctly', () => {
  const task = db.createTask('Orchestrated Background Job', 'Analyze cloud infrastructure', 'Browser Agent');
  assert.equal(task.status, 'RUNNING');

  const cancelled = db.cancelTask(task.id);
  assert.ok(cancelled);
  assert.equal(cancelled.status, 'CANCELLED');
  assert.equal(cancelled.errorMessage, 'Task cancelled by user');

  const retried = db.retryTask(task.id);
  assert.ok(retried);
  assert.equal(retried.status, 'RUNNING');
  assert.equal(retried.errorMessage, undefined);
  assert.ok(retried.steps.length >= 2, 'Should have added retry step');
});

test('Separate controls for session logout vs Gmail disconnection', () => {
  db.setAuthenticatedUser('test.user@gmail.com', 'Test User', undefined, 'valid-token');
  assert.equal(db.isAuthenticated, true);

  // 1. Disconnect Gmail only
  const disconnectedApp = db.disconnectApp('gmail');
  assert.ok(disconnectedApp);
  assert.equal(disconnectedApp.status, 'disconnected');
  assert.equal(db.isAuthenticated, true, 'User should still be authenticated when only Gmail is disconnected');

  // 2. Session logout clears auth and tokens
  db.logoutUser();
  assert.equal(db.isAuthenticated, false, 'User must be unauthenticated after session logout');
  assert.equal(db.getAccessToken(), undefined, 'Tokens must be cleared after session logout');
});

