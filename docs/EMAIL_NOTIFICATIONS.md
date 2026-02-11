# Email Notifications Implementation

## Overview

Email notification functionality has been integrated into the Smartplan Anskaffelse application. The system supports multiple email backends and sends automated emails for key events in the tender process.

## Features

### Email Types

1. **New Tender Invitations**
   - Sent when suppliers are invited to a tender
   - Includes tender details, deadline, and link to view tender

2. **Deadline Reminders**
   - Sent 3 days and 1 day before tender deadline
   - Reminds suppliers who haven't submitted bids yet
   - Can also notify tender creators

3. **Bid Submissions**
   - Sent to tender creator when a new bid is submitted
   - Includes bid details and link to view tender

4. **Contract Signing Requests**
   - Sent to supplier when a contract is generated
   - Includes contract details and link to sign contract

## Architecture

### Email Service (`src/api/emailService.js`)

The email service supports multiple backends:

1. **SendGrid API** (Direct)
   - Uses SendGrid API key for direct email sending
   - Configured via `VITE_SENDGRID_API_KEY` environment variable

2. **Firebase Functions** (HTTP Callable)
   - Calls a Firebase Cloud Function endpoint
   - Configured via `VITE_EMAIL_FUNCTION_URL` environment variable

3. **Firebase Extensions Trigger Email**
   - Creates documents in Firestore `emails` collection
   - Requires Firebase Extensions "Trigger Email" extension to be installed
   - Automatically triggered when documents are created

### Deadline Reminder Service (`src/api/deadlineReminderService.js`)

Handles scheduled deadline reminders:
- Checks all open tenders for upcoming deadlines
- Sends reminders at configured intervals (default: 3 days and 1 day before)
- Can be called manually or scheduled via Cloud Scheduler

## Configuration

### Environment Variables

Add these to your `.env` file or deployment environment:

```env
# Email Configuration
VITE_EMAIL_ENABLED=true                    # Enable/disable email sending (default: true)
VITE_SENDGRID_API_KEY=your_sendgrid_key    # SendGrid API key (optional)
VITE_EMAIL_FUNCTION_URL=https://...         # Firebase Function URL (optional)
VITE_EMAIL_FROM=noreply@smartplan.no       # From email address
VITE_EMAIL_FROM_NAME=Smartplan Anskaffelse # From name
VITE_APP_URL=https://your-app-url.com       # Base URL for email links
```

### Email Backend Priority

The service tries backends in this order:
1. SendGrid (if `VITE_SENDGRID_API_KEY` is set)
2. Firebase Function (if `VITE_EMAIL_FUNCTION_URL` is set)
3. Firebase Extension (fallback, creates Firestore document)

## Integration Points

### Tender Service
- **`createTender`**: Sends invitation emails when tender is created with invited suppliers (if status is not "draft")
- **`addSupplierInvitation`**: Sends invitation email when supplier is invited
- **`submitBid`**: Sends bid submission email to tender creator

### Contract Service
- **`generateContract`**: Sends contract signing request email to supplier

### Deadline Reminder Service
- **`checkAndSendDeadlineReminders`**: Checks all open tenders and sends reminders
- **`sendRemindersForTender`**: Sends reminders for a specific tender
- **`sendRemindersForTenderId`**: Sends reminders for a tender by ID

## Usage

### Manual Email Sending

```javascript
import { sendTenderInvitationEmail } from './api/emailService';

await sendTenderInvitationEmail(
    'supplier@example.com',
    tender,
    'Supplier Name'
);
```

### Deadline Reminders

```javascript
import { checkAndSendDeadlineReminders } from './api/deadlineReminderService';

// Check all open tenders and send reminders
const results = await checkAndSendDeadlineReminders({
    reminderDays: [3, 1],           // Send reminders 3 days and 1 day before
    sendToInvitedSuppliers: true,   // Send to invited suppliers
    sendToCreator: false,            // Don't send to tender creator
    status: 'open',                 // Only check open tenders
});
```

### Scheduled Reminders

To set up scheduled reminders, create a Firebase Cloud Function or Cloud Scheduler job:

```javascript
// Firebase Cloud Function example
exports.checkDeadlineReminders = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const { checkAndSendDeadlineReminders } = require('./deadlineReminderService');
        return await checkAndSendDeadlineReminders();
    });
```

## Testing

### Dev Tools

Email testing is available in the Compliance page (`/compliance`):

1. Navigate to the Compliance page
2. Scroll to "E-post Tester" section
3. Enter your email address
4. Click "Kjør alle e-post tester"
5. Review test results

The tester will:
- Send test emails for all email types
- Test deadline reminder service
- Show success/failure for each test
- Display any errors encountered

### Manual Testing

You can test individual email functions:

```javascript
// Test invitation email
await sendTenderInvitationEmail('test@example.com', mockTender, 'Test Supplier');

// Test deadline reminder
await sendDeadlineReminderEmail('test@example.com', mockTender, 3);

// Test bid submission
await sendBidSubmissionEmail('test@example.com', mockTender, mockBid);

// Test contract signing
await sendContractSigningRequestEmail('test@example.com', mockContract, mockTender);
```

## Email Templates

All emails use a consistent HTML template with:
- Branded header with "Smartplan Anskaffelse"
- Responsive design
- Clear call-to-action buttons
- Footer with disclaimer

Templates are generated in `generateEmailTemplate()` function in `emailService.js`.

## Error Handling

- Email sending failures are logged but don't block the main operation
- Errors are caught and logged with warnings
- Failed emails don't prevent:
  - Tender creation
  - Bid submission
  - Contract generation
  - Invitation creation

## Development Mode

In development, if `VITE_EMAIL_ENABLED=false`:
- Email sending is skipped
- Email data is logged to console
- Operations continue normally

## Production Setup

### Option 1: SendGrid

1. Sign up for SendGrid account
2. Create API key
3. Set `VITE_SENDGRID_API_KEY` environment variable
4. Verify sender email address in SendGrid

### Option 2: Firebase Functions

1. Create Firebase Cloud Function for email sending
2. Set `VITE_EMAIL_FUNCTION_URL` to function URL
3. Function should accept POST requests with email data

### Option 3: Firebase Extensions

1. Install "Trigger Email" extension from Firebase Console
2. Configure extension with your email service
3. No additional configuration needed (uses Firestore)

## Troubleshooting

### Emails Not Sending

1. Check `VITE_EMAIL_ENABLED` is not set to `false`
2. Verify backend configuration (API key, function URL, etc.)
3. Check browser console for errors
4. Verify email addresses are valid
5. Check backend service logs (SendGrid dashboard, Firebase Functions logs)

### Deadline Reminders Not Working

1. Ensure tenders have valid deadline dates
2. Check tender status is "open"
3. Verify reminder service is being called (manually or scheduled)
4. Check that suppliers have email addresses in invitations

### Email Template Issues

- Templates are HTML-based and should work in most email clients
- Test in multiple email clients (Gmail, Outlook, etc.)
- Check responsive design on mobile devices

## Future Enhancements

Potential improvements:
- Email preferences per user (opt-in/opt-out)
- Email templates customization
- Batch email sending for multiple recipients
- Email delivery tracking
- Bounce handling
- Unsubscribe functionality

## Summary

Email notifications are now fully integrated and will automatically send emails for:
- ✅ New tender invitations
- ✅ Deadline reminders (3 days, 1 day before)
- ✅ Bid submissions
- ✅ Contract signing requests

All email functionality is available in dev tools for testing, and the system gracefully handles failures without blocking core operations.

