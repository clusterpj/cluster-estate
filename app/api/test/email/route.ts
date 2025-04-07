import { NextResponse } from 'next/server';
import { getEmailService } from '@/lib/emails';
import { z } from 'zod';

// Define schema for test email data validation
const testEmailSchema = z.object({
  to: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().optional().default('Test Email from Cabarete Villas'),
  message: z.string().optional().default('This is a test email to verify the email service is working correctly.'),
  template: z.enum(['contact_form', 'booking_confirmation', 'booking_approved', 'booking_canceled', 'payment_failed']).optional(),
});

/**
 * Test endpoint for sending emails
 * This is only for testing purposes and should be disabled in production
 */
export async function POST(request: Request) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const result = testEmailSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid test data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { to, subject, message, template } = result.data;
    const emailService = getEmailService();
    let success = false;
    
    // Send test email based on template or as a simple message
    if (template) {
      switch (template) {
        case 'contact_form':
          success = await emailService.sendContactFormEmail({
            name: 'Test User',
            email: to,
            subject: subject,
            message: message,
          });
          break;
          
        case 'booking_confirmation':
        case 'booking_approved':
        case 'booking_canceled':
        case 'payment_failed':
          // Create a mock booking object for testing
          const mockBooking = {
            id: `test-${Date.now()}`,
            user_email: to,
            property_name: 'Test Property',
            check_in: new Date().toISOString(),
            check_out: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            total_price: 1000,
            currency: 'USD',
            guest_name: 'Test Guest',
            status: 'pending',
            payment_status: 'pending',
          };
          
          if (template === 'booking_confirmation') {
            success = await emailService.sendBookingConfirmationEmail(mockBooking);
          } else if (template === 'booking_approved') {
            success = await emailService.sendBookingApprovedEmail(mockBooking);
          } else if (template === 'booking_canceled') {
            success = await emailService.sendBookingCancellationEmail(mockBooking);
          } else if (template === 'payment_failed') {
            success = await emailService.sendPaymentFailureEmail(mockBooking, 'Test payment failure');
          }
          break;
      }
    } else {
      // Send a simple test email
      success = await emailService.sendEmail({
        to,
        subject,
        html: `<h1>Test Email</h1><p>${message}</p>`,
      });
    }
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Test email sent successfully to ${to}`,
      details: {
        to,
        subject,
        template: template || 'basic',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}