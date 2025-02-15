# PayPal Booking Integration

This document explains how the PayPal booking system works in our application.

## Overview

The PayPal booking integration allows users to:
1. Select dates and guests for a property
2. Create a booking record
3. Initiate PayPal payment
4. Handle payment success/failure
5. Update booking status based on payment outcome

## Key Components

### 1. Booking Flow

1. User submits booking form
2. Server creates booking record with status `pending`
3. PayPal order is created
4. User completes payment on PayPal
5. Payment status updates booking record

### 2. Status Management

#### Booking Statuses:
- `pending`: Initial state, awaiting payment
- `confirmed`: Payment completed successfully
- `canceled`: Payment failed or booking canceled
- `completed`: Stay completed

#### Payment Statuses:
- `pending`: Payment initiated
- `completed`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded

### 3. API Endpoints

#### Create Booking
- **Endpoint**: `POST /api/bookings/create`
- **Request Body**:
  ```json
  {
    "checkIn": "2025-01-15",
    "checkOut": "2025-01-20",
    "guests": 2,
    "propertyId": "93857160-c224-4b26-a98b-b692598c1e7c",
    "totalPrice": 500.00
  }
  ```
- **Response**:
  ```json
  {
    "bookingId": "481b5012-618e-43ce-a191-7bb1674752d2",
    "paypalOrderId": "11K60106MB440203S",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=11K60106MB440203S"
  }
  ```

### 4. Environment Variables

Required PayPal configuration:
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_public_client_id
```

### 5. Error Handling

Common errors:
- `400`: Invalid booking data
- `401`: Unauthorized user
- `500`: PayPal or database error

### 6. Testing in Sandbox

1. Use PayPal sandbox accounts
2. Test different payment scenarios:
   - Successful payment
   - Failed payment
   - canceled payment
3. Verify booking status updates

### 7. Implementation Notes

- All monetary values use USD
- Dates are in ISO format (YYYY-MM-DD)
- Booking records are created before PayPal payment
- Status transitions are validated
- Payment failures automatically update booking status

## Troubleshooting

1. **PayPal order creation fails**:
   - Verify PayPal credentials
   - Check network connectivity
   - Validate order amount format

2. **Status transition errors**:
   - Verify current status in database
   - Check status transition rules

3. **Booking creation fails**:
   - Validate all required fields
   - Check database constraints
   - Verify user authentication
