-- Migration: 0001_init.sql
-- Creates conversations and messages tables

CREATE TABLE IF NOT EXISTS conversations (
  id          TEXT PRIMARY KEY,
  created_at  BIGINT NOT NULL,
  updated_at  BIGINT NOT NULL,
  metadata    TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender          TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
  text            TEXT NOT NULL,
  created_at      BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON messages(conversation_id);
