-- ============================================================================
-- Migration: Row Level Security Policies
-- Description: RLS for all public tables. Organization-scoped access pattern.
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Returns all organization_ids the current JWT user belongs to.
-- Used in SELECT policies for org-scoped tables.
CREATE FUNCTION public.user_org_ids() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT organization_id
    FROM public.organization_members
    WHERE user_id = (SELECT next_auth.uid())
$$;

-- Returns true if the current user has one of the specified roles in the org.
-- Used in INSERT/UPDATE/DELETE policies requiring elevated privileges.
CREATE FUNCTION public.has_org_role(p_org_id uuid, p_roles varchar[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_org_id
          AND user_id = (SELECT next_auth.uid())
          AND role = ANY(p_roles)
    )
$$;

-- ============================================================================
-- Drop existing users policies from initial migration (re-create with caching)
-- ============================================================================

DROP POLICY IF EXISTS "Can view own user data." ON public.users;
DROP POLICY IF EXISTS "Can update own user data." ON public.users;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- (users already enabled in initial migration, but ALTER TABLE IF NOT is safe)
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voice_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS — own row only
-- ============================================================================

CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (id = (SELECT next_auth.uid()));

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (id = (SELECT next_auth.uid()));

-- ============================================================================
-- ORGANIZATIONS — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "organizations_select_member" ON public.organizations
    FOR SELECT USING (id IN (SELECT public.user_org_ids()));

CREATE POLICY "organizations_insert_authenticated" ON public.organizations
    FOR INSERT WITH CHECK ((SELECT next_auth.uid()) IS NOT NULL);

CREATE POLICY "organizations_update_admin" ON public.organizations
    FOR UPDATE USING (public.has_org_role(id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "organizations_delete_owner" ON public.organizations
    FOR DELETE USING (public.has_org_role(id, ARRAY['owner']::varchar[]));

-- ============================================================================
-- ORGANIZATION_MEMBERS — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "org_members_select_member" ON public.organization_members
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "org_members_insert_admin" ON public.organization_members
    FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "org_members_update_admin" ON public.organization_members
    FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "org_members_delete_admin" ON public.organization_members
    FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

-- ============================================================================
-- LOCATIONS — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "locations_select_member" ON public.locations
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "locations_insert_admin" ON public.locations
    FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "locations_update_admin" ON public.locations
    FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "locations_delete_admin" ON public.locations
    FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

-- ============================================================================
-- REVIEWS — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "reviews_select_member" ON public.reviews
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "reviews_insert_admin" ON public.reviews
    FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "reviews_update_admin" ON public.reviews
    FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "reviews_delete_admin" ON public.reviews
    FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

-- ============================================================================
-- RESPONSES — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "responses_select_member" ON public.responses
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "responses_insert_admin" ON public.responses
    FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "responses_update_admin" ON public.responses
    FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "responses_delete_admin" ON public.responses
    FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

-- ============================================================================
-- SUBSCRIPTIONS — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "subscriptions_select_member" ON public.subscriptions
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "subscriptions_insert_admin" ON public.subscriptions
    FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "subscriptions_update_admin" ON public.subscriptions
    FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "subscriptions_delete_admin" ON public.subscriptions
    FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

-- ============================================================================
-- NOTIFICATION_PREFERENCES — own preferences only (scoped to user + org)
-- ============================================================================

CREATE POLICY "notification_prefs_select_own" ON public.notification_preferences
    FOR SELECT USING (user_id = (SELECT next_auth.uid()));

CREATE POLICY "notification_prefs_insert_own" ON public.notification_preferences
    FOR INSERT WITH CHECK (user_id = (SELECT next_auth.uid())
        AND organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "notification_prefs_update_own" ON public.notification_preferences
    FOR UPDATE USING (user_id = (SELECT next_auth.uid()));

CREATE POLICY "notification_prefs_delete_own" ON public.notification_preferences
    FOR DELETE USING (user_id = (SELECT next_auth.uid()));

-- ============================================================================
-- NOTIFICATIONS — own notifications only
-- ============================================================================

CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (user_id = (SELECT next_auth.uid()));

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (user_id = (SELECT next_auth.uid()));

-- No INSERT/DELETE from client — use service role for creating notifications

-- ============================================================================
-- AUDIT_LOG — SELECT only (no client writes; use service role for inserts)
-- ============================================================================

CREATE POLICY "audit_log_select_member" ON public.audit_log
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

-- ============================================================================
-- BRAND_VOICE_CONFIGS — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "brand_voice_select_member" ON public.brand_voice_configs
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "brand_voice_insert_admin" ON public.brand_voice_configs
    FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "brand_voice_update_admin" ON public.brand_voice_configs
    FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "brand_voice_delete_admin" ON public.brand_voice_configs
    FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

-- ============================================================================
-- GOOGLE_OAUTH_TOKENS — members can read, owners/admins can mutate
-- ============================================================================

CREATE POLICY "google_tokens_select_member" ON public.google_oauth_tokens
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));

CREATE POLICY "google_tokens_insert_admin" ON public.google_oauth_tokens
    FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "google_tokens_update_admin" ON public.google_oauth_tokens
    FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

CREATE POLICY "google_tokens_delete_admin" ON public.google_oauth_tokens
    FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::varchar[]));

-- ============================================================================
-- AI_USAGE_LOG — SELECT only (no client writes; use service role for inserts)
-- ============================================================================

CREATE POLICY "ai_usage_log_select_member" ON public.ai_usage_log
    FOR SELECT USING (organization_id IN (SELECT public.user_org_ids()));
