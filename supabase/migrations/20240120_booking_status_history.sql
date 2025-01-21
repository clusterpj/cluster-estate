-- Create status history table
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  old_payment_status TEXT NOT NULL,
  new_payment_status TEXT NOT NULL,
  payment_id TEXT,
  refund_id TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create webhook events table
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for efficient queries
CREATE INDEX idx_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- Add RLS policies
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own booking history
CREATE POLICY "Users can read their own booking history"
ON booking_status_history
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = booking_status_history.booking_id
    AND bookings.user_id = auth.uid()
  )
);

-- Only allow service role to insert webhook events
CREATE POLICY "Service role can manage webhook events"
ON webhook_events
USING (auth.role() = 'service_role');