-- Phase 5: inventory_log table
-- Run this in the Supabase SQL Editor before executing Phase 5.
--
-- The inventory_log records every stock movement (order deductions, packaging use).
-- Columns match what the app already writes via deductPackaging() and deductRecipeIngredients().

create table if not exists inventory_log (
  id            uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  change_qty    numeric not null,          -- negative = deduction, positive = restock
  reason        text not null,             -- 'order' | 'packaging_takeout' | 'restock' | etc.
  reference_id  uuid,                      -- order id that triggered this movement
  created_at    timestamptz not null default now()
);

create index if not exists inventory_log_ingredient_id_idx on inventory_log(ingredient_id);
create index if not exists inventory_log_reference_id_idx  on inventory_log(reference_id);
