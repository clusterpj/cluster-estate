import { ExtendedBooking } from '@/types/booking';
import { getEmailService } from './email-service';

/**
 * Sends a booking confirmation email to the user
 * @param booking The booking details
 */
export async function sendBookingConfirmationEmail(booking: ExtendedBooking): Promise<void> {
  try {
    console.log(`Sending booking confirmation email for booking ID: ${booking.id}`);
    
    const emailService = getEmailService();
    const success = await emailService.sendBookingConfirmationEmail(booking);
    
    if (success) {
      console.log(`✅ Booking confirmation email sent successfully for booking ID: ${booking.id}`);
    } else {
      throw new Error('Email service failed to send confirmation email');
    }
  } catch (error) {
    console.error(`Failed to send booking confirmation email for booking ID: ${booking.id}`, error);
    // In production, you might want to log this to an error monitoring service
  }
}
