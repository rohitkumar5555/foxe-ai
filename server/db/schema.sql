-- ============================================================
-- FOXE AI AGENT — POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Multi-Agent Personal Execution Platform
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(32) DEFAULT 'user',
  timezone VARCHAR(64) DEFAULT 'America/Los_Angeles',
  language VARCHAR(16) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Devices Table
CREATE TABLE IF NOT EXISTS devices (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(32) NOT NULL, -- 'android' | 'ios' | 'web' | 'desktop'
  device_name VARCHAR(255) NOT NULL,
  os_version VARCHAR(64),
  automation_enabled BOOLEAN DEFAULT true,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(32) DEFAULT 'online'
);

-- 4. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  model VARCHAR(64) DEFAULT 'gemini-3.8-flash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(32) NOT NULL, -- 'user' | 'assistant' | 'system' | 'sentinel'
  content TEXT NOT NULL,
  plan_data JSONB,
  tool_invocations JSONB,
  verified_result JSONB,
  task_id VARCHAR(64),
  feedback_rating VARCHAR(16), -- 'like' | 'dislike'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id VARCHAR(64) REFERENCES conversations(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  instruction TEXT NOT NULL,
  status VARCHAR(32) NOT NULL, -- 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  assigned_agent VARCHAR(64) NOT NULL, -- 'Main Orchestrator' | 'Research Agent' | 'Browser Agent' | 'Email Agent' | 'Calendar Agent'
  progress_percent INT DEFAULT 0,
  result_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Task Steps Table
CREATE TABLE IF NOT EXISTS task_steps (
  id VARCHAR(64) PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tool_name VARCHAR(64),
  tool_input JSONB,
  tool_output JSONB,
  status VARCHAR(32) NOT NULL, -- 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  execution_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Connected Accounts Table
CREATE TABLE IF NOT EXISTS connected_accounts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(64) NOT NULL, -- 'gmail' | 'calendar' | 'drive' | 'slack' | 'github' | 'plaid'
  account_email VARCHAR(255),
  status VARCHAR(32) NOT NULL, -- 'connected' | 'disconnected' | 'error' | 'syncing'
  granted_scopes JSONB NOT NULL,
  credentials_data JSONB,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  is_granted BOOLEAN DEFAULT false,
  requires_human_ok BOOLEAN DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Automations Table
CREATE TABLE IF NOT EXISTS automations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  natural_instruction TEXT NOT NULL,
  cron_expression VARCHAR(64) NOT NULL,
  frequency_label VARCHAR(64) NOT NULL,
  target_app VARCHAR(64) NOT NULL,
  timezone VARCHAR(64) DEFAULT 'America/Los_Angeles',
  is_active BOOLEAN DEFAULT true,
  notify_on_run BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Approvals Table (Security Sentinel)
CREATE TABLE IF NOT EXISTS approvals (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id VARCHAR(64) REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  action_type VARCHAR(64) NOT NULL, -- 'send_email' | 'delete_file' | 'make_purchase' | 'update_calendar' | 'external_api'
  summary TEXT NOT NULL,
  details JSONB NOT NULL,
  status VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(64) NOT NULL, -- 'preference' | 'goal' | 'project' | 'context'
  key VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  approved_by_user BOOLEAN DEFAULT true,
  confidence_score NUMERIC(3, 2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Files Table
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(64) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  summary TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'task_complete' | 'task_failed' | 'approval_request' | 'automation_run' | 'security_alert'
  related_task_id VARCHAR(64),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(128) NOT NULL,
  agent_name VARCHAR(64) NOT NULL,
  tool_name VARCHAR(64),
  resource VARCHAR(128),
  security_decision VARCHAR(32) NOT NULL, -- 'PERMITTED' | 'BLOCKED' | 'APPROVED_BY_USER' | 'REJECTED_BY_USER'
  payload JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Browser Sessions Table
CREATE TABLE IF NOT EXISTS browser_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title VARCHAR(255),
  interactive_mode BOOLEAN DEFAULT false,
  viewport_screenshot TEXT,
  extracted_content TEXT,
  logs JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Workspace Instances Table
CREATE TABLE IF NOT EXISTS workspace_instances (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  environment VARCHAR(64) DEFAULT 'DEVELOPMENT WORKSPACE',
  status VARCHAR(32) DEFAULT 'running', -- 'running' | 'stopped' | 'restarting'
  cpu_percent INT DEFAULT 14,
  memory_percent INT DEFAULT 32,
  disk_percent INT DEFAULT 22,
  uptime_seconds INT DEFAULT 3600,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Tool Registry Table
CREATE TABLE IF NOT EXISTS tool_registry (
  name VARCHAR(64) PRIMARY KEY,
  category VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  required_permission VARCHAR(64) NOT NULL,
  requires_human_approval BOOLEAN DEFAULT false,
  input_schema JSONB NOT NULL,
  result_schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
