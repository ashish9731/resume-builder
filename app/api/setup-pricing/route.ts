import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServer()
    
    // Execute the migration SQL
    const migrationSQL = `
      -- Create pricing tiers table
      create table if not exists pricing_tiers (
        id uuid default gen_random_uuid() primary key,
        name varchar(50) not null unique,
        credits integer not null,
        price numeric(10,2) not null,
        description text,
        features jsonb,
        is_active boolean default true,
        created_at timestamp with time zone default now(),
        updated_at timestamp with time zone default now()
      );

      -- Create user tiers table for tracking user subscriptions
      create table if not exists user_tiers (
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
      create table if not exists credit_usage (
        id uuid default gen_random_uuid() primary key,
        user_id uuid references auth.users(id) on delete cascade,
        service_type varchar(50) not null,
        action varchar(100) not null,
        credits_consumed integer not null,
        metadata jsonb,
        created_at timestamp with time zone default now()
      );

      -- Insert default pricing tiers
      insert into pricing_tiers (name, credits, price, description, features) values
      ('Free', 4, 0, 'Perfect for getting started', '{
        "resume_builder": {"credits": 1, "features": ["Download option"]},
        "resume_optimizer": {"credits": 1, "features": ["Generation only", "No download", "No copy"]},
        "communication_coach": {"credits": 1, "features": ["Record and analyze", "Speaking/grammar analysis only"]},
        "interview_prep": {"credits": 1, "features": ["Limited to 3-5 questions"]}
      }') on conflict (name) do nothing;

      insert into pricing_tiers (name, credits, price, description, features) values
      ('Basic', 24, 29.99, 'Great for regular job seekers', '{
        "resume_builder": {"credits": 10, "features": ["Full download option"]},
        "resume_optimizer": {"credits": 6, "features": ["Full features with download"]},
        "communication_coach": {"credits": 3, "features": ["Full analysis", "3 credits per recording"]},
        "interview_prep": {"credits": 3, "features": ["Full interview prep"]}
      }') on conflict (name) do nothing;

      insert into pricing_tiers (name, credits, price, description, features) values
      ('Pro', 40, 49.99, 'Best for serious job seekers', '{
        "resume_builder": {"credits": 15, "features": ["Unlimited usage"]},
        "resume_optimizer": {"credits": 10, "features": ["Unlimited usage"]},
        "communication_coach": {"credits": 10, "features": ["Unlimited usage"]},
        "interview_prep": {"credits": 10, "features": ["Unlimited usage"]}
      }') on conflict (name) do nothing;

      -- Enable RLS (Row Level Security)
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
        credits_total integer,
        credits_used integer,
        credits_remaining integer,
        subscription_start timestamp with time zone,
        subscription_end timestamp with time zone
      ) as $$
      begin
        return query
        select 
          pt.name as tier_name,
          ut.credits_total,
          ut.credits_used,
          (ut.credits_total - ut.credits_used) as credits_remaining,
          ut.subscription_start,
          ut.subscription_end
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
        remaining_credits integer;
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
    `

    // Split SQL into individual statements and execute
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });
        if (error) {
          console.error('Error executing statement:', error);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully' 
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}