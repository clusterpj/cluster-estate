-- Add payment_details column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Create function to update payment status
CREATE OR REPLACE FUNCTION update_payment_status(
  p_booking_id UUID,
  p_new_payment_status TEXT,
  p_payment_details JSONB,
  p_admin_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status TEXT;
  v_old_payment_status TEXT;
BEGIN
  -- Get current status
  SELECT status, payment_status 
  INTO v_old_status, v_old_payment_status
  FROM bookings 
  WHERE id = p_booking_id;

  -- Update booking payment status and details
  UPDATE bookings 
  SET payment_status = p_new_payment_status,
      payment_details = p_payment_details,
      updated_at = NOW(),
      updated_by = p_admin_id
  WHERE id = p_booking_id;

  -- Insert into history table
  INSERT INTO booking_status_history (
    booking_id,
    old_status,
    new_status,
    old_payment_status,
    new_payment_status,
    reason,
    created_by
  ) VALUES (
    p_booking_id,
    v_old_status,
    v_old_status,
    v_old_payment_status,
    p_new_payment_status,
    'Payment status updated by admin',
    p_admin_id
  );
END;
$$;
