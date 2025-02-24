-- Create booking status history table
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    old_payment_status TEXT NOT NULL,
    new_payment_status TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT valid_old_booking_status 
        CHECK (old_status IN ('pending', 'awaiting-approval', 'confirmed', 'canceled', 'completed')),
    CONSTRAINT valid_new_booking_status 
        CHECK (new_status IN ('pending', 'awaiting-approval', 'confirmed', 'canceled', 'completed')),
    CONSTRAINT valid_old_payment_status
        CHECK (LOWER(old_payment_status) IN ('pending', 'authorized', 'completed', 'failed', 'refunded')),
    CONSTRAINT valid_new_payment_status
        CHECK (LOWER(new_payment_status) IN ('pending', 'authorized', 'completed', 'failed', 'refunded'))
);
