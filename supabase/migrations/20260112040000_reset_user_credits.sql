-- Drop existing tables and functions if they exist
drop function if exists get_simple_user_credits(uuid);
drop function if exists consume_simple_credits(uuid, varchar, integer);
drop function if exists initialize_user_credits(uuid);

-- Drop and recreate user_credits table
drop table if exists user_credits cascade;

-- Create a simple user credits table for the 4-credit system
create table user_credits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  credits_total integer default 4,
  credits_used integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Enable RLS
alter table user_credits enable row level security;

-- Create policies
create policy "Users can view their own credits" on user_credits
  for select using (auth.uid() = user_id);

create policy "Users can update their own credits" on user_credits
  for update using (auth.uid() = user_id);

-- Create function to get user credits
create or replace function get_simple_user_credits(user_uuid uuid)
returns table (
  credits_total integer,
  credits_used integer,
  credits_remaining integer
) as $$
begin
  return query
  select 
    uc.credits_total,
    uc.credits_used,
    (uc.credits_total - uc.credits_used) as credits_remaining
  from user_credits uc
  where uc.user_id = user_uuid;
end;
$$ language plpgsql;

-- Create function to consume credits
create or replace function consume_simple_credits(user_uuid uuid, service varchar, credits_to_consume integer)
returns boolean as $$
declare
  current_credits integer;
begin
  -- Get current credits for user
  select (credits_total - credits_used) into current_credits
  from user_credits 
  where user_id = user_uuid;
  
  -- Check if user has enough credits
  if current_credits is null or current_credits < credits_to_consume then
    return false;
  end if;
  
  -- Update credits used
  update user_credits 
  set credits_used = credits_used + credits_to_consume,
      updated_at = now()
  where user_id = user_uuid;
  
  return true;
end;
$$ language plpgsql;

-- Create function to initialize user credits (called on first login)
create or replace function initialize_user_credits(user_uuid uuid)
returns void as $$
begin
  -- Insert default 4 credits for new user
  insert into user_credits (user_id, credits_total, credits_used)
  values (user_uuid, 4, 0)
  on conflict (user_id) do nothing;
end;
$$ language plpgsql;

-- Initialize credits for existing users (if any)
-- This will give all existing users 4 credits
insert into user_credits (user_id, credits_total, credits_used)
select id, 4, 0 
from auth.users 
on conflict (user_id) do nothing;