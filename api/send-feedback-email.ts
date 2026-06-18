import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert line breaks to <br> tags
function formatMessage(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

// Get badge color based on feedback type
function getBadgeColor(type: string): { bg: string; text: string } {
  switch (type) {
    case "Bug Report":
      return { bg: "#ef4444", text: "#ffffff" }; // Red
    case "Feature Request":
      return { bg: "#8b5cf6", text: "#ffffff" }; // Purple
    case "Improvement Suggestion":
      return { bg: "#3b82f6", text: "#ffffff" }; // Blue
    case "General Feedback":
    default:
      return { bg: "#6b7280", text: "#ffffff" }; // Gray
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log("API START");
  
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body;
    console.log("Request body:", body);
    
    const {
      feedback_type,
      message,
      user_name,
      user_email,
      user_id,
      page_url,
      contact_me,
      screenshot_url,
      submission_timestamp,
    } = body;

    const badgeColors = getBadgeColor(feedback_type);
    const formattedMessage = formatMessage(message);

    const subject = `[ResumePilot] New ${feedback_type} Feedback`;

    console.log("Sending email...");
    const { data, error } = await resend.emails.send({
      from: "ResumePilot Feedback <onboarding@resend.dev>",
      to: "aryan639244@gmail.com",
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="x-apple-disable-message-reformatting">
          <title>${subject}</title>
          <!--[if mso]>
          <style>
            table {border-collapse: collapse;}
            td {padding: 0;}
          </style>
          <![endif]-->
        </head>
        <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',Arial,sans-serif;">
          <center style="width:100%;background-color:#f8fafc;padding:32px 16px;">
            <div style="max-width:600px;width:100%;">
              <div style="background-color:#ffffff;border-radius:16px;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px -1px rgba(0,0,0,0.1);padding:32px;">
                
                <!-- Header -->
                <div style="text-align:center;margin-bottom:32px;">
                  <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;margin-bottom:16px;">
                    ResumePilot
                  </div>
                  <h1 style="margin:0;font-size:26px;font-weight:700;color:#0f172a;line-height:1.3;">
                    New Feedback Received
                  </h1>
                </div>

                <!-- Badge -->
                <div style="text-align:center;margin-bottom:32px;">
                  <span style="display:inline-block;padding:8px 20px;border-radius:9999px;font-size:14px;font-weight:600;background-color:${badgeColors.bg};color:${badgeColors.text};letter-spacing:0.025em;">
                    ${escapeHtml(feedback_type)}
                  </span>
                </div>

                <!-- Main Info Rows -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                      <span style="font-size:14px;color:#64748b;font-weight:500;display:inline-block;width:140px;">User Name:</span>
                      <span style="font-size:16px;color:#0f172a;font-weight:600;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(user_name || "Not provided")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                      <span style="font-size:14px;color:#64748b;font-weight:500;display:inline-block;width:140px;">User Email:</span>
                      <span style="font-size:16px;color:#0f172a;font-weight:600;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(user_email || "Not provided")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                      <span style="font-size:14px;color:#64748b;font-weight:500;display:inline-block;width:140px;">Contact Requested:</span>
                      <span style="font-size:16px;color:#0f172a;font-weight:600;">${escapeHtml(contact_me || "No")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;">
                      <span style="font-size:14px;color:#64748b;font-weight:500;display:inline-block;width:140px;">Page URL:</span>
                      <span style="font-size:16px;color:#0f172a;font-weight:600;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(page_url || "Not provided")}</span>
                    </td>
                  </tr>
                </table>

                <!-- Feedback Message -->
                <div style="margin-bottom:24px;">
                  <div style="font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">
                    Feedback Message
                  </div>
                  <div style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
                    <div style="margin:0;color:#0f172a;font-size:17px;line-height:1.7;word-break:break-word;overflow-wrap:anywhere;">
                      ${formattedMessage}
                    </div>
                  </div>
                </div>

                <!-- Screenshot Section -->
                ${screenshot_url ? `
                  <div style="margin-bottom:24px;">
                    <div style="font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">
                      Screenshot
                    </div>
                    <center>
                      <a href="${escapeHtml(screenshot_url)}" target="_blank" style="text-decoration:none;">
                        <img src="${escapeHtml(screenshot_url)}" alt="Feedback Screenshot" style="max-width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;display:block;">
                      </a>
                    </center>
                    <center style="margin-top:16px;">
                      <a href="${escapeHtml(screenshot_url)}" target="_blank" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;text-align:center;">
                        Open Full-Size Screenshot
                      </a>
                    </center>
                  </div>
                ` : `
                  <div style="margin-bottom:24px;">
                    <div style="font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">
                      Screenshot
                    </div>
                    <div style="font-size:15px;color:#64748b;font-style:italic;background-color:#f8fafc;border:1px dashed #cbd5e1;border-radius:12px;padding:24px;text-align:center;">
                      No screenshot attached
                    </div>
                  </div>
                `}

                <!-- Technical Metadata Section -->
                <div style="margin-bottom:24px;">
                  <div style="font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">
                    Technical Metadata
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:12px;padding:20px;border:1px solid #f1f5f9;">
                    <tr>
                      <td style="padding:8px 0;">
                        <span style="font-size:13px;color:#64748b;font-weight:500;display:inline-block;width:120px;">User ID:</span>
                        <span style="font-size:14px;color:#334155;font-weight:500;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(user_id || "Not provided")}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <span style="font-size:13px;color:#64748b;font-weight:500;display:inline-block;width:120px;">Submitted At:</span>
                        <span style="font-size:14px;color:#334155;font-weight:500;">${escapeHtml(submission_timestamp)}</span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Footer -->
                <div style="text-align:center;padding-top:24px;border-top:1px solid #f1f5f9;color:#64748b;font-size:13px;">
                  <div style="margin-bottom:4px;">ResumePilot Feedback System</div>
                  <div style="font-size:12px;">Automatically generated notification</div>
                </div>

              </div>
            </div>
          </center>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        success: false,
        error: String(error)
      });
    }

    console.log("Email sent successfully");
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("API ERROR:", error);
    console.error("Server error sending feedback email:", error);
    return res.status(500).json({
      success: false,
      error: String(error)
    });
  }
}
