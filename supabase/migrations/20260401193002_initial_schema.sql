-- ============================================================================
-- Migration: Initial Schema
-- Description: Complete database schema for ReviewAI
-- ============================================================================

-- ============================================================================
-- NEXT_AUTH SCHEMA (Auth.js / @auth/supabase-adapter)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON SCHEMA next_auth TO postgres;

-- next_auth.uid() — extracts user UUID from Supabase JWT for RLS policies
CREATE FUNCTION next_auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;

-- next_auth.users
CREATE TABLE next_auth.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text,
    email text,
    "emailVerified" timestamptz,
    image text,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

-- next_auth.sessions
CREATE TABLE next_auth.sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    expires timestamptz NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" uuid,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT "sessionToken_unique" UNIQUE ("sessionToken"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.sessions TO postgres;
GRANT ALL ON TABLE next_auth.sessions TO service_role;

-- next_auth.accounts
CREATE TABLE next_auth.accounts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    oauth_token_secret text,
    oauth_token text,
    "userId" uuid,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.accounts TO postgres;
GRANT ALL ON TABLE next_auth.accounts TO service_role;

-- next_auth.verification_tokens
CREATE TABLE next_auth.verification_tokens (
    identifier text,
    token text,
    expires timestamptz NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;

-- ============================================================================
-- PUBLIC SCHEMA — Application Tables
-- ============================================================================

-- users (mirrors next_auth.users, extended with app-specific fields)
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY REFERENCES next_auth.users (id) ON DELETE CASCADE,
    name text,
    email text UNIQUE,
    image text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: auto-sync new Auth.js users into public.users
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, name, email, image)
    VALUES (new.id, new.name, new.email, new.image);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON next_auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- organizations
CREATE TABLE public.organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    stripe_customer_id text UNIQUE,
    plan_tier varchar(50) NOT NULL DEFAULT 'free',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- organization_members
CREATE TABLE public.organization_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    role varchar(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

-- locations
CREATE TABLE public.locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    google_account_id text,
    google_location_id text,
    name text NOT NULL,
    address text,
    phone text,
    google_place_id text,
    is_verified boolean NOT NULL DEFAULT false,
    last_synced_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (organization_id, google_location_id)
);

-- reviews
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid NOT NULL REFERENCES public.locations (id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    google_review_id text UNIQUE NOT NULL,
    reviewer_name text,
    reviewer_photo_url text,
    star_rating int NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
    comment text,
    review_created_at timestamptz,
    review_updated_at timestamptz,
    sentiment varchar(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score numeric(3,2),
    sentiment_themes text[],
    requires_urgent_response boolean NOT NULL DEFAULT false,
    is_spam boolean NOT NULL DEFAULT false,
    ai_analysis jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- responses
CREATE TABLE public.responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid NOT NULL REFERENCES public.reviews (id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    content text NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected')),
    is_ai_generated boolean NOT NULL DEFAULT false,
    ai_model text,
    ai_tokens_used int,
    approved_by uuid REFERENCES public.users (id) ON DELETE SET NULL,
    approved_at timestamptz,
    published_at timestamptz,
    published_google_reply_id text,
    created_by uuid REFERENCES public.users (id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- subscriptions
CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations (id) ON DELETE CASCADE,
    stripe_subscription_id text UNIQUE,
    stripe_price_id text,
    stripe_current_period_end timestamptz,
    status varchar(30) NOT NULL,
    plan_tier varchar(50),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- notification_preferences
CREATE TABLE public.notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    new_review_email boolean NOT NULL DEFAULT true,
    new_review_in_app boolean NOT NULL DEFAULT true,
    weekly_digest boolean NOT NULL DEFAULT true,
    negative_review_alert boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, organization_id)
);

-- notifications
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    type varchar(50),
    title text,
    message text,
    data jsonb,
    read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- audit_log
CREATE TABLE public.audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
    action varchar(100) NOT NULL,
    entity_type varchar(50),
    entity_id uuid,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- brand_voice_configs
CREATE TABLE public.brand_voice_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    location_id uuid REFERENCES public.locations (id) ON DELETE CASCADE,
    tone text NOT NULL DEFAULT 'professional and friendly',
    formality int NOT NULL DEFAULT 7,
    humor_level int NOT NULL DEFAULT 3,
    use_emoji boolean NOT NULL DEFAULT false,
    signature_name text,
    preferred_phrases text[],
    avoid_phrases text[],
    response_length text NOT NULL DEFAULT '2-4 sentences',
    custom_examples jsonb,
    "values" text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- google_oauth_tokens
CREATE TABLE public.google_oauth_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    expires_at timestamptz,
    scope text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ai_usage_log
CREATE TABLE public.ai_usage_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
    model text,
    input_tokens int,
    output_tokens int,
    cost_usd numeric(10,6),
    operation varchar(50),
    review_id uuid REFERENCES public.reviews (id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- organization_members
CREATE INDEX idx_organization_members_user_id ON public.organization_members (user_id);
CREATE INDEX idx_organization_members_organization_id ON public.organization_members (organization_id);

-- locations
CREATE INDEX idx_locations_organization_id ON public.locations (organization_id);

-- reviews
CREATE INDEX idx_reviews_google_review_id ON public.reviews (google_review_id);
CREATE INDEX idx_reviews_location_id ON public.reviews (location_id);
CREATE INDEX idx_reviews_organization_id ON public.reviews (organization_id);
CREATE INDEX idx_reviews_sentiment ON public.reviews (sentiment);

-- responses
CREATE INDEX idx_responses_review_id ON public.responses (review_id);
CREATE INDEX idx_responses_organization_id ON public.responses (organization_id);

-- subscriptions
CREATE INDEX idx_subscriptions_organization_id ON public.subscriptions (organization_id);

-- notification_preferences
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences (user_id);
CREATE INDEX idx_notification_preferences_organization_id ON public.notification_preferences (organization_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_organization_id ON public.notifications (organization_id);

-- audit_log
CREATE INDEX idx_audit_log_organization_id ON public.audit_log (organization_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log (user_id);

-- brand_voice_configs
CREATE INDEX idx_brand_voice_configs_organization_id ON public.brand_voice_configs (organization_id);
CREATE INDEX idx_brand_voice_configs_location_id ON public.brand_voice_configs (location_id);

-- google_oauth_tokens
CREATE INDEX idx_google_oauth_tokens_organization_id ON public.google_oauth_tokens (organization_id);
CREATE INDEX idx_google_oauth_tokens_user_id ON public.google_oauth_tokens (user_id);

-- ai_usage_log
CREATE INDEX idx_ai_usage_log_organization_id ON public.ai_usage_log (organization_id);
CREATE INDEX idx_ai_usage_log_review_id ON public.ai_usage_log (review_id);

-- ============================================================================
-- RLS — Enable on public.users (per Auth.js adapter convention)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Can view own user data." ON public.users
    FOR SELECT USING (next_auth.uid() = id);

CREATE POLICY "Can update own user data." ON public.users
    FOR UPDATE USING (next_auth.uid() = id);
