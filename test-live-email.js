#!/usr/bin/env node

/**
 * Live Email Test - Simulates actual API call to test Resend integration
 * Run: node test-live-email.js
 */

import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n📧 LIVE EMAIL TEST\n");
console.log("=" .repeat(60));

// Load environment variables
const envPath = path.join(__dirname, ".env");
let RESEND_API_KEY = null;
let ADMIN_EMAIL = null;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  
  const keyMatch = envContent.match(/RESEND_API_KEY=(.+)/);
  if (keyMatch) {
    RESEND_API_KEY = keyMatch[1].trim();
  }
  
  const emailMatch = envContent.match(/ADMIN_EMAIL=(.+)/);
  if (emailMatch) {
    ADMIN_EMAIL = emailMatch[1].trim();
  }
}

// Validate configuration
console.log("\n1️⃣  Validating Configuration...");

if (!RESEND_API_KEY || RESEND_API_KEY.includes("YOUR_") || RESEND_API_KEY.includes("HERE")) {
  console.log("   ❌ RESEND_API_KEY is not configured properly");
  console.log("   Please add a real API key to .env");
  process.exit(1);
}

if (!ADMIN_EMAIL) {
  console.log("   ❌ ADMIN_EMAIL is not configured");
  process.exit(1);
}

console.log(`   ✅ RESEND_API_KEY: ${RESEND_API_KEY.substring(0, 10)}...`);
console.log(`   ✅ ADMIN_EMAIL: ${ADMIN_EMAIL}`);

// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

// Test: Send a test waitlist notification
console.log("\n2️⃣  Sending Test Waitlist Email...");

const testData = {
  userName: "Test User (Automated Test)",
  userEmail: "test.user@example.com",
  userId: "test-user-id-12345",
  joinTimestamp: new Date().toISOString(),
  totalCount: 42,
  position: 42,
  sourcePage: "/coming-soon (Automated Test)"
};

console.log("   📤 Sending email to Resend API...");
console.log(`   📧 Recipient: ${ADMIN_EMAIL}`);

try {
  const emailResponse = await resend.emails.send({
    from: "ResumePilot <onboarding@resend.dev>",
    to: ADMIN_EMAIL,
    subject: `🧪 TEST: Waitlist Notification (#${testData.totalCount})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-row { margin: 15px 0; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #2563eb; }
            .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 16px; color: #111827; margin-top: 4px; word-break: break-word; }
            .test-badge { display: inline-block; background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 TEST: Waitlist Notification</h1>
            </div>
            <div class="content">
              <div class="test-badge">⚠️ AUTOMATED TEST EMAIL</div>
              
              <div class="info-row">
                <div class="label">User Name</div>
                <div class="value">${testData.userName}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Email Address</div>
                <div class="value">${testData.userEmail}</div>
              </div>
              
              <div class="info-row">
                <div class="label">User ID</div>
                <div class="value"><code>${testData.userId}</code></div>
              </div>
              
              <div class="info-row">
                <div class="label">Position in Waitlist</div>
                <div class="value">#${testData.position} of ${testData.totalCount}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Source Page</div>
                <div class="value">${testData.sourcePage}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Timestamp</div>
                <div class="value">${new Date(testData.joinTimestamp).toLocaleString()}</div>
              </div>
              
              <p style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <strong>🧪 This is a test email</strong><br>
                If you received this, your email notification system is working correctly!
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  console.log("\n✅ EMAIL SENT SUCCESSFULLY!\n");
  console.log("=" .repeat(60));
  console.log("\n📊 RESEND API RESPONSE:\n");
  console.log(`   Email ID: ${emailResponse.data?.id || 'N/A'}`);
  console.log(`   Recipient: ${ADMIN_EMAIL}`);
  console.log(`   Status: ${emailResponse.error ? 'Failed' : 'Accepted'}`);
  
  if (emailResponse.error) {
    console.log(`   Error: ${emailResponse.error.message}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n✅ CHECK YOUR INBOX!\n");
  console.log(`   📧 Email sent to: ${ADMIN_EMAIL}`);
  console.log("   📬 Subject: 🧪 TEST: Waitlist Notification (#42)");
  console.log("   ⏱️  May take 1-2 minutes to arrive");
  console.log("\n" + "=".repeat(60) + "\n");

  process.exit(0);

} catch (error) {
  console.log("\n❌ EMAIL SEND FAILED!\n");
  console.log("=" .repeat(60));
  console.log("\n🔴 ERROR DETAILS:\n");
  console.log(`   Message: ${error.message}`);
  console.log(`   Type: ${error.name}`);
  
  if (error.statusCode) {
    console.log(`   Status Code: ${error.statusCode}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n💡 TROUBLESHOOTING:\n");
  console.log("   1. Verify RESEND_API_KEY is correct");
  console.log("   2. Check API key permissions at https://resend.com/api-keys");
  console.log("   3. Verify 'from' domain is configured in Resend");
  console.log("   4. Or use 'onboarding@resend.dev' as from address for testing");
  console.log("\n" + "=".repeat(60) + "\n");
  
  process.exit(1);
}
