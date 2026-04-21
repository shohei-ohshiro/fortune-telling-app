-- purchases テーブル: 買い切り商品の購入記録
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  stripe_session_id text,
  amount integer,
  purchased_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- RLS
alter table public.purchases enable row level security;

-- ユーザーは自分の購入のみ参照可能
create policy "Users can read own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- サーバー(service_role)のみ挿入可能（webhook経由）
-- anon/authenticated からの直接 insert は不可
