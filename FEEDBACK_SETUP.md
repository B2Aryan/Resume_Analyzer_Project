# ResumePilot Feedback Email Setup

## What's Done
- ✅ Replaced EmailJS with Vercel Serverless Function + Resend
- ✅ Kept existing feedback table & screenshot upload intact
- ✅ Feedback is saved to Supabase first (always succeeds even if email fails)

## Required Vercel Environment Variables
Add this to your Vercel project settings:
- `RESEND_API_KEY`: Your Resend API key from [https://resend.com](https://resend.com)

## Resend Setup
1. Go to [https://resend.com](https://resend.com) and create an account
2. Create a new API key (full access)
3. Verify your domain or use `onboarding@resend.dev` for testing
4. Emails are sent to `aryan639244@gmail.com` (configured in `/api/send-feedback-email.ts`)

## Files Modified/Created
- Created: `/api/send-feedback-email.ts` (Vercel Serverless Function)
- Modified: `/src/components/feedback-modal.tsx` (removed EmailJS, calls API route)
- Deleted: `@emailjs/browser` package
- Installed: `resend` package
- Deleted: `EMAILJS_SETUP.md`
