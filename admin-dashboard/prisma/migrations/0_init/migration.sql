-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "profiles" (
    "id" VARCHAR(128) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "full_address" TEXT,
    "role" VARCHAR(50) NOT NULL DEFAULT 'buyer',
    "employee_department" VARCHAR(50),
    "avatar_url" TEXT,
    "wallet_balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "kyc_status" VARCHAR(50) NOT NULL DEFAULT 'not_submitted',
    "kyc_rejection_reason" TEXT,
    "referral_code" VARCHAR(50),
    "referred_by_code" VARCHAR(50),
    "expo_push_token" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "about_me" TEXT,
    "developer_id" VARCHAR(36),
    "bank_name" VARCHAR(255),
    "bank_account_name" VARCHAR(255),
    "bank_account_number" VARCHAR(50),
    "bank_ifsc" VARCHAR(20),
    "commission_rate_pct" DECIMAL(5,2),
    "bio" TEXT,
    "company_name" VARCHAR(255),
    "office_address" TEXT,
    "website" VARCHAR(500),
    "rera_number" VARCHAR(100),
    "credai_member" BOOLEAN,
    "company_pan" VARCHAR(20),
    "company_gst" VARCHAR(30),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "assigned_sales_rep_id" VARCHAR(128),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "document_number" VARCHAR(100) NOT NULL,
    "document_front_url" TEXT NOT NULL,
    "document_back_url" TEXT,
    "verification_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "verified_by" VARCHAR(128),
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "property_type" VARCHAR(50) NOT NULL,
    "listing_type" VARCHAR(50) NOT NULL DEFAULT 'fractional',
    "sub_type" VARCHAR(100),
    "total_fractions" INTEGER NOT NULL,
    "available_fractions" INTEGER NOT NULL,
    "sold_fractions" INTEGER NOT NULL DEFAULT 0,
    "price_per_fraction" DECIMAL(12,2) NOT NULL,
    "booking_amount" DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
    "assured_yield" DECIMAL(5,2),
    "target_irr" DECIMAL(5,2),
    "state" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "locality" VARCHAR(100) NOT NULL,
    "full_address" TEXT,
    "lat" DECIMAL(10,6),
    "lng" DECIMAL(10,6),
    "video_url" TEXT,
    "brochure_url" TEXT,
    "area_sqft" DECIMAL(10,2),
    "area_sqft_max" DECIMAL(10,2),
    "area_unit" VARCHAR(20) DEFAULT 'sqft',
    "bhk_areas" JSONB,
    "rera_number" VARCHAR(100),
    "permission_number" VARCHAR(100),
    "google_maps_url" TEXT,
    "posted_by" VARCHAR(128),
    "developer_id" VARCHAR(36),
    "approval_status" VARCHAR(50) NOT NULL DEFAULT 'pending_approval',
    "rejection_notes" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "is_project" BOOLEAN NOT NULL DEFAULT false,
    "is_hero" BOOLEAN NOT NULL DEFAULT false,
    "is_search_featured" BOOLEAN NOT NULL DEFAULT false,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "is_sold_out" BOOLEAN NOT NULL DEFAULT false,
    "floor_type" VARCHAR(50),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "flooring" VARCHAR(100),
    "kitchen_type" VARCHAR(50),
    "parking_count" INTEGER,
    "club_house" BOOLEAN,
    "amenities" TEXT,
    "furnished" BOOLEAN,
    "plug_and_play" BOOLEAN,
    "central_ac" BOOLEAN,
    "preleased" BOOLEAN,
    "maintenance_avail" BOOLEAN,
    "food_courts" BOOLEAN,
    "fencing" BOOLEAN,
    "electricity_avail" BOOLEAN,
    "farm_shed" BOOLEAN,
    "bore_wells" BOOLEAN,
    "plants_available" BOOLEAN,
    "loan_availability" BOOLEAN,
    "land_registered" BOOLEAN,
    "pass_book" BOOLEAN,
    "raithu_bharosa" BOOLEAN,
    "approach_road" VARCHAR(50),
    "under_irrigation" BOOLEAN,
    "ownership_type" VARCHAR(50),
    "speciality" TEXT,
    "special_offers" TEXT,
    "deposit_type" VARCHAR(20),
    "deposit_months" INTEGER,
    "deposit_amount" DECIMAL(12,2),
    "rental_amount" DECIMAL(12,2),
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "document_url" TEXT NOT NULL,
    "file_type" VARCHAR(20) NOT NULL,
    "file_size" BIGINT,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "fractions_bought" INTEGER NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "booking_amount_paid" DECIMAL(15,2) NOT NULL,
    "ownership_percentage" DECIMAL(6,3) NOT NULL,
    "certificate_number" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "property_id" VARCHAR(36),
    "investment_id" VARCHAR(36),
    "transaction_type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "payment_gateway" VARCHAR(50) DEFAULT 'Razorpay',
    "gateway_txn_id" VARCHAR(255),
    "payment_method" VARCHAR(50),
    "payment_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_commissions" (
    "id" VARCHAR(36) NOT NULL,
    "agent_id" VARCHAR(128) NOT NULL,
    "investor_id" VARCHAR(128) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "investment_id" VARCHAR(36) NOT NULL,
    "commission_percentage" DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    "commission_amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending_clearance',
    "paid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_clients" (
    "id" VARCHAR(36) NOT NULL,
    "agent_id" VARCHAR(128) NOT NULL,
    "client_name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "target_budget" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'Hot Lead',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_client_properties" (
    "id" VARCHAR(36) NOT NULL,
    "client_id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_client_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" VARCHAR(36) NOT NULL,
    "agent_id" VARCHAR(128) NOT NULL,
    "client_id" VARCHAR(36) NOT NULL,
    "message" TEXT NOT NULL,
    "sender" VARCHAR(20) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developers" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "company_name" VARCHAR(255),
    "office_address" TEXT,
    "website" VARCHAR(255),
    "company_pan" VARCHAR(50),
    "company_gst" VARCHAR(50),
    "credai_member" BOOLEAN NOT NULL DEFAULT false,
    "profile_status" VARCHAR(20) NOT NULL DEFAULT 'Regular',
    "logo_url" TEXT,
    "bio" TEXT,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 4.5,
    "established_year" INTEGER,
    "rera_registered" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "audience" VARCHAR(50) NOT NULL DEFAULT 'all',
    "sent_by" VARCHAR(128),
    "recipients_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_notifications" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "audience" VARCHAR(50) NOT NULL DEFAULT 'all',
    "repeat_type" VARCHAR(20) NOT NULL,
    "repeat_time" VARCHAR(10),
    "repeat_day" INTEGER,
    "next_send_at" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(128),
    "last_sent_at" TIMESTAMPTZ(6),
    "send_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "badge" VARCHAR(100),
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_inquiries" (
    "id" VARCHAR(36) NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "service_type" VARCHAR(100) NOT NULL,
    "property_reference" VARCHAR(255),
    "estimated_budget" VARCHAR(100),
    "assigned_to" VARCHAR(128),
    "status" VARCHAR(50) NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_services" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL DEFAULT 'Premium Service',
    "description" TEXT,
    "pricing" VARCHAR(100),
    "image_url" TEXT NOT NULL,
    "icon" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "premium_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "assigned_to" VARCHAR(128),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortlists" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shortlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" VARCHAR(50) NOT NULL DEFAULT 'global',
    "values" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "property_type" VARCHAR(50) NOT NULL,
    "address" TEXT NOT NULL,
    "purchase_price" DECIMAL(15,2),
    "purchase_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "lease_name" VARCHAR(255),
    "lease_period_months" INTEGER,
    "rental_monthly" DECIMAL(12,2),
    "payment_method" VARCHAR(50),
    "lease_managed_by" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_documents" (
    "id" VARCHAR(36) NOT NULL,
    "asset_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "document_url" TEXT NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_agreements" (
    "id" VARCHAR(36) NOT NULL,
    "asset_id" VARCHAR(36) NOT NULL,
    "tenant_name" VARCHAR(255) NOT NULL,
    "tenant_phone" VARCHAR(20),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "monthly_rent" DECIMAL(15,2) NOT NULL,
    "security_deposit" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_statements" (
    "id" VARCHAR(36) NOT NULL,
    "agreement_id" VARCHAR(36) NOT NULL,
    "month_year" VARCHAR(20) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_mode" VARCHAR(50),
    "receipt_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'paid',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" VARCHAR(36) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "context_id" VARCHAR(36),
    "context_label" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" VARCHAR(36) NOT NULL,
    "conversation_id" VARCHAR(36) NOT NULL,
    "profile_id" VARCHAR(128) NOT NULL,
    "last_read_at" TIMESTAMPTZ(6),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" VARCHAR(36) NOT NULL,
    "conversation_id" VARCHAR(36) NOT NULL,
    "sender_id" VARCHAR(128) NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_applications" (
    "id" VARCHAR(36) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "primary_market" VARCHAR(100) NOT NULL,
    "company" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" VARCHAR(36) NOT NULL,
    "contact_type" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "location" VARCHAR(255),
    "message" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'unread',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" VARCHAR(36) NOT NULL,
    "seq" BIGSERIAL NOT NULL,
    "employee_id" VARCHAR(128),
    "actor_email" VARCHAR(255),
    "actor_name" VARCHAR(255),
    "actor_role" VARCHAR(50),
    "actor_dept" VARCHAR(50),
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(128) NOT NULL,
    "outcome" VARCHAR(20) NOT NULL DEFAULT 'success',
    "before" JSONB,
    "after" JSONB,
    "details" JSONB,
    "ip_address" VARCHAR(64),
    "user_agent" TEXT,
    "request_id" VARCHAR(64),
    "http_method" VARCHAR(10),
    "path" VARCHAR(512),
    "prev_hash" VARCHAR(64),
    "hash" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" VARCHAR(36) NOT NULL,
    "role_type" VARCHAR(20) NOT NULL,
    "tier" VARCHAR(20) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "postings_limit" INTEGER NOT NULL,
    "post_listing_days" INTEGER NOT NULL,
    "support_level" VARCHAR(20) NOT NULL,
    "post_assistance" VARCHAR(20) NOT NULL,
    "referral_program" BOOLEAN NOT NULL DEFAULT false,
    "renewal" BOOLEAN NOT NULL DEFAULT false,
    "validity_days" INTEGER NOT NULL,
    "tagline" VARCHAR(100) NOT NULL,
    "features" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "plan_id" VARCHAR(36) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "postings_used" INTEGER NOT NULL DEFAULT 0,
    "razorpay_order_id" VARCHAR(255),
    "razorpay_payment_id" VARCHAR(255),
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "coupon_code" VARCHAR(50),
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_coupons" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" VARCHAR(20) NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_plan_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "applicable_role" VARCHAR(20),
    "applicable_tier" VARCHAR(20),
    "max_uses" INTEGER NOT NULL DEFAULT 1,
    "times_used" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMPTZ(6) NOT NULL,
    "valid_until" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(128),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_login_logs" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "ip_address" VARCHAR(64),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegate_access_sessions" (
    "id" VARCHAR(36) NOT NULL,
    "requester_id" VARCHAR(128) NOT NULL,
    "requester_role" VARCHAR(20) NOT NULL,
    "requester_name" VARCHAR(255),
    "target_user_id" VARCHAR(128) NOT NULL,
    "target_user_role" VARCHAR(20) NOT NULL,
    "target_user_name" VARCHAR(255),
    "access_code" VARCHAR(6) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "code_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "activated_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "ip_address" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delegate_access_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegate_access_logs" (
    "id" VARCHAR(36) NOT NULL,
    "session_id" VARCHAR(36) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(128),
    "before" JSONB,
    "after" JSONB,
    "details" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delegate_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_phone_number_key" ON "profiles"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_referral_code_key" ON "profiles"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_documents_user_id_document_type_key" ON "kyc_documents"("user_id", "document_type");

-- CreateIndex
CREATE UNIQUE INDEX "investments_certificate_number_key" ON "investments"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "agent_client_properties_client_id_property_id_key" ON "agent_client_properties"("client_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "developers_name_key" ON "developers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");

-- CreateIndex
CREATE UNIQUE INDEX "shortlists_user_id_property_id_key" ON "shortlists"("user_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_profile_id_key" ON "conversation_participants"("conversation_id", "profile_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_employee_id_idx" ON "audit_logs"("employee_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_outcome_idx" ON "audit_logs"("outcome");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_role_type_tier_key" ON "subscription_plans"("role_type", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "discount_coupons_code_key" ON "discount_coupons"("code");

-- CreateIndex
CREATE INDEX "admin_login_logs_user_id_idx" ON "admin_login_logs"("user_id");

-- CreateIndex
CREATE INDEX "admin_login_logs_created_at_idx" ON "admin_login_logs"("created_at");

-- CreateIndex
CREATE INDEX "delegate_access_sessions_requester_id_idx" ON "delegate_access_sessions"("requester_id");

-- CreateIndex
CREATE INDEX "delegate_access_sessions_target_user_id_idx" ON "delegate_access_sessions"("target_user_id");

-- CreateIndex
CREATE INDEX "delegate_access_sessions_access_code_status_idx" ON "delegate_access_sessions"("access_code", "status");

-- CreateIndex
CREATE INDEX "delegate_access_sessions_created_at_idx" ON "delegate_access_sessions"("created_at");

-- CreateIndex
CREATE INDEX "delegate_access_logs_session_id_idx" ON "delegate_access_logs"("session_id");

-- CreateIndex
CREATE INDEX "delegate_access_logs_created_at_idx" ON "delegate_access_logs"("created_at");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_assigned_sales_rep_id_fkey" FOREIGN KEY ("assigned_sales_rep_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_clients" ADD CONSTRAINT "agent_clients_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_client_properties" ADD CONSTRAINT "agent_client_properties_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "agent_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_client_properties" ADD CONSTRAINT "agent_client_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "agent_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_documents" ADD CONSTRAINT "asset_documents_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_agreements" ADD CONSTRAINT "rental_agreements_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_statements" ADD CONSTRAINT "rental_statements_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "rental_agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_login_logs" ADD CONSTRAINT "admin_login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegate_access_sessions" ADD CONSTRAINT "delegate_access_sessions_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegate_access_sessions" ADD CONSTRAINT "delegate_access_sessions_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegate_access_logs" ADD CONSTRAINT "delegate_access_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "delegate_access_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

