import nodemailer from 'nodemailer';
import { ExtendedBooking } from '@/types/booking';

// Define email template types
export type EmailTemplate = 
  | 'contact_form'
  | 'booking_confirmation'
  | 'booking_approved'
  | 'booking_canceled'
  | 'payment_failed';

// Interface for email data
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
}

// Interface for contact form data
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Email service for sending various types of emails
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;
  private adminEmail: string;

  constructor() {
    // Initialize the transporter with Gmail SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        // These should be added to the environment variables and config
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '', // Use app password for Gmail
      },
      // Add additional configuration for better deliverability
      tls: {
        rejectUnauthorized: false // Helps with some TLS issues
      },
      // Set a higher timeout for SMTP connections
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Set default sender and admin recipient
    // Make sure the FROM address matches exactly with the authenticated email account
    this.defaultFrom = process.env.EMAIL_FROM || 'Cluster Estate <noreply@clusterestate.com>';
    this.adminEmail = process.env.ADMIN_EMAIL || 'reservecabaretevillas@gmail.com';
    
    // Verify SMTP connection on initialization
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   * @private
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
    }
  }

  /**
   * Send an email
   * @param emailData The email data to send
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Ensure the from address matches the authenticated email account for better deliverability
      const from = emailData.from || this.defaultFrom;
      // If the from address doesn't include the email username, use the authenticated email
      const fromEmail = from.includes('<') ? from : `${from} <${process.env.EMAIL_USER}>`;
      
      const mailOptions = {
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text || this.createTextVersion(emailData.html), // Always include a text version
        html: emailData.html,
        replyTo: emailData.replyTo || process.env.EMAIL_USER,
        // Add headers to improve deliverability
        headers: {
          'X-Priority': '1', // High priority
          'X-MSMail-Priority': 'High',
          'Importance': 'High'
        }
      };

      console.log(`Sending email to: ${emailData.to}`);
      console.log(`Email subject: ${emailData.subject}`);
      console.log(`From address: ${fromEmail}`);
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`Delivery info:`, info);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
  
  /**
   * Create a plain text version from HTML content
   * @private
   */
  private createTextVersion(html: string): string {
    // Simple conversion from HTML to plain text
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Send contact form submission to admin
   * @param formData The contact form data
   */
  async sendContactFormEmail(formData: ContactFormData): Promise<boolean> {
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Subject:</strong> ${formData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message.replace(/\n/g, '<br>')}</p>
    `;

    return this.sendEmail({
      to: this.adminEmail,
      subject: `Contact Form: ${formData.subject}`,
      html,
      replyTo: formData.email,
    });
  }

  /**
   * Send booking confirmation email to guest
   * @param booking The booking details
   */
  async sendBookingConfirmationEmail(booking: ExtendedBooking): Promise<boolean> {
    if (!booking.user_email) {
      console.error('Cannot send confirmation email: No user email provided');
      return false;
    }

    const checkIn = new Date(booking.check_in).toLocaleDateString();
    const checkOut = new Date(booking.check_out).toLocaleDateString();
    
    const html = `
      <h2>Booking Confirmation</h2>
      <p>Thank you for your booking with Cluster Estate!</p>
      <p>Your booking is currently awaiting approval. We'll notify you once it's been reviewed.</p>
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Property:</strong> ${booking.property_name || 'Property'}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Total Amount:</strong> ${booking.currency || 'USD'} ${booking.total_price}</p>
      <p>If you have any questions, please contact us.</p>
      <p>Thank you for choosing Cluster Estate!</p>
    `;

    // Send to guest
    const guestEmailSent = await this.sendEmail({
      to: booking.user_email,
      subject: 'Your Booking Confirmation',
      html,
    });

    // Also notify admin about the new booking
    const adminHtml = `
      <h2>New Booking Received</h2>
      <p>A new booking has been received and is awaiting approval.</p>
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Guest:</strong> ${booking.guest_name || 'Guest'}</p>
      <p><strong>Guest Email:</strong> ${booking.user_email}</p>
      <p><strong>Property:</strong> ${booking.property_name || 'Property'}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Total Amount:</strong> ${booking.currency || 'USD'} ${booking.total_price}</p>
      <p>Please review this booking in the admin dashboard.</p>
    `;

    const adminEmailSent = await this.sendEmail({
      to: this.adminEmail,
      subject: 'New Booking Received - Action Required',
      html: adminHtml,
    });

    return guestEmailSent && adminEmailSent;
  }

  /**
   * Send booking approval notification to guest
   * @param booking The booking details
   */
  async sendBookingApprovedEmail(booking: ExtendedBooking): Promise<boolean> {
    if (!booking.user_email) {
      console.error('Cannot send approval email: No user email provided');
      return false;
    }

    const checkIn = new Date(booking.check_in).toLocaleDateString();
    const checkOut = new Date(booking.check_out).toLocaleDateString();
    
    const html = `
      <h2>Booking Approved!</h2>
      <p>Great news! Your booking has been approved and confirmed.</p>
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Property:</strong> ${booking.property_name || 'Property'}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p><strong>Total Amount:</strong> ${booking.currency || 'USD'} ${booking.total_price}</p>
      <h3>Next Steps:</h3>
      <p>Please make note of your check-in details. We look forward to hosting you!</p>
      <p>If you have any questions or special requests before your stay, please don't hesitate to contact us.</p>
      <p>Thank you for choosing Cluster Estate!</p>
    `;

    return this.sendEmail({
      to: booking.user_email,
      subject: 'Your Booking Has Been Approved',
      html,
    });
  }

  /**
   * Send booking cancellation email to guest
   * @param booking The booking details
   * @param reason Optional reason for cancellation
   */
  async sendBookingCancellationEmail(booking: ExtendedBooking, reason?: string): Promise<boolean> {
    if (!booking.user_email) {
      console.error('Cannot send cancellation email: No user email provided');
      return false;
    }

    const checkIn = new Date(booking.check_in).toLocaleDateString();
    const checkOut = new Date(booking.check_out).toLocaleDateString();
    
    const html = `
      <h2>Booking Cancellation</h2>
      <p>We're sorry to inform you that your booking has been canceled.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <h3>Booking Details:</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Property:</strong> ${booking.property_name || 'Property'}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      <p>Your payment has been refunded. Please allow 5-7 business days for the refund to appear in your account.</p>
      <p>If you have any questions, please contact us.</p>
    `;

    return this.sendEmail({
      to: booking.user_email,
      subject: 'Your Booking Has Been Canceled',
      html,
    });
  }

  /**
   * Send payment failure notification to guest
   * @param booking The booking details
   * @param errorMessage Optional error message explaining the failure
   */
  async sendPaymentFailureEmail(booking: ExtendedBooking, errorMessage?: string): Promise<boolean> {
    if (!booking.user_email) {
      console.error('Cannot send payment failure email: No user email provided');
      return false;
    }

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

    return this.sendEmail({
      to: booking.user_email,
      subject: 'Payment Processing Issue - Action Required',
      html,
    });
  }
}

// Create a singleton instance
let emailServiceInstance: EmailService | null = null;

/**
 * Get the email service instance
 */
export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}