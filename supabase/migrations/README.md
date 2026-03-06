# Database Migrations

This folder contains SQL migrations for the Vymio backend database.

## Current Migrations

### `20260305_complete_users_and_avatars.sql`
Complete setup for user profiles and avatar management.

**What it does:**
1. Creates `public.users` table linked to Supabase Auth
   - Fields: `id`, `username`, `email`, `avatar`, `created_at`, `updated_at`
   - Username must be at least 3 characters
   
2. Sets up automatic triggers:
   - Auto-updates `updated_at` timestamp on user changes
   - Auto-creates user profile when someone signs up via Supabase Auth
   - Auto-generates default avatar from username first letter if not provided
   
3. Enables Row Level Security (RLS):
   - Users can read their own profile
   - Users can update their own profile
   
4. Creates `avatars` storage bucket:
   - Max file size: 20MB
   - Allowed types: PNG, JPEG, JPG, WebP, GIF
   - Public read access
   - Authenticated users can upload/update/delete their own avatars
   
5. Backfills default avatars for existing users

**How to run:**

**Option 1: Supabase CLI**
```bash
supabase db push
```

**Option 2: Supabase Dashboard**
1. Go to your project: https://yqslcdzqgncweprfjpap.supabase.co
2. Navigate to SQL Editor
3. Copy and paste the contents of `20260305_complete_users_and_avatars.sql`
4. Click "Run"

**Option 3: Direct SQL**
```bash
psql $DATABASE_URL -f supabase/migrations/20260305_complete_users_and_avatars.sql
```

## Migration Safety

This migration is **idempotent** - safe to run multiple times. It uses:
- `create table if not exists`
- `create or replace function`
- `drop trigger if exists`
- `drop policy if exists`
- `on conflict do update` for bucket setup

## After Running

Verify the migration succeeded:

```sql
-- Check users table exists
select * from public.users limit 1;

-- Check avatars bucket exists
select * from storage.buckets where id = 'avatars';

-- Check policies
select * from pg_policies where tablename = 'users';
```

## Default Avatar

Users automatically get a letter-based avatar using their username first letter:
- Example: Username "john" → Avatar shows "J"
- Color scheme: Blue background (#0D8ABC), white text
- Size: 256x256
- Service: https://ui-avatars.com/api/

## Notes

- The trigger `handle_new_auth_user()` runs automatically on signup
- No need to manually create user profiles - they're auto-created
- Avatar uploads are stored in user-specific folders: `avatars/<user_id>/`
- Old avatar files are not auto-deleted when uploading new ones (manual cleanup needed)
