-- BTMCode Portfolio — Supabase schema
-- Run in Supabase SQL Editor.
-- Never expose a service_role key in browser code.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  description text,
  category text,
  stack text[] not null default '{}',
  live_url text,
  repo_url text,
  cover_url text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 180),
  company text,
  service text,
  message text not null check (char_length(message) between 20 and 4000),
  status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_btm_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid() and role='admin' and is_active=true); $$;

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.contact_leads enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "admin reads own membership" on public.admin_users;
create policy "admin reads own membership" on public.admin_users for select to authenticated using(user_id=auth.uid() or public.is_btm_admin());
drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects" on public.projects for all to authenticated using(public.is_btm_admin()) with check(public.is_btm_admin());
drop policy if exists "public reads published projects" on public.projects;
create policy "public reads published projects" on public.projects for select to anon,authenticated using(status='published');
drop policy if exists "admins manage posts" on public.blog_posts;
create policy "admins manage posts" on public.blog_posts for all to authenticated using(public.is_btm_admin()) with check(public.is_btm_admin());
drop policy if exists "public reads published posts" on public.blog_posts;
create policy "public reads published posts" on public.blog_posts for select to anon,authenticated using(status='published');
drop policy if exists "public submits leads" on public.contact_leads;
create policy "public submits leads" on public.contact_leads for insert to anon,authenticated with check(status='new');
drop policy if exists "admins manage leads" on public.contact_leads;
create policy "admins manage leads" on public.contact_leads for all to authenticated using(public.is_btm_admin()) with check(public.is_btm_admin());
drop policy if exists "public reads public settings" on public.site_settings;
create policy "public reads public settings" on public.site_settings for select to anon,authenticated using(is_public=true);
drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins manage settings" on public.site_settings for all to authenticated using(public.is_btm_admin()) with check(public.is_btm_admin());
drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "admins read audit logs" on public.audit_logs for select to authenticated using(public.is_btm_admin());
drop policy if exists "admins insert audit logs" on public.audit_logs;
create policy "admins insert audit logs" on public.audit_logs for insert to authenticated with check(public.is_btm_admin());

-- Bootstrap admin after creating the first user in Supabase Auth:
-- insert into public.admin_users(user_id,email,role,is_active)
-- select id,email,'admin',true from auth.users where email='YOUR-ADMIN-EMAIL@example.com'
-- on conflict(user_id) do update set role='admin',is_active=true;
