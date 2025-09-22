-- CreateEnum
CREATE TYPE "public"."DifficultyLevel" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "profile_picture_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."userroles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "userroles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "public"."useruserroles" (
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "useruserroles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "public"."recipes" (
    "recipe_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "instructions" TEXT NOT NULL,
    "prep_time_minutes" INTEGER,
    "cook_time_minutes" INTEGER,
    "servings" INTEGER,
    "image_url" VARCHAR(500),
    "cuisine_type" VARCHAR(100),
    "difficulty_level" "public"."DifficultyLevel",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_public" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("recipe_id")
);

-- CreateTable
CREATE TABLE "public"."searchhistory" (
    "search_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "raw_query" TEXT NOT NULL,
    "llm_parsed_ingredients" JSONB,
    "llm_parsed_cuisine" VARCHAR(100),
    "llm_parsed_dietary_prefs" JSONB,
    "llm_response_summary" TEXT,
    "search_timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "llm_model_used" VARCHAR(100),
    "llm_api_cost" DECIMAL(10,4),

    CONSTRAINT "searchhistory_pkey" PRIMARY KEY ("search_id")
);

-- CreateTable
CREATE TABLE "public"."searchrecommendations" (
    "recommendation_id" UUID NOT NULL,
    "search_id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "llm_score" DECIMAL(5,2),
    "rank" INTEGER,
    "reasoning" TEXT,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clicked_at" TIMESTAMPTZ(6),

    CONSTRAINT "searchrecommendations_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "userroles_role_name_key" ON "public"."userroles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "searchrecommendations_search_id_recipe_id_key" ON "public"."searchrecommendations"("search_id", "recipe_id");

-- AddForeignKey
ALTER TABLE "public"."useruserroles" ADD CONSTRAINT "useruserroles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."useruserroles" ADD CONSTRAINT "useruserroles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."userroles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."searchhistory" ADD CONSTRAINT "searchhistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."searchrecommendations" ADD CONSTRAINT "searchrecommendations_search_id_fkey" FOREIGN KEY ("search_id") REFERENCES "public"."searchhistory"("search_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."searchrecommendations" ADD CONSTRAINT "searchrecommendations_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE CASCADE ON UPDATE CASCADE;
