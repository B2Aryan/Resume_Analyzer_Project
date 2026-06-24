import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Validate required environment variables
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set in environment variables");
}

if (!process.env.ADMIN_EMAIL) {
  console.error("❌ ADMIN_EMAIL is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("=================================================");
  console.log("🚀 EMAIL API CALLED: /api/notify-waitlist");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("=================================================");

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
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
    console.log("========== ENV DEBUG ==========");
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("ADMIN_EMAIL exists:", !!process.env.ADMIN_EMAIL);
    console.log("RESEND_API_KEY length:", process.env.RESEND_API_KEY?.length || 0);
    console.log("ADMIN_EMAIL value:", process.env.ADMIN_EMAIL || "MISSING");
    console.log("================================");
    
    if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) {
      console.error("❌ Cannot send email: RESEND_API_KEY or ADMIN_EMAIL not configured");
      return res.status(200).json({ 
        success: true, 
        warning: "Email notification skipped: Email system not configured" 
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    // ==================== SERVER-SIDE STATISTICS ====================
    // Calculate real waitlist count and position using service role key
    // Frontend values are ignored because RLS prevents accurate counting
    console.log("=================================================");
    console.log("📊 CALCULATING SERVER-SIDE WAITLIST STATISTICS");
    console.log("=================================================");

    let serverTotalCount = 0;
    let serverPosition = 0;

    try {
      // Create Supabase admin client (bypasses RLS)
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("❌ Supabase credentials not configured");
        console.error("VITE_SUPABASE_URL exists:", !!supabaseUrl);
        console.error("SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceRoleKey);
        // Continue with default values (0, 0)
      } else {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        console.log("✅ Supabase admin client created");

        // Get total count (all rows, bypasses RLS)
        const { count: totalCountResult, error: countError } = await supabaseAdmin
          .from("premium_interest")
          .select("*", { count: "exact", head: true });

        if (countError) {
          console.error("❌ Failed to get server total count:", countError);
        } else {
          serverTotalCount = totalCountResult || 0;
          console.log("✅ SERVER TOTAL COUNT:", serverTotalCount);
        }

        // Get user's position (count rows with created_at <= joinTimestamp)
        const { count: positionResult, error: positionError } = await supabaseAdmin
          .from("premium_interest")
          .select("*", { count: "exact", head: true })
          .lte("created_at", joinTimestamp);

        if (positionError) {
          console.error("❌ Failed to get server position:", positionError);
        } else {
          serverPosition = positionResult || 0;
          console.log("✅ SERVER POSITION:", serverPosition);
        }
      }
    } catch (statsError) {
      console.error("❌ Error calculating server statistics:", statsError);
      // Continue with default values (0, 0)
    }

    console.log("=================================================");
    console.log("📊 FINAL STATISTICS:");
    console.log("SERVER TOTAL COUNT:", serverTotalCount);
    console.log("SERVER POSITION:", serverPosition);
    console.log("Frontend values ignored:", totalCount, position);
    console.log("=================================================");
    // ==================== END SERVER-SIDE STATISTICS ====================

    // Send email to admin
    try {
      console.log("=================================================");
      console.log("📧 ATTEMPTING TO SEND EMAIL VIA RESEND");
      console.log("From: ResumePilot <noreply@resumepilot.site>");
      console.log("To:", adminEmail);
      console.log("Subject: 🎉 New Premium Waitlist Sign-up (#" + serverTotalCount + ")");
      console.log("=================================================");
      
      console.log("Sending email via Resend");
      console.log(`📧 Sending waitlist notification to ${adminEmail}...`);
      const emailResponse = await resend.emails.send({
        from: "ResumePilot <noreply@resumepilot.site>",
        to: adminEmail,
        subject: `🎉 New Premium Waitlist Sign-up (#${serverTotalCount})`,
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
                    <span class="count-badge">Total: ${serverTotalCount} Members</span>
                    ${serverPosition ? `<span class="position-badge">Position: #${serverPosition}</span>` : ''}
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

      console.log("=================================================");
      console.log("✅ RESEND SUCCESS");
      console.log("Email ID:", emailResponse.data?.id);
      console.log("=================================================");
      
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
      console.error("=================================================");
      console.error("❌ RESEND ERROR");
      console.error("Error:", emailError);
      console.error("Error message:", emailError.message);
      console.error("Error stack:", emailError.stack);
      console.error("=================================================");
      
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
