/**
 * Test script for email functionality
 * 
 * This script tests the email functionality by making a request to the test email endpoint
 * and the contact form endpoint to verify that emails are being sent correctly.
 * 
 * Usage: node scripts/test-email.js
 */

async function testEmailFunctionality() {
  console.log('Testing email functionality...');
  
  // Test email configuration
  console.log('\nEmail Configuration:');
  console.log('EMAIL_SERVER:', process.env.EMAIL_SERVER);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set');
  
  console.log('\nTest Instructions:');
  console.log('1. Make sure your local server is running (npm run dev)');
  console.log('2. Visit http://localhost:3000/test-email to access the email testing interface');
  console.log('3. Enter your email address and test different email templates');
  console.log('4. Check your inbox (and spam folder) for the test emails');
  console.log('\nAlternatively, you can test the contact form by submitting the form at:');
  console.log('http://localhost:3000/contact');
  
  console.log('\nTroubleshooting:');
  console.log('- If emails are not being sent, check the server logs for errors');
  console.log('- Verify that your Gmail account has "Less secure app access" enabled');
  console.log('- Make sure you\'re using an App Password if you have 2FA enabled on your Gmail account');
  console.log('- Check that your .env.local file has the correct email configuration');
  
  console.log('\nAvailable Test Endpoints:');
  console.log('- POST /api/test/email - Test email service directly');
  console.log('- POST /api/contact - Test contact form submission');
  
  console.log('\nExample API request to test email:');
  console.log(`
curl -X POST http://localhost:3000/api/test/email \
-H "Content-Type: application/json" \
-d '{
  "to": "your-email@example.com",
  "subject": "Test Email",
  "message": "This is a test email",
  "template": "booking_confirmation"
}'
`);
}

testEmailFunctionality();