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
  console.log("=================================================");
  console.log("🚀 EMAIL API CALLED: /api/notify-survey");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("=================================================");

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("=================================================");
  console.log("SURVEY ROUTE EXECUTED");
  console.log("=================================================");
  
  try {
    const body = req.body;
    console.log("SURVEY API HIT", body);
    const { userName, userEmail, userId, submissionTimestamp, answers } = body;

    // Validate required fields
    if (!userName || !userEmail || !userId || !submissionTimestamp || !answers) {
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

    // Format multi-select answers as bullet lists
    const formatAnswer = (answer: string | string[]) => {
      if (Array.isArray(answer)) {
        return `<ul style="margin: 5px 0; padding-left: 20px;">${answer.map(item => `<li>${item}</li>`).join("")}</ul>`;
      }
      return answer;
    };

    // Send email to admin
    try {
      console.log("=================================================");
      console.log("📧 ATTEMPTING TO SEND EMAIL VIA RESEND");
      console.log("From: ResumePilot <onboarding@resend.dev>");
      console.log("To:", adminEmail);
      console.log("Subject: 📊 New Premium Survey Response from " + userName);
      console.log("=================================================");
      
      console.log("Sending email via Resend");
      console.log(`📧 Sending survey notification to ${adminEmail}...`);
      const emailResponse = await resend.emails.send({
        from: "ResumePilot <onboarding@resend.dev>",
        to: adminEmail,
        subject: `📊 New Premium Survey Response from ${userName}`,
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
                .user-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981; }
                .info-item { margin: 8px 0; }
                .label-small { font-weight: 600; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                .value-small { color: #374151; font-size: 14px; margin-top: 2px; word-break: break-word; }
                .question-block { margin: 20px 0; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #2563eb; }
                .question { font-weight: 600; color: #1f2937; font-size: 14px; margin-bottom: 8px; }
                .answer { color: #374151; font-size: 16px; }
                ul { margin: 5px 0; padding-left: 20px; }
                li { margin: 4px 0; }
                .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
                .reward-badge { display: inline-block; background: #10b981; color: white; padding: 6px 12px; border-radius: 12px; font-weight: 600; font-size: 12px; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📊 New Premium Survey Response</h1>
                </div>
                <div class="content">
                  <div class="user-info">
                    <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px;">${userName}</div>
                    
                    <div class="info-item">
                      <div class="label-small">Email Address</div>
                      <div class="value-small">${userEmail}</div>
                    </div>
                    
                    <div class="info-item">
                      <div class="label-small">User ID</div>
                      <div class="value-small"><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${userId}</code></div>
                    </div>
                    
                    <div class="info-item">
                      <div class="label-small">Submitted At</div>
                      <div class="value-small">${new Date(submissionTimestamp).toLocaleString("en-US", {
                        dateStyle: "full",
                        timeStyle: "long",
                      })}</div>
                    </div>
                    
                    <div class="reward-badge">+2 Bonus Analyses Granted</div>
                  </div>
                  
                  <div class="question-block">
                    <div class="question">1. What is your biggest challenge with job applications?</div>
                    <div class="answer">${formatAnswer(answers.biggestChallenge)}</div>
                  </div>
                  
                  <div class="question-block">
                    <div class="question">2. Which Premium features would be most valuable to you?</div>
                    <div class="answer">${formatAnswer(answers.valuableFeatures)}</div>
                  </div>
                  
                  <div class="question-block">
                    <div class="question">3. How disappointed would you be if ResumePilot stopped working tomorrow?</div>
                    <div class="answer">${formatAnswer(answers.disappointmentLevel)}</div>
                  </div>
                  
                  <div class="question-block">
                    <div class="question">4. How much would you realistically pay for Premium?</div>
                    <div class="answer">${formatAnswer(answers.pricePoint)}</div>
                  </div>
                  
                  <div class="question-block">
                    <div class="question">5. Would you buy Premium today if it solved your job application problems?</div>
                    <div class="answer">${formatAnswer(answers.buyToday)}</div>
                  </div>
                  
                  <div class="footer">
                    ResumePilot Premium Survey Notification
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
      
      console.log(`✅ Survey email sent successfully! ID: ${emailResponse.data?.id}`);
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
      console.error("❌ Failed to send survey notification email:", emailError);
      console.error("   Error details:", emailError.message || emailError);
      
      return res.status(200).json({ 
        success: true, 
        warning: "Email notification failed but survey submission succeeded",
        error: emailError.message 
      });
    }
  } catch (error: any) {
    console.error("❌ Survey notification error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
