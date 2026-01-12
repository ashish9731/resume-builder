-- Drop existing tables and functions
drop function if exists get_user_credits(uuid);
drop function if exists consume_credits(uuid, varchar, varchar, integer, jsonb);
drop function if exists get_pricing_tiers_grouped();
drop table if exists credit_usage cascade;
drop table if exists user_tiers cascade;
drop table if exists pricing_tiers cascade;

-- Create pricing tiers table
create table pricing_tiers (
  id uuid default gen_random_uuid() primary key,
  name varchar(50) not null,
  billing_cycle varchar(10) not null default 'monthly',
  credits integer not null,
  price_inr numeric(10,2) not null,
  description text,
  features jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(name, billing_cycle)
);

-- Create user tiers table
create table user_tiers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  tier_id uuid references pricing_tiers(id),
  credits_used integer default 0,
  credits_total integer not null,
  subscription_start timestamp with time zone default now(),
  subscription_end timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Create credit usage tracking table
create table credit_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  service_type varchar(50) not null,
  action varchar(100) not null,
  credits_consumed integer not null,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Insert Free tier
insert into pricing_tiers (name, billing_cycle, credits, price_inr, description, features) values
('Free', 'monthly', 4, 0, 'Perfect for getting started', '{
  "resume_builder": {"credits": 1, "features": ["Download option"]},
  "resume_optimizer": {"credits": 1, "features": ["Generation only", "No download", "No copy"]},
  "communication_coach": {"credits": 1, "features": ["Record and analyze", "Speaking/grammar analysis only"]},
  "interview_prep": {"credits": 1, "features": ["Limited to 3-5 questions"]}
}');

-- Insert Basic tier - Monthly
insert into pricing_tiers (name, billing_cycle, credits, price_inr, description, features) values
('Basic', 'monthly', 24, 175, 'Great for regular job seekers', '{
  "resume_builder": {"credits": 10, "features": ["Full download option"]},
  "resume_optimizer": {"credits": 6, "features": ["Full features with download"]},
  "communication_coach": {"credits": 3, "features": ["Full analysis", "3 credits per recording"]},
  "interview_prep": {"credits": 3, "features": ["Full interview prep"]}
}');

-- Insert Basic tier - Yearly (same credits as monthly but annual billing)
insert into pricing_tiers (name, billing_cycle, credits, price_inr, description, features) values
('Basic', 'yearly', 288, 1799, 'Great for regular job seekers (Annual)', '{
  "resume_builder": {"credits": 120, "features": ["Full download option"]},
  "resume_optimizer": {"credits": 72, "features": ["Full features with download"]},
  "communication_coach": {"credits": 36, "features": ["Full analysis", "3 credits per recording"]},
  "interview_prep": {"credits": 36, "features": ["Full interview prep"]}
}');

-- Insert Pro tier - Monthly
insert into pricing_tiers (name, billing_cycle, credits, price_inr, description, features) values
('Pro', 'monthly', 40, 299, 'Best for serious job seekers', '{
  "resume_builder": {"credits": 15, "features": ["Unlimited usage"]},
  "resume_optimizer": {"credits": 10, "features": ["Unlimited usage"]},
  "communication_coach": {"credits": 10, "features": ["Unlimited usage"]},
  "interview_prep": {"credits": 10, "features": ["Unlimited usage"]}
}');

-- Insert Pro tier - Yearly (same credits as monthly but annual billing)
insert into pricing_tiers (name, billing_cycle, credits, price_inr, description, features) values
('Pro', 'yearly', 480, 2999, 'Best for serious job seekers (Annual)', '{
  "resume_builder": {"credits": 180, "features": ["Unlimited usage"]},
  "resume_optimizer": {"credits": 120, "features": ["Unlimited usage"]},
  "communication_coach": {"credits": 120, "features": ["Unlimited usage"]},
  "interview_prep": {"credits": 120, "features": ["Unlimited usage"]}
}');

-- Enable RLS
alter table pricing_tiers enable row level security;
alter table user_tiers enable row level security;
alter table credit_usage enable row level security;

-- Create policies
create policy "Public read access to pricing tiers" on pricing_tiers
  for select using (true);

create policy "Users can view their own tier" on user_tiers
  for select using (auth.uid() = user_id);

create policy "Users can view their own credit usage" on credit_usage
  for select using (auth.uid() = user_id);

-- Create function to get user's current tier and credits
create or replace function get_user_credits(user_uuid uuid)
returns table (
  tier_name varchar,
  billing_cycle varchar,
  credits_total integer,
  credits_used integer,
  credits_remaining integer,
  subscription_start timestamp with time zone,
  subscription_end timestamp with time zone,
  price_inr numeric(10,2)
) as $$
begin
  return query
  select 
    pt.name as tier_name,
    pt.billing_cycle,
    ut.credits_total,
    ut.credits_used,
    (ut.credits_total - ut.credits_used) as credits_remaining,
    ut.subscription_start,
    ut.subscription_end,
    pt.price_inr
  from user_tiers ut
  join pricing_tiers pt on ut.tier_id = pt.id
  where ut.user_id = user_uuid and ut.is_active = true;
end;
$$ language plpgsql;

-- Create function to consume credits
create or replace function consume_credits(user_uuid uuid, service varchar, action varchar, credits_to_consume integer, meta jsonb default '{}')
returns boolean as $$
declare
  current_credits integer;
begin
  -- Get current credits for user
  select (credits_total - credits_used) into current_credits
  from user_tiers 
  where user_id = user_uuid and is_active = true;
  
  -- Check if user has enough credits
  if current_credits is null or current_credits < credits_to_consume then
    return false;
  end if;
  
  -- Update credits used
  update user_tiers 
  set credits_used = credits_used + credits_to_consume,
      updated_at = now()
  where user_id = user_uuid and is_active = true;
  
  -- Log credit usage
  insert into credit_usage (user_id, service_type, action, credits_consumed, metadata)
  values (user_uuid, service, action, credits_to_consume, meta);
  
  return true;
end;
$$ language plpgsql;

-- Create function to get all active pricing tiers grouped by billing cycle
create or replace function get_pricing_tiers_grouped()
returns table (
  billing_cycle varchar,
  tiers json
) as $$
begin
  return query
  select 
    pt.billing_cycle,
    json_agg(
      json_build_object(
        'id', pt.id,
        'name', pt.name,
        'credits', pt.credits,
        'price_inr', pt.price_inr,
        'description', pt.description,
        'features', pt.features
      ) order by 
        case pt.name 
          when 'Free' then 1
          when 'Basic' then 2
          when 'Pro' then 3
        end
    ) as tiers
  from pricing_tiers pt
  where pt.is_active = true
  group by pt.billing_cycle
  order by 
    case pt.billing_cycle
      when 'monthly' then 1
      when 'yearly' then 2
    end;
end;
$$ language plpgsql;