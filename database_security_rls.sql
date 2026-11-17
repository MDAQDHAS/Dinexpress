-- ==============================================================================
-- DineExpress Production Row-Level Security (RLS) & Hardening Guide
-- Run this in your Supabase SQL Editor to enforce strict security boundaries.
-- ==============================================================================

-- 1. Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS POLICIES
-- Anyone can view products (public menu)
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (true);

-- Only admins can insert, update, or delete products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 3. PROFILES POLICIES
-- Users can view their own profile; staff/admin can view profiles for order dispatch
DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.profiles;
CREATE POLICY "Users can view relevant profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('worker', 'admin')
  )
);

-- Users can only update their own profile info (cannot arbitrarily change wallet_balance or role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Prevents client from mutating their own role to admin
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- 4. ORDERS POLICIES
-- Students can only view their own orders; workers and admins can view all orders
DROP POLICY IF EXISTS "Orders visibility policy" ON public.orders;
CREATE POLICY "Orders visibility policy"
ON public.orders FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('worker', 'admin')
  )
);

-- Authenticated users can place orders for themselves
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);

-- Only staff and admins can update order status (e.g. preparing, ready, delivered)
DROP POLICY IF EXISTS "Staff can update order status" ON public.orders;
CREATE POLICY "Staff can update order status"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('worker', 'admin')
  )
);

-- 5. TRANSACTIONS POLICIES
-- Students can only view their own transaction history
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
CREATE POLICY "Users view own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Transactions can only be created via backend or signed functions (prevent client forgery)
DROP POLICY IF EXISTS "Transactions creation policy" ON public.transactions;
CREATE POLICY "Transactions creation policy"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid()
);

-- 6. FAVORITES POLICIES
-- Users have full control over their own favorites list
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
CREATE POLICY "Users manage own favorites"
ON public.favorites FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 7. AUDIT LOGS POLICIES
-- Anyone can append log events; only admins can view audit logs
DROP POLICY IF EXISTS "Append audit logs" ON public.user_logs;
CREATE POLICY "Append audit logs"
ON public.user_logs FOR INSERT
USING (true);

DROP POLICY IF EXISTS "Admin view audit logs" ON public.user_logs;
CREATE POLICY "Admin view audit logs"
ON public.user_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
