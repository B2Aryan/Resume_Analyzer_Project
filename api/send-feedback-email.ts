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
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background-color: #0B1220;
              color: #e2e8f0;
              line-height: 1.6;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 30px 0;
              border-bottom: 1px solid #1e293b;
            }
            .logo {
              font-size: 28px;
              font-weight: 800;
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 600;
              margin: 20px 0;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              color: #f8fafc;
              margin-bottom: 20px;
            }
            .card {
              background-color: #1e293b;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 20px;
              border: 1px solid #334155;
            }
            .card-title {
              font-size: 16px;
              font-weight: 600;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 16px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #334155;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              color: #94a3b8;
              font-size: 14px;
            }
            .info-value {
              color: #f8fafc;
              font-size: 14px;
              font-weight: 500;
              text-align: right;
              word-break: break-all;
            }
            .message-box {
              background-color: #0B1220;
              border-radius: 8px;
              padding: 16px;
              border-left: 4px solid #3b82f6;
            }
            .message-text {
              color: #cbd5e1;
              font-size: 14px;
            }
            .screenshot-container {
              text-align: center;
            }
            .screenshot-thumbnail {
              max-width: 100%;
              border-radius: 8px;
              margin-bottom: 12px;
              border: 1px solid #334155;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.2s ease;
            }
            .btn:hover {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            }
            .no-screenshot {
              color: #64748b;
              font-style: italic;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              padding: 30px 0;
              border-top: 1px solid #1e293b;
              margin-top: 20px;
              color: #64748b;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header with Logo -->
            <div class="header">
              <div class="logo">ResumePilot</div>
            </div>

            <!-- Heading and Badge -->
            <h1>New Feedback Received</h1>
            <div class="badge" style="background-color: ${badgeColors.bg}; color: ${badgeColors.text};">
              ${escapeHtml(feedback_type)}
            </div>

            <!-- Feedback Details Card -->
            <div class="card">
              <div class="card-title">Feedback Details</div>
              <div class="info-row">
                <div class="info-label">Type</div>
                <div class="info-value">${escapeHtml(feedback_type)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Submitted At</div>
                <div class="info-value">${escapeHtml(submission_timestamp)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Page URL</div>
                <div class="info-value">${escapeHtml(page_url)}</div>
              </div>
            </div>

            <!-- User Information Card -->
            <div class="card">
              <div class="card-title">User Information</div>
              <div class="info-row">
                <div class="info-label">User Email</div>
                <div class="info-value">${escapeHtml(user_email)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">User ID</div>
                <div class="info-value">${escapeHtml(user_id)}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Contact Me</div>
                <div class="info-value">${escapeHtml(contact_me)}</div>
              </div>
            </div>

            <!-- Feedback Message Card -->
            <div class="card">
              <div class="card-title">Feedback Message</div>
              <div class="message-box">
                <div class="message-text">${formattedMessage}</div>
              </div>
            </div>

            <!-- Screenshot Section -->
            ${screenshot_url ? `
              <div class="card">
                <div class="card-title">Screenshot</div>
                <div class="screenshot-container">
                  <img src="${escapeHtml(screenshot_url)}" alt="Feedback Screenshot" class="screenshot-thumbnail">
                  <br>
                  <a href="${escapeHtml(screenshot_url)}" target="_blank" class="btn">Open Screenshot</a>
                </div>
              </div>
            ` : `
              <div class="card">
                <div class="card-title">Screenshot</div>
                <div class="no-screenshot">No screenshot attached</div>
              </div>
            `}

            <!-- Footer -->
            <div class="footer">
              <div>ResumePilot Feedback System</div>
              <div style="margin-top: 8px;">Automatically generated notification</div>
            </div>
          </div>
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
