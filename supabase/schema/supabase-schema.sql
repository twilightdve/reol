-- 美辞学ナビ用のデータベーススキーマ

-- プロフィールテーブル（auth.usersと連携）
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSを有効にする
alter table profiles enable row level security;

-- プロフィール用のポリシー
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 会場参加表明テーブル
create table venue_attendances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  venue_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, venue_id)
);

-- RLSを有効にする
alter table venue_attendances enable row level security;

-- 参加表明用のポリシー
create policy "Users can view all venue attendances."
  on venue_attendances for select
  using ( true );

create policy "Users can insert their own venue attendance."
  on venue_attendances for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own venue attendance."
  on venue_attendances for delete
  using ( auth.uid() = user_id );

-- プロフィールの更新日時を自動更新する関数
create function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- トリガーの作成
create trigger handle_profiles_updated_at before update on profiles
  for each row execute procedure public.handle_updated_at();

-- 新規ユーザー登録時にプロフィールを自動作成する関数
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- トリガーの作成
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();