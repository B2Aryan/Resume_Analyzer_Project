import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

// Validate required environment variables
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set in environment variables");
}

if (!process.env.ADMIN_EMAIL) {
  console.error("❌ ADMIN_EMAIL is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("=================================================");
  console.log("WAITLIST ROUTE EXECUTED");
  console.log("=================================================");
  
  try {
    const body = req.body;
    console.log("WAITLIST API HIT", body);
    const { userName, userEmail, userId, joinTimestamp, totalCount, position, sourcePage } = body;

    // Validate required fields
    if (!userName || !userEmail || !userId || !joinTimestamp || totalCount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email system is configured
    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
      console.error("❌ Cannot send email: RESEND_API_KEY or ADMIN_EMAIL not configured");
      return res.status(200).json({ 
        success: true, 
        warning: "Email notification skipped: Email system not configured" 
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    // Send email to admin
    try {
      console.log("Sending email via Resend");
      console.log(`📧 Sending waitlist notification to ${adminEmail}...`);
      const emailResponse = await resend.emails.send({
        from: "ResumePilot <onboarding@resend.dev>",
        to: adminEmail,
        subject: `🎉 New Premium Waitlist Sign-up (#${totalCount})`,
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
                .count-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 18px; margin-right: 10px; }
                .position-badge { display: inline-block; background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 18px; }
                .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 New Premium Waitlist Sign-up</h1>
                </div>
                <div class="content">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <span class="count-badge">Total: ${totalCount} Members</span>
                    ${position ? `<span class="position-badge">Position: #${position}</span>` : ''}
                  </div>
                  
                  <div class="info-row">
                    <div class="label">User Name</div>
                    <div class="value">${userName}</div>
                  </div>
                  
                  <div class="info-row">
                    <div class="label">Email Address</div>
                    <div class="value">${userEmail}</div>
                  </div>
                  
                  <div class="info-row">
                    <div class="label">User ID</div>
                    <div class="value"><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${userId}</code></div>
                  </div>
                  
                  <div class="info-row">
                    <div class="label">Joined At</div>
                    <div class="value">${new Date(joinTimestamp).toLocaleString("en-US", {
                      dateStyle: "full",
                      timeStyle: "long",
                    })}</div>
                  </div>
                  
                  ${sourcePage ? `
                  <div class="info-row">
                    <div class="label">Source Page</div>
                    <div class="value">${sourcePage}</div>
                  </div>
                  ` : ""}
                  
                  <div class="footer">
                    ResumePilot Premium Waitlist Notification
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`✅ Waitlist email sent successfully! ID: ${emailResponse.data?.id}`);
      console.log(`   To: ${adminEmail}`);
      console.log(`   User: ${userName} (${userEmail})`);
      console.log("Resend success:", emailResponse);

      return res.status(200).json({ 
        success: true, 
        emailId: emailResponse.data?.id,
        recipient: adminEmail 
      });
    } catch (emailError: any) {
      // Log error but don't fail the request
      console.error("Resend failure:", emailError);
      console.error("❌ Failed to send waitlist notification email:", emailError);
      console.error("   Error details:", emailError.message || emailError);
      
      return res.status(200).json({ 
        success: true, 
        warning: "Email notification failed but waitlist signup succeeded",
        error: emailError.message 
      });
    }
  } catch (error: any) {
    console.error("❌ Waitlist notification error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
