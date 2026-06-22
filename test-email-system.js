#!/usr/bin/env node

/**
 * Test script to verify email notification system
 * Run: node test-email-system.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = "aryan639244@gmail.com";

console.log("\n🔍 EMAIL SYSTEM VERIFICATION\n");
console.log("=" .repeat(60));

// Check 1: Resend package installed
console.log("\n1️⃣  Checking Resend package...");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
if (packageJson.dependencies && packageJson.dependencies.resend) {
  console.log(`   ✅ Resend package is installed (${packageJson.dependencies.resend})`);
} else {
  console.log("   ❌ Resend package NOT found in dependencies");
  process.exit(1);
}

// Check 2: Environment variables
console.log("\n2️⃣  Checking environment variables...");
const envPath = path.join(__dirname, ".env");
let RESEND_API_KEY = null;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/RESEND_API_KEY=(.+)/);
  if (match) {
    RESEND_API_KEY = match[1].trim();
  }
}

if (!RESEND_API_KEY) {
  console.log("   ❌ RESEND_API_KEY is NOT set in .env");
  console.log("   Add to .env:");
  console.log("   RESEND_API_KEY=re_xxxxxxxxxxxxx");
} else if (RESEND_API_KEY.includes("YOUR_") || RESEND_API_KEY.includes("HERE")) {
  console.log("   ⚠️  RESEND_API_KEY is set to placeholder value");
  console.log("   Current: " + RESEND_API_KEY);
  console.log("   Replace with actual Resend API key from https://resend.com");
} else {
  console.log("   ✅ RESEND_API_KEY is configured");
  console.log("   Key: " + RESEND_API_KEY.substring(0, 10) + "...");
}

// Check 3: API files exist
console.log("\n3️⃣  Checking API endpoint files...");

const apiFiles = [
  "api/notify-waitlist.ts",
  "api/notify-survey.ts"
];

apiFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} NOT found`);
  }
});

// Check 4: Verify ADMIN_EMAIL environment variable usage
console.log("\n4️⃣  Checking admin email configuration...");

// Check .env file
const envContent = fs.readFileSync(envPath, "utf-8");
const adminEmailMatch = envContent.match(/ADMIN_EMAIL=(.+)/);
if (adminEmailMatch) {
  console.log(`   ✅ .env: ADMIN_EMAIL=${adminEmailMatch[1].trim()}`);
} else {
  console.log("   ❌ ADMIN_EMAIL not found in .env");
}

// Check API files use process.env.ADMIN_EMAIL
apiFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("process.env.ADMIN_EMAIL")) {
      console.log(`   ✅ ${file} uses process.env.ADMIN_EMAIL`);
    }
  }
});

// Check 5: API endpoints are server-side
console.log("\n5️⃣  Verifying API endpoints are server-side...");
apiFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Check for Resend usage
    if (content.includes("import { Resend }") || content.includes("from \"resend\"")) {
      console.log(`   ✅ ${file} imports Resend (server-side)`);
    }
    
    // Check for process.env usage
    if (content.includes("process.env.RESEND_API_KEY")) {
      console.log(`   ✅ ${file} uses process.env (server-side)`);
    }
    
    // Check for error handling
    if (content.includes("if (!process.env.RESEND_API_KEY)")) {
      console.log(`   ✅ ${file} validates RESEND_API_KEY`);
    }
    
    // Check for logging
    if (content.includes("console.log") && content.includes("email")) {
      console.log(`   ✅ ${file} includes logging`);
    }
  }
});

// Check 6: Verify email response structure
console.log("\n6️⃣  Checking email response structure...");
apiFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    
    if (content.includes("emailResponse.data?.id")) {
      console.log(`   ✅ ${file} returns Resend email ID`);
    }
    
    if (content.includes("recipient: adminEmail")) {
      console.log(`   ✅ ${file} returns recipient email`);
    }
  }
});

// Summary
console.log("\n" + "=".repeat(60));
console.log("\n📋 SUMMARY\n");

if (!RESEND_API_KEY || RESEND_API_KEY.includes("YOUR_") || RESEND_API_KEY.includes("HERE")) {
  console.log("⚠️  EMAIL SYSTEM NOT READY");
  console.log("\nRequired Actions:");
  console.log("1. Sign up at https://resend.com");
  console.log("2. Get your API key");
  console.log("3. Add to .env: RESEND_API_KEY=re_xxxxxxxxxxxxx");
  console.log("4. Verify domain or use onboarding@resend.dev for 'from' address");
  console.log("\n⚠️  Until configured, emails will NOT be sent");
  console.log("   (Waitlist/survey signup will still work - no user impact)");
} else {
  console.log("✅ EMAIL SYSTEM CONFIGURED");
  console.log("\nAll emails will be sent to:");
  console.log(`   📧 ${ADMIN_EMAIL}`);
  console.log("\nEmail types:");
  console.log("   • Waitlist notifications (with position tracking)");
  console.log("   • Survey submissions (with full responses)");
  console.log("\nTo test live:");
  console.log("   1. Start dev server: npm run dev");
  console.log("   2. Join waitlist or submit survey");
  console.log("   3. Check server logs for:");
  console.log("      📧 Sending waitlist/survey notification to aryan639244@gmail.com...");
  console.log("      ✅ Email sent successfully! ID: xxx");
  console.log(`   4. Check inbox: ${ADMIN_EMAIL}`);
}

console.log("\n" + "=".repeat(60) + "\n");

