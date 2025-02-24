-- Create function to update booking status with history tracking
CREATE OR REPLACE FUNCTION update_booking_status(
  p_booking_id UUID,
  p_new_status TEXT,
  p_reason TEXT,
  p_admin_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status TEXT;
  v_old_payment_status TEXT;
  v_new_payment_status TEXT;
BEGIN
  -- Get current status
  SELECT status, payment_status 
  INTO v_old_status, v_old_payment_status
  FROM bookings 
  WHERE id = p_booking_id;

  -- Determine new payment status based on booking status
  v_new_payment_status := CASE
    WHEN p_new_status = 'confirmed' THEN 'completed'
    WHEN p_new_status = 'canceled' THEN 'refunded'
    ELSE v_old_payment_status
  END;

  -- Update booking status and payment status
  UPDATE bookings 
  SET status = p_new_status,
      payment_status = v_new_payment_status,
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
    p_new_status,
    v_old_payment_status,
    v_new_payment_status,
    p_reason,
    p_admin_id
  );
END;
$$;
