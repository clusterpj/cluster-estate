import { ExtendedBooking } from '@/types/booking';
import { getEmailService } from './email-service';

/**
 * Sends a booking cancellation email to the user
 * @param booking The booking details
 */
export async function sendBookingCancellationEmail(booking: ExtendedBooking): Promise<void> {
  try {
    console.log(`Sending booking cancellation email for booking ID: ${booking.id}`);
    
    const emailService = getEmailService();
    const success = await emailService.sendBookingCancellationEmail(booking);
    
    if (success) {
      console.log(`✅ Booking cancellation email sent successfully for booking ID: ${booking.id}`);
    } else {
      throw new Error('Email service failed to send cancellation email');
    }
  } catch (error) {
    console.error(`Failed to send booking cancellation email for booking ID: ${booking.id}`, error);
    // In production, you might want to log this to an error monitoring service
  }
}

/**
 * Sends a notification to the property owner about a booking cancellation
 * @param booking The booking details
 * @param ownerEmail The property owner's email
 */
export async function sendOwnerCancellationNotification(booking: ExtendedBooking, ownerEmail: string): Promise<void> {
  try {
    console.log(`Sending cancellation notification to owner for booking ID: ${booking.id}`);
    
    const emailService = getEmailService();
    
    // Create owner-specific email content
    const checkIn = new Date(booking.check_in).toLocaleDateString();
    const checkOut = new Date(booking.check_out).toLocaleDateString();
    
    const html = `
      <h2>Booking Cancellation Notification</h2>
      <p>A booking for your property has been canceled.</p>
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Property:</strong> ${booking.property_name || 'Your property'}</p>
      <p><strong>Guest:</strong> ${booking.guest_name || 'Guest'}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Total Amount:</strong> ${booking.currency || 'USD'} ${booking.total_price}</p>
    `;
    
    const success = await emailService.sendEmail({
      to: ownerEmail,
      subject: `Booking Cancellation: ${booking.property_name || 'Property'}`,
      html
    });
    
    if (success) {
      console.log(`✅ Owner cancellation notification sent successfully for booking ID: ${booking.id}`);
    } else {
      throw new Error('Email service failed to send owner notification');
    }
  } catch (error) {
    console.error(`Failed to send owner cancellation notification for booking ID: ${booking.id}`, error);
  }
}
