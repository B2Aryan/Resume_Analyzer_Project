import { getSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

export interface SubmitFeedbackParams {
  feedbackType: string;
  message: string;
  screenshot: File | null;
  contactMe: boolean;
  rating?: number;
  user: any;
  session?: any;
}

export async function submitFeedback({
  feedbackType,
  message,
  screenshot,
  contactMe,
  rating,
  user,
  session,
}: SubmitFeedbackParams): Promise<boolean> {
  console.log("STEP 1: Submit clicked");
  if (!feedbackType || !message.trim()) {
    toast.error("Please select a feedback type and enter a message");
    return false;
  }

  console.log("STEP 2: Validation passed");
  const supabase = getSupabaseClient();
  if (!supabase) {
    toast.error("Database connection unavailable.");
    return false;
  }

  try {
    let screenshotUrl: string | null = null;
    if (screenshot) {
      try {
        console.log("STEP 3: Screenshot upload starting");
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const bucket = 'feedback-screenshots';
        
        console.log('=== Screenshot Upload Debug Info ===');
        console.log({
          bucket,
          fileName,
          filePath: fileName,
          userId: user?.id || null,
          session: session || null,
        });
        console.log('=====================================');
        
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, screenshot);
        
        if (uploadError) {
          console.error('FAILED AT STEP 3', uploadError);
          console.error('Failed to upload screenshot:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('feedback-screenshots')
            .getPublicUrl(fileName);
          
          screenshotUrl = urlData.publicUrl;
        }
        console.log("STEP 4: Screenshot upload finished");
      } catch (uploadErr) {
        console.error('FAILED AT STEP 3', uploadErr);
        console.error('Error during screenshot upload:', uploadErr);
      }
    }

    let formattedMessage = message.trim();
    if (rating && rating > 0) {
      formattedMessage = `Rating: ${rating}/5 Stars\n\nMessage: ${formattedMessage}`;
    }

    const feedbackRecord = {
      user_id: user?.id || null,
      type: feedbackType,
      message: formattedMessage,
      page_url: window.location.pathname,
      screenshot_url: screenshotUrl,
      contact_me: contactMe,
      created_at: new Date().toISOString(),
    };

    // First, insert into database
    console.log("STEP 5: Database insert starting");
    const { error: insertError } = await supabase
      .from('feedback')
      .insert(feedbackRecord);

    if (insertError) {
      console.error('FAILED AT STEP 5', insertError);
      throw insertError;
    }
    console.log("STEP 6: Database insert finished");

    // Now, try to send email via our API route (don't fail feedback submission if email fails)
    try {
      console.log("STEP 7: Email API call starting");
      await fetch("/api/send-feedback-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          message: formattedMessage,
          user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Not provided",
          user_email: user?.email || "Not provided",
          user_id: user?.id || "Not provided",
          page_url: window.location.pathname,
          contact_me: contactMe ? "Yes" : "No",
          screenshot_url: screenshotUrl || null,
          submission_timestamp: new Date().toLocaleString(),
        }),
      });
      console.log("STEP 8: Email API call finished");
    } catch (emailError) {
      console.error('FAILED AT STEP 7', emailError);
      console.error('Failed to send feedback email via API:', emailError);
    }

    console.log("STEP 9: Success toast");
    toast.success("Thanks for your feedback! We'll review it soon.");
    return true;
  } catch (error) {
    console.error('FAILED AT STEP 5 OR EARLIER', error);
    console.error('Error submitting feedback:', error);
    toast.error("Failed to submit feedback. Please try again.");
    return false;
  }
}
