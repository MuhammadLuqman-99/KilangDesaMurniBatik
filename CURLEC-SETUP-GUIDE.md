# Curlec Payment Gateway Integration Guide

## Overview

This guide explains how to set up and use the Curlec (Razorpay Malaysia) payment gateway integration for Kilang Desa Murni Batik e-commerce platform.

## Prerequisites

1. **Curlec Account**: Sign up at [https://curlec.com](https://curlec.com)
2. **API Keys**: Get your API keys from the Curlec Dashboard
3. **Webhook Secret**: Configure webhooks in your Curlec Dashboard

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file or Docker environment:

```bash
# Payment Provider (set to "curlec" to enable)
PAYMENT_PROVIDER=curlec

# Curlec API Credentials
CURLEC_KEY_ID=rzp_test_xxxxxxxxxxxx        # Your Curlec Key ID
CURLEC_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx  # Your Curlec Key Secret
CURLEC_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx      # Webhook signing secret
CURLEC_IS_SANDBOX=true                      # Set to false for production
```

### Getting API Keys

1. Log in to [Curlec Dashboard](https://dashboard.curlec.com)
2. Navigate to **Account & Settings** → **API Keys**
3. Generate new keys or use existing ones
4. For testing, use **Test Mode** keys
5. For production, switch to **Live Mode** and generate live keys

## Payment Flow

### 1. Initiate Payment (Backend)

```go
// POST /api/v1/payment/initiate
// Request Body: { "order_id": "uuid-here" }

// Response:
{
    "curlec_order_id": "order_xxxxx",
    "amount": 10000,  // Amount in sen (RM 100.00)
    "currency": "MYR",
    "checkout_options": {
        "key": "rzp_test_xxxx",
        "amount": 10000,
        "currency": "MYR",
        "name": "Kilang Desa Murni Batik",
        "order_id": "order_xxxxx",
        "prefill": {
            "name": "Customer Name",
            "email": "customer@email.com",
            "contact": "+60123456789"
        }
    },
    "payment_id": "uuid-here"
}
```

### 2. Frontend Checkout

```javascript
// Include Razorpay script
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Initialize checkout
const options = response.checkout_options;
options.handler = function(response) {
    // Send to backend for verification
    verifyPayment({
        order_id: orderUUID,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
    });
};
options.modal = {
    ondismiss: function() {
        // Handle payment cancelled
    }
};

const rzp = new Razorpay(options);
rzp.open();
```

### 3. Verify Payment (Backend)

```go
// POST /api/v1/payment/verify
// Request Body:
{
    "order_id": "uuid-here",
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "razorpay_signature": "xxxxx"
}

// Response:
{
    "success": true,
    "transaction_id": "pay_xxxxx",
    "message": "Payment successful",
    "payment_id": "uuid-here"
}
```

## API Endpoints

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payment/initiate` | Initiate Curlec payment |
| POST | `/api/v1/payment/verify` | Verify payment after checkout |
| POST | `/api/v1/payment/webhook` | Handle Curlec webhooks |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/orders/:id/refund` | Process refund |
| GET | `/api/v1/admin/payments` | List all payments |
| GET | `/api/v1/admin/payments/:id` | Get payment details |

## Webhook Configuration

### Setting Up Webhooks

1. Go to Curlec Dashboard → **Webhooks**
2. Add new webhook URL: `https://yourdomain.com/api/v1/payment/webhook`
3. Select events to subscribe:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.created`
   - `refund.processed`
4. Copy the webhook secret and add to `CURLEC_WEBHOOK_SECRET`

### Webhook Events Handled

| Event | Description |
|-------|-------------|
| `payment.captured` | Payment successfully captured |
| `payment.failed` | Payment failed |
| `order.paid` | Order fully paid |
| `refund.created` | Refund initiated |
| `refund.processed` | Refund completed |

## Payment Methods Supported

Curlec supports the following payment methods in Malaysia:

### FPX (Online Banking)
- All major Malaysian banks
- Real-time bank transfers

### Credit/Debit Cards
- Visa
- Mastercard
- American Express

### E-Wallets
- Touch 'n Go
- GrabPay
- Boost
- ShopeePay

## Testing

### Test Cards

| Card Number | Description |
|-------------|-------------|
| 4111 1111 1111 1111 | Successful payment |
| 4000 0000 0000 0002 | Declined card |
| 4000 0000 0000 9995 | Insufficient funds |

### Test FPX

Use any test bank in sandbox mode. All transactions will succeed.

### Test Mode vs Live Mode

- **Test Mode**: Use `rzp_test_*` keys, no real transactions
- **Live Mode**: Use `rzp_live_*` keys, real money transfers

## Refunds

### Full Refund

```bash
# POST /api/v1/admin/orders/{order_id}/refund
{
    "reason": "Customer requested refund"
}
```

### Partial Refund

```bash
# POST /api/v1/admin/orders/{order_id}/refund
{
    "amount": 50.00,  # Amount in MYR
    "reason": "Partial refund for damaged item"
}
```

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `BAD_REQUEST_ERROR` | Invalid request | Check request parameters |
| `GATEWAY_ERROR` | Payment gateway error | Retry or contact support |
| `SERVER_ERROR` | Internal server error | Check logs |

### Signature Verification Failed

If you see "Invalid signature" errors:
1. Ensure `CURLEC_KEY_SECRET` is correct
2. Check that the signature is being passed correctly from frontend
3. Verify the order_id and payment_id match

## Security Best Practices

1. **Never expose API keys** in frontend code
2. **Always verify signatures** before processing payments
3. **Use HTTPS** for all payment endpoints
4. **Validate webhook signatures** to prevent spoofing
5. **Log all payment events** for audit trail
6. **Set up alerts** for failed payments

## Monitoring & Logs

### Payment Logs

Check application logs for payment events:

```bash
docker logs kilang-order 2>&1 | grep -i "curlec\|payment"
```

### Curlec Dashboard

Monitor payments in real-time:
1. Go to [Curlec Dashboard](https://dashboard.curlec.com)
2. Navigate to **Transactions** → **Payments**
3. Filter by date, status, or payment method

## Troubleshooting

### Payment Not Completing

1. Check browser console for JavaScript errors
2. Verify API keys are correct
3. Check if order exists and is in pending status
4. Review application logs

### Webhook Not Receiving Events

1. Verify webhook URL is accessible from internet
2. Check webhook secret is configured correctly
3. Review Curlec webhook logs in dashboard
4. Ensure firewall allows incoming requests

### Refund Failing

1. Verify payment was successful (status: completed)
2. Check if refund amount doesn't exceed payment amount
3. Ensure Curlec payment ID is stored correctly
4. Review Curlec refund policies

## Support

- **Curlec Support**: support@curlec.com
- **Documentation**: https://curlec.com/docs
- **Dashboard**: https://dashboard.curlec.com

---

## Quick Start Checklist

- [ ] Create Curlec account
- [ ] Get API keys (test mode first)
- [ ] Configure environment variables
- [ ] Set up webhook endpoint
- [ ] Test payment flow in sandbox
- [ ] Test refund flow
- [ ] Switch to live mode for production
- [ ] Monitor payments in dashboard
