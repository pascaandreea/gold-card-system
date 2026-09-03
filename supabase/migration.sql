-- ============================================================
-- GOLD CARD SYSTEM — Supabase Migration
-- Run this in Supabase SQL Editor (supabase.com → project → SQL Editor)
-- ============================================================

-- 1. Gold Cards table
create table public.gold_cards (
  id              serial primary key,
  card_code       text unique not null,          -- GOLD-001 … GOLD-200
  qr_token        uuid unique not null default gen_random_uuid(),
  
  -- Customer info
  name            text,
  phone           text,
  ig_handle       text,
  photo_url       text,                          -- Supabase Storage URL
  
  -- Status
  status          text not null default 'available'
                  check (status in ('available','pending','active','blocked','expired')),
  
  -- Conditions met at registration
  cond_follow     boolean default false,
  cond_story      boolean default false,
  cond_whatsapp   boolean default false,
  
  -- GDPR consent
  consent_marketing  boolean default false,
  consent_marketing_at timestamptz,
  consent_photo      boolean default false,
  consent_photo_at   timestamptz,
  
  -- Dates
  registered_at   timestamptz,
  activated_at    timestamptz,
  expires_at      timestamptz,                   -- activated_at + 12 months
  created_at      timestamptz default now(),
  
  -- Notes
  notes           text
);

-- 2. Redemptions table
create table public.redemptions (
  id              serial primary key,
  card_id         integer references public.gold_cards(id) on delete cascade,
  redeemed_at     timestamptz default now(),
  iso_year        integer not null,
  iso_week        integer not null,
  item_redeemed   text,                          -- 'cafea simpla', 'desert mic'
  staff_pin       text,                          -- which staff member processed it
  notes           text,
  
  -- Prevent double redemption same week
  unique(card_id, iso_year, iso_week)
);

-- 3. Staff PINs (simple auth)
create table public.staff (
  id              serial primary key,
  name            text not null,
  pin             text not null unique,          -- 4-digit PIN
  role            text not null default 'staff'
                  check (role in ('staff','admin')),
  active          boolean default true,
  created_at      timestamptz default now()
);

-- 4. Pre-generate 200 cards
insert into public.gold_cards (card_code)
select 'GOLD-' || lpad(n::text, 3, '0')
from generate_series(1, 200) as n;

-- 5. Default admin + staff PINs (CHANGE THESE)
insert into public.staff (name, pin, role) values
  ('Admin', '9999', 'admin'),
  ('Staff 1', '1111', 'staff'),
  ('Staff 2', '2222', 'staff');

-- 6. Indexes
create index idx_cards_qr_token on public.gold_cards(qr_token);
create index idx_cards_status on public.gold_cards(status);
create index idx_redemptions_card_week on public.redemptions(card_id, iso_year, iso_week);

-- 7. Row Level Security — disable for simplicity (internal tool)
-- In production, enable RLS and use service_role key server-side only
alter table public.gold_cards enable row level security;
alter table public.redemptions enable row level security;
alter table public.staff enable row level security;

-- Allow all operations via service_role key
create policy "Service role full access" on public.gold_cards
  for all using (true) with check (true);
create policy "Service role full access" on public.redemptions
  for all using (true) with check (true);
create policy "Service role full access" on public.staff
  for all using (true) with check (true);

-- 8. Storage bucket for customer photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict do nothing;

create policy "Anyone can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos');

create policy "Photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'photos');
