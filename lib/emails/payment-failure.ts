import { ExtendedBooking } from '@/types/booking';
import { getEmailService } from './email-service';

/**
 * Sends a payment failure notification email to the user
 * @param booking The booking details
 * @param errorMessage Optional error message explaining the failure
 */
export async function sendPaymentFailureEmail(booking: ExtendedBooking, errorMessage?: string): Promise<void> {
  try {
    console.log(`Sending payment failure email for booking ID: ${booking.id}`);
    
    const emailService = getEmailService();
    
    // Create payment failure specific email content
    const checkIn = new Date(booking.check_in).toLocaleDateString();
    const checkOut = new Date(booking.check_out).toLocaleDateString();
    
    const html = `
      <h2>Payment Processing Issue</h2>
      <p>We encountered an issue processing the payment for your booking.</p>
      ${errorMessage ? `<p><strong>Reason:</strong> ${errorMessage}</p>` : ''}
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Property:</strong> ${booking.property_name || 'Property'}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Total Amount:</strong> ${booking.currency || 'USD'} ${booking.total_price}</p>
      <h3>What to do next:</h3>
      <p>Please check your payment method and try again, or contact us for assistance.</p>
      <p>Your booking will remain in our system for 24 hours, after which it will be automatically canceled if payment is not completed.</p>
    `;
    
    const success = await emailService.sendEmail({
      to: booking.user_email || '',
      subject: 'Payment Processing Issue - Action Required',
      html
    });
    
    if (success) {
      console.log(`✅ Payment failure email sent successfully for booking ID: ${booking.id}`);
    } else {
      throw new Error('Email service failed to send payment failure email');
    }
  } catch (error) {
    console.error(`Failed to send payment failure email for booking ID: ${booking.id}`, error);
    // In production, you might want to log this to an error monitoring service
  }
}