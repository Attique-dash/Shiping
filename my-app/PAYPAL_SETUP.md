# PayPal Setup Instructions

## Environment Variables

Add the following to your `.env.local` file (or `.env` file):

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=ATEU-7dFENoPO8oaT3cg5xNjnGUbvODwTDHV1mfriTfUd_HDfoU8xPN0clZzbkLqaZaHzeVN1QZaixB9
PAYPAL_CLIENT_SECRET=EFCsNFkbzgQh7OZaoCYFVuWegEx0rYPrYyrQOBW2prZI4keKj8c8JDhMsgxPYx20zMIyw8qfmtx5xI4V
PAYPAL_ENVIRONMENT=sandbox

# PayPal Client ID for frontend (if needed)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ATEU-7dFENoPO8oaT3cg5xNjnGUbvODwTDHV1mfriTfUd_HDfoU8xPN0clZzbkLqaZaHzeVN1QZaixB9
```

## Testing PayPal Connection

1. Go to Admin Portal → Transactions page
2. Click "Test PayPal Connection" button in the PayPal Integration section
3. You should see a success message if PayPal is configured correctly

## Payment Processing

PayPal payments are processed through:
- `/api/admin/bills/pay` - For bill payments
- `/api/admin/paypal/capture` - For capturing PayPal orders
- `/api/admin/paypal/sync` - For syncing PayPal transactions

## Notes

- Current environment is set to `sandbox` for testing
- Change `PAYPAL_ENVIRONMENT=production` when ready for live payments
- All PayPal transactions are automatically recorded in the system

