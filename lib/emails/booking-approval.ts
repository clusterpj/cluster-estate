import { ExtendedBooking } from '@/types/booking';
import { getEmailService } from './email-service';

/**
 * Sends a booking approval email to the user
 * @param booking The booking details
 */
export async function sendBookingApprovalEmail(booking: ExtendedBooking): Promise<void> {
  try {
    console.log(`Sending booking approval email for booking ID: ${booking.id}`);
    
    const emailService = getEmailService();
    const success = await emailService.sendBookingApprovedEmail(booking);
    
    if (success) {
      console.log(`✅ Booking approval email sent successfully for booking ID: ${booking.id}`);
    } else {
      throw new Error('Email service failed to send approval email');
    }
  } catch (error) {
    console.error(`Failed to send booking approval email for booking ID: ${booking.id}`, error);
    // In production, you might want to log this to an error monitoring service
  }
}