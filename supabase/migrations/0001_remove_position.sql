-- Migration: Remove position column from members table
ALTER TABLE members DROP COLUMN IF EXISTS position;
