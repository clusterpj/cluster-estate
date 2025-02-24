-- First drop existing constraints
ALTER TABLE bookings 
    DROP CONSTRAINT IF EXISTS valid_booking_status,
    DROP CONSTRAINT IF EXISTS valid_payment_status;

-- Then remove the default values that depend on the enum types
ALTER TABLE bookings 
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN payment_status DROP DEFAULT;

-- Then convert the columns to text
ALTER TABLE bookings 
    ALTER COLUMN status TYPE text USING status::text,
    ALTER COLUMN payment_status TYPE text USING payment_status::text;

-- Now we can safely drop the enum types
DROP TYPE IF EXISTS booking_status;
DROP TYPE IF EXISTS payment_status;

-- Add check constraints to ensure valid values
ALTER TABLE bookings
    ADD CONSTRAINT valid_booking_status 
    CHECK (status IN ('pending', 'awaiting-approval', 'confirmed', 'canceled', 'completed')),
    ADD CONSTRAINT valid_payment_status
    CHECK (LOWER(payment_status) IN ('pending', 'authorized', 'completed', 'failed', 'refunded'));

-- Add back the default values as text
ALTER TABLE bookings
    ALTER COLUMN status SET DEFAULT 'pending',
    ALTER COLUMN payment_status SET DEFAULT 'pending';
