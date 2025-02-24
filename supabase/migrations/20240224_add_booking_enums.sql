-- Create booking status enum
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'pending',
        'awaiting_approval',
        'confirmed',
        'canceled',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment status enum
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending',
        'authorized',
        'completed',
        'failed',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update bookings table to use enums
ALTER TABLE bookings 
    ALTER COLUMN status TYPE booking_status USING status::booking_status,
    ALTER COLUMN payment_status TYPE payment_status USING payment_status::payment_status;
