-- ============================================
-- BAHARAT E-COMMERCE DATABASE SCHEMA
-- Supabase PostgreSQL için SQL Script
-- ============================================

-- Enum Types
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'DEALER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER');
CREATE TYPE "CheckStatus" AS ENUM ('PENDING', 'DEPOSITED', 'CLEARED', 'BOUNCED', 'CANCELLED');

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "supabaseId" varchar UNIQUE NOT NULL,
    "email" varchar UNIQUE NOT NULL,
    "username" varchar UNIQUE,
    "password" varchar,
    "name" varchar,
    "phone" varchar,
    "address" text,
    "city" varchar,
    "postalCode" varchar,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX "IDX_users_supabaseId" ON "users" ("supabaseId");
CREATE INDEX "IDX_users_email" ON "users" ("email");
CREATE INDEX "IDX_users_username" ON "users" ("username");

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE "admins" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid UNIQUE NOT NULL,
    "fullName" varchar NOT NULL,
    "permissions" text DEFAULT '',
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_admins_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ============================================
-- DEALERS TABLE
-- ============================================
CREATE TABLE "dealers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid UNIQUE NOT NULL,
    "companyName" varchar NOT NULL,
    "taxNumber" varchar UNIQUE,
    "discountRate" float NOT NULL DEFAULT 0,
    "isActive" boolean NOT NULL DEFAULT true,
    "address" text,
    "phone" varchar,
    "email" varchar,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_dealers_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_dealers_taxNumber" ON "dealers" ("taxNumber");

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE "categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar NOT NULL,
    "slug" varchar UNIQUE NOT NULL,
    "description" text,
    "image" varchar,
    "parentId" uuid,
    "order" integer NOT NULL DEFAULT 0,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_categories_parentId" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_categories_slug" ON "categories" ("slug");
CREATE INDEX "IDX_categories_parentId" ON "categories" ("parentId");

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE "products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar NOT NULL,
    "baseName" varchar,
    "slug" varchar UNIQUE NOT NULL,
    "description" text,
    "shortDescription" text,
    "sku" varchar UNIQUE NOT NULL,
    "price" float NOT NULL,
    "comparePrice" float,
    "costPrice" float,
    "stock" integer NOT NULL DEFAULT 0,
    "trackStock" boolean NOT NULL DEFAULT true,
    "unit" varchar DEFAULT 'g',
    "weight" float,
    "images" text DEFAULT '',
    "isActive" boolean NOT NULL DEFAULT true,
    "isFeatured" boolean NOT NULL DEFAULT false,
    "categoryId" uuid,
    "metaTitle" varchar,
    "metaDescription" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_products_categoryId" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_products_slug" ON "products" ("slug");
CREATE INDEX "IDX_products_categoryId" ON "products" ("categoryId");
CREATE INDEX "IDX_products_isActive_isFeatured" ON "products" ("isActive", "isFeatured");

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE "orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber" varchar UNIQUE NOT NULL,
    "userId" uuid,
    "dealerId" uuid,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" float NOT NULL,
    "tax" float NOT NULL DEFAULT 0,
    "shipping" float NOT NULL DEFAULT 0,
    "discount" float NOT NULL DEFAULT 0,
    "total" float NOT NULL,
    "currency" varchar NOT NULL DEFAULT 'CAD',
    "shippingName" varchar NOT NULL,
    "shippingPhone" varchar NOT NULL,
    "shippingEmail" varchar,
    "shippingAddress" text NOT NULL,
    "shippingProvince" varchar,
    "shippingCity" varchar NOT NULL,
    "shippingPostalCode" varchar,
    "billingName" varchar,
    "billingAddress" text,
    "billingTaxNumber" varchar,
    "notes" text,
    "trackingNumber" varchar,
    "shippedAt" timestamp,
    "deliveredAt" timestamp,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_orders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "FK_orders_dealerId" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE SET NULL
);

CREATE INDEX "IDX_orders_userId" ON "orders" ("userId");
CREATE INDEX "IDX_orders_dealerId" ON "orders" ("dealerId");
CREATE INDEX "IDX_orders_status" ON "orders" ("status");
CREATE INDEX "IDX_orders_orderNumber" ON "orders" ("orderNumber");

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE "order_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "quantity" float NOT NULL,
    "price" float NOT NULL,
    "discount" float NOT NULL DEFAULT 0,
    "total" float NOT NULL,
    "sku" varchar,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_order_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT
);

CREATE INDEX "IDX_order_items_orderId" ON "order_items" ("orderId");
CREATE INDEX "IDX_order_items_productId" ON "order_items" ("productId");

-- ============================================
-- DEALER_PRODUCTS TABLE
-- ============================================
CREATE TABLE "dealer_products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "dealerId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "price" float NOT NULL,
    "discountRate" float NOT NULL DEFAULT 0,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_dealer_products_dealerId" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_dealer_products_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    CONSTRAINT "UQ_dealer_products_dealerId_productId" UNIQUE ("dealerId", "productId")
);

CREATE INDEX "IDX_dealer_products_dealerId" ON "dealer_products" ("dealerId");
CREATE INDEX "IDX_dealer_products_productId" ON "dealer_products" ("productId");

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE "invoices" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoiceNumber" varchar UNIQUE NOT NULL,
    "orderId" uuid NOT NULL,
    "subtotal" float NOT NULL,
    "tax" float NOT NULL DEFAULT 0,
    "shipping" float NOT NULL DEFAULT 0,
    "discount" float NOT NULL DEFAULT 0,
    "total" float NOT NULL,
    "currency" varchar NOT NULL DEFAULT 'CAD',
    "customerName" varchar NOT NULL,
    "customerPhone" varchar,
    "customerAddress" text,
    "customerCity" varchar,
    "customerPostalCode" varchar,
    "billingName" varchar,
    "billingAddress" text,
    "billingTaxNumber" varchar,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_invoices_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_invoices_invoiceNumber" ON "invoices" ("invoiceNumber");
CREATE INDEX "IDX_invoices_orderId" ON "invoices" ("orderId");
CREATE INDEX "IDX_invoices_createdAt" ON "invoices" ("createdAt");

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE "payments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "dealerId" uuid NOT NULL,
    "amount" float NOT NULL,
    "type" "PaymentType" NOT NULL DEFAULT 'CASH',
    "paymentDate" date NOT NULL,
    "description" text,
    "referenceNumber" varchar,
    "checkId" varchar,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_payments_dealerId" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_payments_dealerId" ON "payments" ("dealerId");

-- ============================================
-- CHECKS TABLE
-- ============================================
CREATE TABLE "checks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "dealerId" uuid NOT NULL,
    "amount" float NOT NULL,
    "checkNumber" varchar NOT NULL,
    "bankName" varchar NOT NULL,
    "issueDate" date NOT NULL,
    "dueDate" date NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'PENDING',
    "notes" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "FK_checks_dealerId" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_checks_dealerId" ON "checks" ("dealerId");

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE "settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" varchar UNIQUE NOT NULL,
    "value" text NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: users, admins, dealers, categories, products, orders, order_items, dealer_products, invoices, payments, checks, settings';
END $$;

