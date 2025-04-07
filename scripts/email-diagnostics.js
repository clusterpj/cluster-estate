/**
 * Email Diagnostics Script
 * 
 * This script helps diagnose email delivery issues by sending test emails
 * with various configurations and providing detailed logging.
 */

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function runEmailDiagnostics() {
  console.log('\n🔍 EMAIL DIAGNOSTICS TOOL 🔍');
  console.log('============================');
  
  // Log current email configuration
  console.log('\n📋 CURRENT EMAIL CONFIGURATION:');
  console.log(`EMAIL_SERVER: ${process.env.EMAIL_SERVER || 'Not set'}`); 
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT || 'Not set'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set'}`);
  
  // Create test transporter with detailed logging
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
    debug: true, // Enable debug logging
    logger: true, // Log to console
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  
  try {
    // Verify connection
    console.log('\n🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
  } catch (error) {
    console.error('❌ SMTP connection verification failed:', error);
    console.log('\n🔧 TROUBLESHOOTING TIPS:');
    console.log('1. Check if your email provider allows less secure apps');
    console.log('2. If using Gmail, make sure you\'re using an App Password if 2FA is enabled');
    console.log('3. Verify your credentials are correct');
    console.log('4. Check if your IP is not blocked by the email provider');
    return;
  }
  
  // Test email with various configurations
  const testConfigurations = [
    {
      name: 'Standard Configuration',
      options: {
        from: process.env.EMAIL_USER,
        to: "jisgore@gmail.com", // Temporarily sending to test email
        subject: 'Test Email 1: Standard Configuration',
        text: 'This is a test email with standard configuration.',
        html: '<h1>Test Email 1</h1><p>This is a test email with standard configuration.</p>',
      }
    },
    {
      name: 'With Display Name',
      options: {
        from: `"Cabarete Villas" <${process.env.EMAIL_USER}>`,
        to: "jisgore@gmail.com", // Temporarily sending to test email
        subject: 'Test Email 2: With Display Name',
        text: 'This is a test email with a display name in the from field.',
        html: '<h1>Test Email 2</h1><p>This is a test email with a display name in the from field.</p>',
      }
    },
    {
      name: 'With Headers',
      options: {
        from: process.env.EMAIL_USER,
        to: "jisgore@gmail.com", // Temporarily sending to test email
        subject: 'Test Email 3: With Headers',
        text: 'This is a test email with additional headers.',
        html: '<h1>Test Email 3</h1><p>This is a test email with additional headers.</p>',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'X-Mailer': 'Cabarete Villas Mailer',
        }
      }
    }
  ];
  
  console.log('\n📧 SENDING TEST EMAILS...');
  
  for (const [index, config] of testConfigurations.entries()) {
    try {
      console.log(`\n🔄 Test ${index + 1}: ${config.name}`);
      console.log(`From: ${config.options.from}`);
      console.log(`To: ${config.options.to}`);
      console.log(`Subject: ${config.options.subject}`);
      
      const info = await transporter.sendMail(config.options);
      
      console.log(`✅ Email sent successfully!`);
      console.log(`Message ID: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log('Response:', info.response);
    } catch (error) {
      console.error(`❌ Failed to send test email ${index + 1}:`, error);
    }
  }
  
  console.log('\n🔍 DIAGNOSTICS COMPLETE');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Check your inbox (including Spam/Junk folder) for test emails');
  console.log('2. If emails are in Spam, add the sender to your contacts');
  console.log('3. If no emails were received, check the error messages above');
  console.log('4. Try using a different email provider if Gmail is consistently blocking');
  console.log('5. Consider using a transactional email service like SendGrid or Mailgun for better deliverability');
}

runEmailDiagnostics().catch(console.error);