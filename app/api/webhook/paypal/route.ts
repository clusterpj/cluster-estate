import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BookingStatus, PaymentStatus } from '@/types/booking-status';
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '@/lib/emails';
import { updatePropertyAvailability } from '@/lib';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { Json } from '@/types/database.types';

// Define the PayPal webhook payload type
interface PayPalWebhookPayload {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status: string;
    custom_id?: string;
    amount?: {
      value: string;
      currency_code: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Helper function to stringify the payload for database storage
const stringifyPayload = (payload: PayPalWebhookPayload): string => {
  return JSON.stringify(payload);
};

// Create a mapping between BookingStatus enum and database status strings
const mapBookingStatusToDbString = (status: BookingStatus): "pending" | "confirmed" | "expired" | "canceled" | "payment_failed" => {
  switch(status) {
    case BookingStatus.PENDING: return "pending";
    case BookingStatus.CONFIRMED: return "confirmed";
    case BookingStatus.CANCELLED: return "canceled"; // Note the spelling difference (cancelled vs canceled)
    case BookingStatus.COMPLETED: return "confirmed"; // Map to confirmed since there's no "completed" in DB
    case BookingStatus.FAILED: return "payment_failed";
    default: return "pending";
  }
};

export async function POST(req: NextRequest) {
  // Check PayPal webhook headers and verify authenticity
  // This is simplified for the example
  
  try {
    const supabase = createClient();
    const payload = await req.json() as PayPalWebhookPayload;
    const eventType = payload.event_type;
    
    // Log the webhook to the database
    await supabase
      .from('webhooks')
      .insert({
        event_type: eventType,
        payload: stringifyPayload(payload) as Json, // Use the helper to convert to JSON string
        processed: false
      });
    
    // Get the booking ID from the custom_id field if available
    const bookingId = payload.resource.custom_id;
    if (!bookingId) {
      return NextResponse.json({ message: "No booking ID found in payload" }, { status: 200 });
    }
    
    // Fetch the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (bookingError || !booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 200 });
    }
    
    // Process different PayPal event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment was successful
        await updateBookingStatus(
          supabase,
          bookingId,
          booking.status,
          BookingStatus.CONFIRMED,
          booking.payment_status,
          PaymentStatus.COMPLETED,
          payload.resource.id
        );
        
        // Send confirmation email
        await sendBookingConfirmationEmail(booking);
        
        // Update property availability
        await updatePropertyAvailability(booking.property_id, booking.check_in, booking.check_out, true);
        
        break;
      }
      
      case 'PAYMENT.CAPTURE.DENIED': {
        // Payment was denied
        await updateBookingStatus(
          supabase,
          bookingId,
          booking.status,
          BookingStatus.FAILED,
          booking.payment_status,
          PaymentStatus.FAILED
        );
        
        // Send payment failure email
        try {
          const { sendPaymentFailureEmail } = await import('@/lib/emails');
          await sendPaymentFailureEmail(booking, 'Payment was denied by the payment processor');
          console.log(`Payment failure email sent for booking ID: ${bookingId}`);
        } catch (emailError) {
          console.error('Failed to send payment failure email:', emailError);
        }
        
        break;
      }
      
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        // Payment was refunded or reversed
        await updateBookingStatus(
          supabase,
          bookingId,
          booking.status,
          BookingStatus.CANCELLED,
          booking.payment_status,
          PaymentStatus.REFUNDED,
          null,
          payload.resource.id
        );
        
        // Send cancellation email
        await sendBookingCancellationEmail(booking);
        
        // Free up property availability
        await updatePropertyAvailability(booking.property_id, booking.check_in, booking.check_out, false);
        break;
      }
      
      case 'PAYMENT.CAPTURE.DECLINED': {
        // Payment was declined
        await updateBookingStatus(
          supabase,
          bookingId,
          booking.status,
          BookingStatus.CANCELLED,
          booking.payment_status,
          PaymentStatus.FAILED
        );
        
        // Send payment failure email
        try {
          const { sendPaymentFailureEmail } = await import('@/lib/emails');
          await sendPaymentFailureEmail(booking, 'Payment was declined by your financial institution');
          console.log(`Payment failure email sent for booking ID: ${bookingId}`);
        } catch (emailError) {
          console.error('Failed to send payment failure email:', emailError);
        }
        
        break;
      }
      
      // Add other event types as needed
    }
    
    // Mark webhook as processed
    await supabase
      .from('webhooks')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('id', payload.id);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { message: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

/**
 * Updates a booking's status and logs the status change
 */
async function updateBookingStatus(
  supabase: SupabaseClient<Database>,
  bookingId: string,
  oldStatus: string | null,
  newStatus: BookingStatus,
  oldPaymentStatus: string | null,
  newPaymentStatus: PaymentStatus,
  paymentId?: string | null,
  refundId?: string | null,
  reason?: string
) {
  // Convert enum to database-compatible string
  const dbStatus = mapBookingStatusToDbString(newStatus);
  
  // Update the booking's status
  await supabase
    .from('bookings')
    .update({
      status: dbStatus, // Use the mapped status string
      payment_status: newPaymentStatus.toString(), // Convert enum to string
      payment_id: paymentId || null,
      refund_id: refundId || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);
  
  // Log the status change
  await supabase
    .from('booking_status_history')
    .insert({
      booking_id: bookingId,
      old_status: oldStatus || '',
      new_status: dbStatus, // Use the mapped status string
      old_payment_status: oldPaymentStatus || '',
      new_payment_status: newPaymentStatus.toString(), // Convert enum to string
      reason: reason,
      created_at: new Date().toISOString()
    });
}