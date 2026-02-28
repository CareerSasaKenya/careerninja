import { supabase } from "@/integrations/supabase/client";

interface EmailNotificationData {
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  template: string;
  template_data: Record<string, any>;
}

// Email templates
const EMAIL_TEMPLATES = {
  new_application: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Application</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .job-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Job Application Received</h1>
        </div>
        <div class="content">
            <p>Hello {{employer_name}},</p>
            
            <p>Great news! You have received a new application for your job posting:</p>
            
            <div class="job-details">
                <h2>{{job_title}}</h2>
                <p><strong>Company:</strong> {{company_name}}</p>
                <p><strong>Applicant:</strong> {{candidate_name}}</p>
                <p><strong>Experience:</strong> {{years_experience}} years</p>
                {{#expected_salary}}
                <p><strong>Expected Salary:</strong> KES {{expected_salary}}</p>
                {{/expected_salary}}
            </div>
            
            {{#cover_letter}}
            <h3>Cover Letter:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p>{{cover_letter}}</p>
            </div>
            {{/cover_letter}}
            
            <p><a href="{{dashboard_url}}" class="button">View Application Details</a></p>
            
            <p>You can review this application in your employer dashboard and update the candidate's status.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from CareerSasa Kenya.</p>
            <p>© 2026 CareerSasa Kenya. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,

  application_status: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .status-{{status_class}} { background: {{status_color}}; color: white; padding: 10px; border-radius: 5px; text-align: center; margin: 15px 0; }
        .job-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Status Update</h1>
        </div>
        <div class="content">
            <p>Hello {{candidate_name}},</p>
            
            <p>There's been an update on your job application:</p>
            
            <div class="status-{{status_class}}">
                <h2>Application Status: {{status}}</h2>
            </div>
            
            <div class="job-details">
                <h2>{{job_title}}</h2>
                <p><strong>Company:</strong> {{company_name}}</p>
                <p><strong>Applied on:</strong> {{applied_date}}</p>
            </div>
            
            {{#status_message}}
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3>Message from the employer:</h3>
                <p>{{status_message}}</p>
            </div>
            {{/status_message}}
            
            <p><a href="{{dashboard_url}}" class="button">View Application Details</a></p>
            
            <p>Thank you for your interest in this position.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from CareerSasa Kenya.</p>
            <p>© 2026 CareerSasa Kenya. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,

  new_message: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .message-preview { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #0070f3; }
        .job-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Message Received</h1>
        </div>
        <div class="content">
            <p>Hello {{recipient_name}},</p>
            
            <p>You have received a new message regarding your job application:</p>
            
            <div class="job-details">
                <h2>{{job_title}}</h2>
                <p><strong>From:</strong> {{sender_name}}</p>
                <p><strong>Company:</strong> {{company_name}}</p>
            </div>
            
            <div class="message-preview">
                <h3>Message Preview:</h3>
                <p>{{message_preview}}</p>
            </div>
            
            <p><a href="{{messages_url}}" class="button">View Full Conversation</a></p>
            
            <p>Don't miss this opportunity to communicate with your potential employer.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from CareerSasa Kenya.</p>
            <p>© 2026 CareerSasa Kenya. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
};

// Status colors and classes
const STATUS_CONFIG = {
  pending: { color: '#f59e0b', class: 'pending' },
  reviewing: { color: '#3b82f6', class: 'reviewing' },
  shortlisted: { color: '#8b5cf6', class: 'shortlisted' },
  interviewed: { color: '#6366f1', class: 'interviewed' },
  offered: { color: '#10b981', class: 'offered' },
  rejected: { color: '#ef4444', class: 'rejected' },
  withdrawn: { color: '#6b7280', class: 'withdrawn' },
  accepted: { color: '#059669', class: 'accepted' }
};

// Send email notification via Supabase
export async function sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
  try {
    // In production, this would integrate with an email service like SendGrid, Resend, or SMTP
    // For now, we'll use Supabase's email functionality or log for development
    
    console.log('📧 Email Notification:', {
      to: data.recipient_email,
      subject: data.subject,
      template: data.template
    });

    // In a real implementation, you would:
    // 1. Use a dedicated email service (SendGrid, Resend, etc.)
    // 2. Render the template with data
    // 3. Send the email
    
    // For demonstration, we'll just return true
    // In production, replace with actual email sending logic
    
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

// Create and send new application notification to employer
export async function sendNewApplicationNotification(
  employerId: string,
  employerEmail: string,
  employerName: string,
  jobTitle: string,
  companyName: string,
  candidateName: string,
  yearsExperience: number,
  coverLetter?: string,
  expectedSalary?: number
) {
  try {
    // Create in-app notification
    const { data: notification, error: notificationError } = await supabase
      .rpc('create_notification', {
        user_uuid: employerId,
        notification_type: 'new_application',
        notification_title: `New Application: ${jobTitle}`,
        notification_message: `${candidateName} has applied for ${jobTitle} at ${companyName}`,
        notification_data: {
          job_title: jobTitle,
          company_name: companyName,
          candidate_name: candidateName,
          years_experience: yearsExperience,
          cover_letter: coverLetter,
          expected_salary: expectedSalary
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      return false;
    }

    // Send email notification
    const emailSent = await sendEmailNotification({
      recipient_email: employerEmail,
      recipient_name: employerName,
      subject: `New Application: ${jobTitle}`,
      template: 'new_application',
      template_data: {
        employer_name: employerName,
        job_title: jobTitle,
        company_name: companyName,
        candidate_name: candidateName,
        years_experience: yearsExperience,
        cover_letter: coverLetter,
        expected_salary: expectedSalary,
        dashboard_url: `${window.location.origin}/dashboard`
      }
    });

    // Update notification to mark email as sent
    if (emailSent && notification) {
      await supabase
        .from('notifications')
        .update({ emailed: true })
        .eq('id', notification);
    }

    return true;
  } catch (error) {
    console.error('Error sending new application notification:', error);
    return false;
  }
}

// Create and send application status update notification to candidate
export async function sendApplicationStatusNotification(
  candidateId: string,
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  companyName: string,
  status: string,
  statusMessage?: string
) {
  try {
    const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    
    // Create in-app notification
    const { data: notification, error: notificationError } = await supabase
      .rpc('create_notification', {
        user_uuid: candidateId,
        notification_type: 'application_status',
        notification_title: `Application Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        notification_message: `Your application for ${jobTitle} at ${companyName} has been updated to: ${status}`,
        notification_data: {
          job_title: jobTitle,
          company_name: companyName,
          status: status,
          status_message: statusMessage
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      return false;
    }

    // Send email notification
    const emailSent = await sendEmailNotification({
      recipient_email: candidateEmail,
      recipient_name: candidateName,
      subject: `Application Status Update: ${jobTitle}`,
      template: 'application_status',
      template_data: {
        candidate_name: candidateName,
        job_title: jobTitle,
        company_name: companyName,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        status_class: statusConfig.class,
        status_color: statusConfig.color,
        status_message: statusMessage,
        applied_date: new Date().toLocaleDateString(),
        dashboard_url: `${window.location.origin}/dashboard/applications`
      }
    });

    // Update notification to mark email as sent
    if (emailSent && notification) {
      await supabase
        .from('notifications')
        .update({ emailed: true })
        .eq('id', notification);
    }

    return true;
  } catch (error) {
    console.error('Error sending application status notification:', error);
    return false;
  }
}

// Create and send new message notification
export async function sendNewMessageNotification(
  recipientId: string,
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  jobTitle: string,
  companyName: string,
  messagePreview: string
) {
  try {
    // Create in-app notification
    const { data: notification, error: notificationError } = await supabase
      .rpc('create_notification', {
        user_uuid: recipientId,
        notification_type: 'new_message',
        notification_title: `New Message from ${senderName}`,
        notification_message: `Regarding your application for ${jobTitle} at ${companyName}`,
        notification_data: {
          job_title: jobTitle,
          company_name: companyName,
          sender_name: senderName,
          message_preview: messagePreview
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      return false;
    }

    // Send email notification
    const emailSent = await sendEmailNotification({
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject: `New Message: ${jobTitle}`,
      template: 'new_message',
      template_data: {
        recipient_name: recipientName,
        sender_name: senderName,
        job_title: jobTitle,
        company_name: companyName,
        message_preview: messagePreview,
        messages_url: `${window.location.origin}/dashboard/messages`
      }
    });

    // Update notification to mark email as sent
    if (emailSent && notification) {
      await supabase
        .from('notifications')
        .update({ emailed: true })
        .eq('id', notification);
    }

    return true;
  } catch (error) {
    console.error('Error sending new message notification:', error);
    return false;
  }
}

// Send job alert notification
export async function sendJobAlertNotification(
  userId: string,
  userEmail: string,
  userName: string,
  jobTitle: string,
  companyName: string,
  jobLocation: string,
  jobId: string
) {
  try {
    // Create in-app notification
    const { data: notification, error: notificationError } = await supabase
      .rpc('create_notification', {
        user_uuid: userId,
        notification_type: 'job_alert',
        notification_title: `New Job Alert: ${jobTitle}`,
        notification_message: `A new job matching your preferences: ${jobTitle} at ${companyName}`,
        notification_data: {
          job_title: jobTitle,
          company_name: companyName,
          job_location: jobLocation,
          job_id: jobId
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      return false;
    }

    // For job alerts, we might not send email immediately to avoid spam
    // Instead, we could batch them or send based on user preferences
    
    return true;
  } catch (error) {
    console.error('Error sending job alert notification:', error);
    return false;
  }
}

// Process notifications queue (for batch sending)
export async function processNotificationsQueue() {
  try {
    // This would handle batch processing of notifications
    // For example, sending daily digests of job alerts
    console.log('Processing notifications queue...');
    return true;
  } catch (error) {
    console.error('Error processing notifications queue:', error);
    return false;
  }
}