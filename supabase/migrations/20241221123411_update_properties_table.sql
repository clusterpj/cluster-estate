-- Add new columns for property pricing and rental information
DO $$ 
BEGIN
    -- Add listing_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'listing_type') THEN
        ALTER TABLE properties 
        ADD COLUMN listing_type text NOT NULL DEFAULT 'sale' 
        CHECK (listing_type IN ('sale', 'rent', 'both'));
    END IF;

    -- Add sale_price if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'sale_price') THEN
        ALTER TABLE properties ADD COLUMN sale_price numeric;
    END IF;

    -- Add rental_price if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'rental_price') THEN
        ALTER TABLE properties ADD COLUMN rental_price numeric;
    END IF;

    -- Add rental_frequency if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'rental_frequency') THEN
        ALTER TABLE properties 
        ADD COLUMN rental_frequency text 
        CHECK (rental_frequency IN ('daily', 'weekly', 'monthly', 'yearly'));
    END IF;

    -- Add minimum_rental_period if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'minimum_rental_period') THEN
        ALTER TABLE properties ADD COLUMN minimum_rental_period integer;
    END IF;

    -- Add deposit_amount if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'deposit_amount') THEN
        ALTER TABLE properties ADD COLUMN deposit_amount numeric;
    END IF;

    -- Add available_from if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'available_from') THEN
        ALTER TABLE properties ADD COLUMN available_from timestamp with time zone;
    END IF;

    -- Add available_to if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'properties' AND column_name = 'available_to') THEN
        ALTER TABLE properties ADD COLUMN available_to timestamp with time zone;
    END IF;
END $$;

-- Add comments to the new columns
DO $$
BEGIN
    -- Add comment on listing_type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'listing_type') THEN
        COMMENT ON COLUMN properties.listing_type IS 'Type of listing: sale, rent, or both';
    END IF;

    -- Add comment on sale_price if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'sale_price') THEN
        COMMENT ON COLUMN properties.sale_price IS 'Price for sale listings';
    END IF;

    -- Add comment on rental_price if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'rental_price') THEN
        COMMENT ON COLUMN properties.rental_price IS 'Price for rental listings';
    END IF;

    -- Add comment on rental_frequency if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'rental_frequency') THEN
        COMMENT ON COLUMN properties.rental_frequency IS 'Frequency of rental payments';
    END IF;

    -- Add comment on minimum_rental_period if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'minimum_rental_period') THEN
        COMMENT ON COLUMN properties.minimum_rental_period IS 'Minimum rental period in the units specified by rental_frequency';
    END IF;

    -- Add comment on deposit_amount if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'deposit_amount') THEN
        COMMENT ON COLUMN properties.deposit_amount IS 'Security deposit amount for rentals';
    END IF;

    -- Add comment on available_from if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'available_from') THEN
        COMMENT ON COLUMN properties.available_from IS 'Date from which the property is available for rent';
    END IF;

    -- Add comment on available_to if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'available_to') THEN
        COMMENT ON COLUMN properties.available_to IS 'Date until which the property is available for rent';
    END IF;
END $$;

-- Handle the legacy price column
DO $$
BEGIN
    -- Rename price to legacy_price if it hasn't been renamed yet
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'properties' AND column_name = 'price') THEN
        ALTER TABLE properties RENAME COLUMN price TO legacy_price;
        COMMENT ON COLUMN properties.legacy_price IS 'Legacy price column - deprecated in favor of sale_price and rental_price';
    END IF;

    -- Make legacy_price nullable
    ALTER TABLE properties ALTER COLUMN legacy_price DROP NOT NULL;
END $$;

-- Create an index on listing_type for faster filtering
DO $$
BEGIN
    -- Create index on listing_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'properties' 
        AND indexname = 'idx_properties_listing_type'
    ) THEN
        CREATE INDEX idx_properties_listing_type ON properties(listing_type);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;
CREATE POLICY "Enable read access for all users" ON properties
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON properties;
CREATE POLICY "Enable insert for authenticated users only" ON properties
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable update for users based on user_id" ON properties;
CREATE POLICY "Enable update for users based on user_id" ON properties
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON properties;
CREATE POLICY "Enable delete for users based on user_id" ON properties
    FOR DELETE
    USING (auth.uid() = user_id);
