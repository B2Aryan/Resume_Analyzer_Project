import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const {
      feedback_type,
      message,
      user_email,
      page_url,
      contact_me,
      screenshot_url,
      submission_timestamp,
    } = body;

    const { data, error } = await resend.emails.send({
      from: "ResumePilot Feedback <onboarding@resend.dev>",
      to: "aryan639244@gmail.com",
      subject: `New ResumePilot Feedback - ${feedback_type}",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>New ResumePilot Feedback</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            h2 {
              color: #4f46e5;
            }
            .section {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              display: block;
              margin-bottom: 5px;
            }
            .value {
              margin-left: 10px;
            }
          </style>
        </head>
        <body>
          <h2>New Feedback Received from ResumePilot</h2>
          <div class="section">
            <span class="label">Feedback Type:</span>
            <span class="value">${feedback_type}</span>
          </div>
          <div class="section">
            <span class="label">Message:</span>
            <div class="value">${message}</div>
          </div>
          <div class="section">
            <span class="label">User Email:</span>
            <span class="value">${user_email}</span>
          </div>
          <div class="section">
            <span class="label">Page URL:</span>
            <span class="value">${page_url}</span>
          </div>
          <div class="section">
            <span class="label">Contact Me:</span>
            <span class="value">${contact_me}</span>
          </div>
          ${
            screenshot_url && screenshot_url !== "Not provided"
              ? `
          <div class="section">
            <span class="label">Screenshot URL:</span>
            <a class="value" href="${screenshot_url}" target="_blank">${screenshot_url}</a>
          </div>
          `
              : ""
          }
          <div class="section">
            <span class="label">Submission Timestamp:</span>
            <span class="value">${submission_timestamp}</span>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ success: false, error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Server error sending feedback email:", error);
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
