

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."bookingstatus" AS ENUM (
    'pending',
    'confirmed',
    'modified',
    'canceled'
);


ALTER TYPE "public"."bookingstatus" OWNER TO "postgres";


CREATE TYPE "public"."propertyTypeEnums" AS ENUM (
    'house',
    'villa',
    'condo',
    'lot'
);


ALTER TYPE "public"."propertyTypeEnums" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_by_id"("user_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN (
        SELECT row_to_json(p.*)
        FROM profiles p
        WHERE p.id = user_id
    );
END;
$$;


ALTER FUNCTION "public"."get_profile_by_id"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN (
        SELECT role::text
        FROM auth.users
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_booking_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_booking_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_calendar_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_calendar_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  profile_exists boolean;
begin
  -- Check if profile already exists
  select exists(
    select 1 from public.profiles where id = new.id
  ) into profile_exists;

  -- Only create profile if it doesn't exist
  if not profile_exists then
    insert into public.profiles (
      id,
      email,
      full_name,
      created_at,
      updated_at
    ) values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      now(),
      now()
    );
  end if;

  return new;
exception when others then
  -- Log the error details
  raise warning 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."moddatetime"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."moddatetime"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
 BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
 END;
 $$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile"("user_id" "uuid", "profile_data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    UPDATE profiles
    SET 
        first_name = COALESCE((profile_data->>'first_name')::text, first_name),
        last_name = COALESCE((profile_data->>'last_name')::text, last_name),
        phone = COALESCE((profile_data->>'phone')::text, phone),
        notifications = COALESCE((profile_data->>'notifications')::boolean, notifications),
        newsletter = COALESCE((profile_data->>'newsletter')::boolean, newsletter),
        marketing_emails = COALESCE((profile_data->>'marketing_emails')::boolean, marketing_emails),
        property_alerts = COALESCE((profile_data->>'property_alerts')::boolean, property_alerts),
        preferred_language = COALESCE((profile_data->>'preferred_language')::text, preferred_language),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_profile"("user_id" "uuid", "profile_data" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."booking_status_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_id" "uuid",
    "old_status" "text" NOT NULL,
    "new_status" "text" NOT NULL,
    "old_payment_status" "text" NOT NULL,
    "new_payment_status" "text" NOT NULL,
    "payment_id" "text",
    "refund_id" "text",
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."booking_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "property_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "check_in" timestamp with time zone NOT NULL,
    "check_out" timestamp with time zone NOT NULL,
    "guests" integer NOT NULL,
    "total_price" numeric NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_id" "text",
    "payment_status" "text",
    "special_requests" "text",
    "calendar_event_id" "uuid",
    "timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "recurrence_rule" "text",
    "is_external" boolean DEFAULT false NOT NULL,
    "external_source" "text",
    "external_id" "text",
    CONSTRAINT "bookings_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"]))),
    CONSTRAINT "bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'canceled'::"text", 'completed'::"text"]))),
    CONSTRAINT "check_external_consistency" CHECK (((("is_external" = true) AND ("external_source" IS NOT NULL) AND ("external_id" IS NOT NULL)) OR (("is_external" = false) AND ("external_source" IS NULL) AND ("external_id" IS NULL)))),
    CONSTRAINT "valid_dates" CHECK (("check_out" > "check_in"))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_sync" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "property_id" "uuid",
    "feed_url" "text" NOT NULL,
    "feed_type" "text" NOT NULL,
    "sync_enabled" boolean DEFAULT true,
    "sync_frequency" integer NOT NULL,
    "last_sync_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "calendar_sync_feed_type_check" CHECK (("feed_type" = ANY (ARRAY['import'::"text", 'export'::"text"]))),
    CONSTRAINT "calendar_sync_sync_frequency_check" CHECK (("sync_frequency" > 0))
);


ALTER TABLE "public"."calendar_sync" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "avatar_url" "text",
    "role" "text" DEFAULT 'user'::"text",
    "phone" "text",
    "bio" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'agent'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "legacy_price" numeric,
    "location" "text" NOT NULL,
    "bedrooms" integer NOT NULL,
    "bathrooms" integer NOT NULL,
    "square_feet" numeric NOT NULL,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "features" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'available'::"text",
    "user_id" "uuid" NOT NULL,
    "featured" boolean DEFAULT false,
    "listing_type" "text" DEFAULT 'sale'::"text" NOT NULL,
    "sale_price" numeric,
    "rental_price" numeric,
    "rental_frequency" "text",
    "minimum_rental_period" integer,
    "deposit_amount" numeric,
    "available_from" timestamp with time zone,
    "available_to" timestamp with time zone,
    "property_type" "text" DEFAULT 'text'::"text",
    "default_timezone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "calendar_settings" "jsonb",
    "pets_allowed" boolean DEFAULT false,
    "pet_restrictions" "text"[],
    "pet_deposit" numeric,
    CONSTRAINT "properties_listing_type_check" CHECK (("listing_type" = ANY (ARRAY['sale'::"text", 'rent'::"text", 'both'::"text"]))),
    CONSTRAINT "properties_rental_frequency_check" CHECK (("rental_frequency" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'monthly'::"text", 'yearly'::"text"]))),
    CONSTRAINT "properties_status_check" CHECK (("status" = ANY (ARRAY['available'::"text", 'pending'::"text", 'sold'::"text", 'rented'::"text"])))
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


COMMENT ON COLUMN "public"."properties"."legacy_price" IS 'Legacy price column - deprecated in favor of sale_price and rental_price';



COMMENT ON COLUMN "public"."properties"."listing_type" IS 'Type of listing: sale, rent, or both';



COMMENT ON COLUMN "public"."properties"."sale_price" IS 'Price for sale listings';



COMMENT ON COLUMN "public"."properties"."rental_price" IS 'Price for rental listings';



COMMENT ON COLUMN "public"."properties"."rental_frequency" IS 'Frequency of rental payments';



COMMENT ON COLUMN "public"."properties"."minimum_rental_period" IS 'Minimum rental period in the units specified by rental_frequency';



COMMENT ON COLUMN "public"."properties"."deposit_amount" IS 'Security deposit amount for rentals';



COMMENT ON COLUMN "public"."properties"."available_from" IS 'Date from which the property is available for rent';



COMMENT ON COLUMN "public"."properties"."available_to" IS 'Date until which the property is available for rent';



COMMENT ON COLUMN "public"."properties"."property_type" IS 'Property Types: house, villa, condo or lot';



COMMENT ON COLUMN "public"."properties"."pets_allowed" IS 'Whether pets are allowed in the property';



COMMENT ON COLUMN "public"."properties"."pet_restrictions" IS 'Array of specific pet restrictions (e.g., ["no dogs over 30lbs", "cats only"])';



COMMENT ON COLUMN "public"."properties"."pet_deposit" IS 'Additional security deposit required for pets';



CREATE TABLE IF NOT EXISTS "public"."property_availability_rules" (
    "id" "uuid" NOT NULL,
    "property_id" "uuid",
    "rule_type" "text",
    "start_date" "date",
    "end_date" "date",
    "pattern" "jsonb"
);


ALTER TABLE "public"."property_availability_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_rates" (
    "id" "uuid" NOT NULL,
    "property_id" "uuid",
    "start_date" "date",
    "end_date" "date",
    "rate" numeric,
    "min_stay" integer
);


ALTER TABLE "public"."property_rates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "property_id" "uuid",
    "title_en" "text",
    "description_en" "text",
    "title_es" "text",
    "description_es" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."property_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "processed" boolean DEFAULT false,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone
);


ALTER TABLE "public"."webhook_events" OWNER TO "postgres";


ALTER TABLE ONLY "public"."booking_status_history"
    ADD CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calendar_sync"
    ADD CONSTRAINT "calendar_sync_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_availability_rules"
    ADD CONSTRAINT "property_availability_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_rates"
    ADD CONSTRAINT "property_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_translations"
    ADD CONSTRAINT "property_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_translations"
    ADD CONSTRAINT "property_translations_property_id_key" UNIQUE ("property_id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_bookings_calendar_event_id" ON "public"."bookings" USING "btree" ("calendar_event_id");



CREATE INDEX "idx_bookings_dates" ON "public"."bookings" USING "btree" ("check_in", "check_out");



CREATE INDEX "idx_bookings_external" ON "public"."bookings" USING "btree" ("external_source", "external_id");



CREATE INDEX "idx_bookings_property_id" ON "public"."bookings" USING "btree" ("property_id");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("status");



CREATE INDEX "idx_bookings_user_id" ON "public"."bookings" USING "btree" ("user_id");



CREATE INDEX "idx_calendar_sync_property_id" ON "public"."calendar_sync" USING "btree" ("property_id");



CREATE INDEX "idx_properties_listing_type" ON "public"."properties" USING "btree" ("listing_type");



CREATE INDEX "idx_status_history_booking_id" ON "public"."booking_status_history" USING "btree" ("booking_id");



CREATE INDEX "idx_webhook_events_processed" ON "public"."webhook_events" USING "btree" ("processed");



CREATE INDEX "idx_webhook_events_type" ON "public"."webhook_events" USING "btree" ("event_type");



CREATE INDEX "profiles_user_id_idx" ON "public"."profiles" USING "btree" ("id");



CREATE OR REPLACE TRIGGER "handle_bookings_updated_at" BEFORE UPDATE ON "public"."bookings" FOR EACH ROW EXECUTE FUNCTION "public"."handle_booking_updated_at"();



CREATE OR REPLACE TRIGGER "handle_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_property_translations_updated_at" BEFORE UPDATE ON "public"."property_translations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."calendar_sync" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



ALTER TABLE ONLY "public"."booking_status_history"
    ADD CONSTRAINT "booking_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_status_history"
    ADD CONSTRAINT "booking_status_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."calendar_sync"
    ADD CONSTRAINT "calendar_sync_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."property_availability_rules"
    ADD CONSTRAINT "property_availability_rules_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id");



ALTER TABLE ONLY "public"."property_rates"
    ADD CONSTRAINT "property_rates_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id");



ALTER TABLE ONLY "public"."property_translations"
    ADD CONSTRAINT "property_translations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to insert/update" ON "public"."property_translations" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow public read access" ON "public"."property_translations" FOR SELECT USING (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."properties" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."properties" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable property owners to manage calendar syncs" ON "public"."calendar_sync" USING ((EXISTS ( SELECT 1
   FROM "public"."properties" "p"
  WHERE (("p"."id" = "calendar_sync"."property_id") AND ("p"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."properties" "p"
  WHERE (("p"."id" = "calendar_sync"."property_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enable read access for all users" ON "public"."properties" FOR SELECT USING (true);



CREATE POLICY "Enable service role to read calendar syncs" ON "public"."calendar_sync" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Enable update for users based on user_id" ON "public"."properties" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Property owners can view bookings for their properties" ON "public"."bookings" FOR SELECT USING (("auth"."uid"() IN ( SELECT "properties"."user_id"
   FROM "public"."properties"
  WHERE ("properties"."id" = "bookings"."property_id"))));



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public properties are viewable by everyone" ON "public"."properties" FOR SELECT USING (true);



CREATE POLICY "Service role can manage webhook events" ON "public"."webhook_events" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can create their own bookings" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own bookings" ON "public"."bookings" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own properties" ON "public"."properties" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own bookings" ON "public"."bookings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own properties" ON "public"."properties" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own booking history" ON "public"."booking_status_history" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."bookings"
  WHERE (("bookings"."id" = "booking_status_history"."booking_id") AND ("bookings"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can read their own bookings" ON "public"."bookings" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update featured status of their own properties" ON "public"."properties" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own bookings" ON "public"."bookings" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own properties" ON "public"."properties" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own bookings" ON "public"."bookings" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."booking_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_sync" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































































































































GRANT ALL ON FUNCTION "public"."get_profile_by_id"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_by_id"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_by_id"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_booking_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_booking_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_booking_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_calendar_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_calendar_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_calendar_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."moddatetime"() TO "anon";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile"("user_id" "uuid", "profile_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile"("user_id" "uuid", "profile_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile"("user_id" "uuid", "profile_data" "jsonb") TO "service_role";





















GRANT ALL ON TABLE "public"."booking_status_history" TO "anon";
GRANT ALL ON TABLE "public"."booking_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_sync" TO "anon";
GRANT ALL ON TABLE "public"."calendar_sync" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_sync" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."properties" TO "anon";
GRANT ALL ON TABLE "public"."properties" TO "authenticated";
GRANT ALL ON TABLE "public"."properties" TO "service_role";



GRANT ALL ON TABLE "public"."property_availability_rules" TO "anon";
GRANT ALL ON TABLE "public"."property_availability_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."property_availability_rules" TO "service_role";



GRANT ALL ON TABLE "public"."property_rates" TO "anon";
GRANT ALL ON TABLE "public"."property_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."property_rates" TO "service_role";



GRANT ALL ON TABLE "public"."property_translations" TO "anon";
GRANT ALL ON TABLE "public"."property_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."property_translations" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_events" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
