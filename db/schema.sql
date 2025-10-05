-- Supabase/Postgres schema for portfolio contact messages
-- Run this in Supabase SQL Editor

-- Enable required extension for gen_random_uuid()
create extension if not exists "pgcrypto" with schema extensions;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1),
  message text not null check (char_length(message) >= 10 and char_length(message) <= 2000),
  user_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Index for ordering and pruning
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- RLS: deny everything by default, then allow inserts from anon/authenticated
alter table public.contact_messages enable row level security;

-- Allow anyone (anon or authenticated) to insert messages.
-- If authenticated, enforce that user_id matches the auth.uid(); if anon, user_id must be null.
create policy if not exists "insert_contact_messages" on public.contact_messages
  for insert to anon, authenticated
  with check ((user_id is null) or (user_id = auth.uid()));

-- No select/update/delete policies defined: clients cannot read/modify messages via anon key.
-- Use service role (server) or build an admin UI with restricted keys to view messages.
