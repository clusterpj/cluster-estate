'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Test Email from Cabarete Villas');
  const [template, setTemplate] = useState('');
  const [message, setMessage] = useState('This is a test email to verify the email service is working correctly.');
  const [result, setResult] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ 
    status: 'idle', 
    message: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setResult({
        status: 'error',
        message: 'Please enter a recipient email address'
      });
      return;
    }
    
    try {
      setResult({
        status: 'loading',
        message: 'Sending email...'
      });
      
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject,
          message,
          template: template || undefined
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          status: 'success',
          message: `Success: ${data.message}\n\nDetails: ${JSON.stringify(data.details, null, 2)}`
        });
      } else {
        setResult({
          status: 'error',
          message: `Error: ${data.error}\n\nDetails: ${JSON.stringify(data.details || {}, null, 2)}`
        });
      }
    } catch (error) {
      setResult({
        status: 'error',
        message: `Error: ${error.message}`
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b border-gray-200 mb-4">Email Testing Tool</h1>
      <p className="mb-6">Use this tool to test the email functionality in your local environment.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-1">Recipient Email:</label>
          <input 
            type="email" 
            id="email" 
            className="w-full p-2 border border-gray-300 rounded" 
            placeholder="Enter recipient email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="subject" className="block font-medium mb-1">Subject:</label>
          <input 
            type="text" 
            id="subject" 
            className="w-full p-2 border border-gray-300 rounded" 
            placeholder="Email subject" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="template" className="block font-medium mb-1">Email Template:</label>
          <select 
            id="template" 
            className="w-full p-2 border border-gray-300 rounded"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="">Basic Test Email</option>
            <option value="contact_form">Contact Form</option>
            <option value="booking_confirmation">Booking Confirmation</option>
            <option value="booking_approved">Booking Approved</option>
            <option value="booking_canceled">Booking Canceled</option>
            <option value="payment_failed">Payment Failed</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="block font-medium mb-1">Message:</label>
          <textarea 
            id="message" 
            className="w-full p-2 border border-gray-300 rounded min-h-[100px]" 
            placeholder="Email message content"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={result.status === 'loading'}
        >
          {result.status === 'loading' ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>
      
      {result.status !== 'idle' && (
        <div 
          className={`mt-6 p-4 rounded whitespace-pre-wrap ${
            result.status === 'success' ? 'bg-green-100 border border-green-300' : 
            result.status === 'error' ? 'bg-red-100 border border-red-300' : 
            'bg-gray-100 border border-gray-300'
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="text-lg font-semibold mb-2">Testing Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Enter your email address in the recipient field</li>
          <li>Select an email template to test or leave as "Basic Test Email"</li>
          <li>Click "Send Test Email" button</li>
          <li>Check your inbox for the test email (also check spam folder)</li>
          <li>If you don't receive the email, check the server logs for errors</li>
        </ol>
      </div>
    </div>
  );
}