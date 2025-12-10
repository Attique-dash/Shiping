# Admin Portal Testing Guide

This guide explains how to test all the admin portal pages and their functionality, including the newly implemented PayPal integration.

## Prerequisites

1. **Environment Variables**: Ensure your `.env.local` file contains:
   ```env
   # PayPal Configuration
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_ENVIRONMENT=sandbox
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
   ```

2. **Database**: Ensure MongoDB and Prisma databases are running and connected.

3. **Dependencies**: Install all required packages:
   ```bash
   npm install
   ```

## Testing Admin Portal Pages

### 1. Admin Dashboard (`/admin`)

**Endpoint**: `GET /admin`

**How to Test**:
- Navigate to `http://localhost:3000/admin`
- Verify the dashboard loads with statistics
- Check that all navigation links work

**Expected Result**: Dashboard displays with overview statistics and navigation sidebar.

---

### 2. Admin POS Page (`/admin/pos`)

**Endpoint**: `POST /api/admin/pos/transactions`

**How to Test**:

1. **Navigate to POS Page**:
   - Go to `http://localhost:3000/admin/pos`
   - Verify the page loads with services, fees, and payment options

2. **Test Regular Payment (Cash/Card)**:
   - Select one or more services (e.g., "Package Receival")
   - Enter customer code (optional)
   - Select payment method: Cash, Card, Visa, Mastercard, etc.
   - Click "Process Payment"
   - Verify success message appears
   - Check that transaction appears in "Recent POS Transactions"

3. **Test PayPal Payment**:
   - Select services
   - Choose "PayPal" from payment method dropdown
   - Click "Process Payment"
   - PayPal button should appear
   - Click PayPal button
   - In sandbox mode, use PayPal test account:
     - Email: `sb-buyer@personal.example.com`
     - Password: (provided by PayPal sandbox)
   - Complete PayPal payment
   - Verify success message
   - Check transaction appears in history

4. **Test Receipt Download**:
   - After successful payment, click "Download Receipt" button
   - Verify receipt downloads as HTML file
   - Open downloaded file and verify it contains:
     - Logo
     - Transaction details
     - Itemized list
     - Total amount

5. **Verify Transaction in Transactions Page**:
   - Navigate to `/admin/transactions`
   - Find the POS transaction you just created
   - Verify amount, method, and status are correct

**Expected Results**:
- All payment methods work correctly
- PayPal integration processes payments
- Receipts download successfully
- Transactions appear in transaction history

---

### 3. Admin Bills Page (`/admin/bills`)

**Endpoint**: 
- `GET /api/admin/bills` - Fetch bills
- `POST /api/admin/bills/pay` - Process payment

**How to Test**:

1. **Navigate to Bills Page**:
   - Go to `http://localhost:3000/admin/bills`
   - Verify bills are displayed (from packages, invoices, and POS)

2. **View Bills**:
   - Check that bills show:
     - Bill number
     - Tracking number
     - Date
     - Branch
     - Due amount, Paid amount, Balance
     - Status (paid/unpaid/partial)

3. **Test Card Payment**:
   - Click "ADD" or "DETAILS" on an unpaid bill
   - Payment modal opens
   - Select "Card" payment method
   - Fill in card details:
     - First Name, Last Name
     - Card Number (use test card: 4111 1111 1111 1111)
     - Expiry (any future date)
     - CVV (any 3 digits)
     - Email, Phone
   - Click "MAKE PAYMENT"
   - Verify success message
   - Check bill status updates to "paid" or "partial"

4. **Test PayPal Payment**:
   - Click "ADD" or "DETAILS" on an unpaid bill
   - Select "PayPal" payment method
   - PayPal button appears
   - Click PayPal button
   - Complete PayPal payment in sandbox
   - Verify success message
   - Check bill status updates

5. **Verify Bill Links**:
   - If bill links to invoice or package, click the link
   - Verify it opens the correct page

**Expected Results**:
- Bills display correctly from all sources (packages, invoices, POS)
- Card payments process successfully
- PayPal payments process successfully
- Bill status updates correctly
- Links to related items work

---

### 4. Admin Transactions Page (`/admin/transactions`)

**Endpoint**: `GET /api/admin/transactions`

**How to Test**:

1. **Navigate to Transactions Page**:
   - Go to `http://localhost:3000/admin/transactions`
   - Verify page loads with transaction list

2. **Verify POS Transactions Appear**:
   - After creating a POS payment, refresh transactions page
   - Find the transaction you created
   - Verify it shows:
     - Correct amount
     - Payment method (cash, card, PayPal, etc.)
     - Status: "completed"
     - Date and time

3. **Test Filters**:
   - Use search box to search by transaction ID, customer code, etc.
   - Filter by type: Sales, Refunds, Purchases, Expenses
   - Filter by status: Completed, Pending, Failed
   - Verify filtered results are correct

4. **Test Date Filtering**:
   - Transactions should be sorted by date (newest first)
   - Verify recent transactions appear at the top

5. **Verify PayPal Transactions**:
   - After processing a PayPal payment (from POS or Bills)
   - Check transactions page
   - Find the PayPal transaction
   - Verify payment method shows "PayPal"
   - Verify status is "completed" or "captured"

6. **Test Transaction Details**:
   - Click the eye icon on any transaction
   - Verify modal shows all transaction details
   - Check all fields are populated correctly

**Expected Results**:
- All transactions (POS, PayPal, Card) appear in the list
- Filters work correctly
- Transaction details are accurate
- PayPal transactions are properly recorded

---

### 5. PayPal Integration Testing

**Endpoints**:
- `POST /api/admin/paypal/create-order` - Create PayPal order
- `POST /api/admin/paypal/capture` - Capture PayPal payment
- `GET /api/admin/paypal/test` - Test PayPal connection

**How to Test**:

1. **Test PayPal Connection**:
   - Navigate to `/admin/transactions`
   - Find "PayPal Integration" section
   - Click "Test PayPal Connection" button
   - Verify success message appears
   - If it fails, check environment variables

2. **Test PayPal Order Creation**:
   - Go to `/admin/pos`
   - Select services and choose PayPal
   - Click "Process Payment"
   - PayPal button should appear
   - Click PayPal button
   - Verify order is created (check browser console for order ID)

3. **Test PayPal Payment Capture**:
   - Complete PayPal payment in sandbox
   - Verify payment is captured
   - Check that transaction is created in database
   - Verify transaction appears in `/admin/transactions`

4. **Test PayPal in Bills**:
   - Go to `/admin/bills`
   - Select a bill and choose PayPal payment
   - Complete PayPal payment
   - Verify bill status updates
   - Verify transaction is recorded

**PayPal Sandbox Test Accounts**:
- Use PayPal Developer Dashboard to create test accounts
- Or use default sandbox buyer account provided by PayPal
- Test with different payment scenarios (success, failure, cancellation)

**Expected Results**:
- PayPal connection test succeeds
- Orders are created correctly
- Payments are captured successfully
- Transactions are recorded in database
- All PayPal transactions appear in transactions page

---

## Common Issues and Solutions

### Issue: Bills page shows "No data"
**Solution**: 
- Check that packages exist in Prisma database
- Verify MongoDB connection for invoices
- Check browser console for errors
- Verify API endpoint `/api/admin/bills` returns data

### Issue: Transactions page shows no data
**Solution**:
- Create a test POS transaction
- Verify MongoDB Payment model is working
- Check that POS transactions are being saved
- Verify API endpoint `/api/admin/transactions` returns data

### Issue: PayPal payment fails
**Solution**:
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
- Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set for frontend
- Verify PayPal environment is set to "sandbox" for testing
- Check browser console for errors
- Test PayPal connection using test endpoint

### Issue: Receipt download doesn't work
**Solution**:
- Check browser console for errors
- Verify receipt HTML is generated correctly
- Check that download function is called
- Verify file download is not blocked by browser

---

## Testing Checklist

- [ ] Admin dashboard loads correctly
- [ ] POS page displays services and fees
- [ ] POS payment with cash/card works
- [ ] POS payment with PayPal works
- [ ] Receipt download works
- [ ] Bills page displays bills from all sources
- [ ] Bill payment with card works
- [ ] Bill payment with PayPal works
- [ ] Transactions page shows all transactions
- [ ] Transaction filters work correctly
- [ ] PayPal connection test succeeds
- [ ] PayPal orders are created correctly
- [ ] PayPal payments are captured
- [ ] All transactions appear in transactions page
- [ ] Links between pages work correctly

---

## Additional Notes

1. **PayPal Sandbox**: Always use sandbox mode for testing. Switch to production only when ready for live payments.

2. **Data Sources**: 
   - Bills aggregate from: Prisma packages, MongoDB invoices, POS transactions
   - Transactions aggregate from: MongoDB Payment model, POS transactions

3. **Payment Methods**:
   - Cash, Card, Visa, Mastercard, Amex, Bank Transfer, Digital Wallet, PayPal

4. **Status Values**:
   - Bills: `paid`, `unpaid`, `partial`
   - Transactions: `completed`, `pending`, `failed`, `captured`, `authorized`, `refunded`

5. **Currency**: Default is USD, but bills may use JMD. PayPal supports multiple currencies.

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify environment variables are set correctly
4. Test API endpoints directly using Postman or curl
5. Check database connections (MongoDB and Prisma)

