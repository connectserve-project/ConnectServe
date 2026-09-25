/**
 * Sends an email notification using Brevo API v3
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML formatted email body
 * @param {Array} attachments - Optional array of attachments (base64)
 */
const sendEmail = async (to, subject, htmlContent, attachments = []) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const fromAddress = process.env.BREVO_FROM || process.env.SMTP_FROM || 'noreply@connectserve.in';

    if (!apiKey) {
      console.warn('[Email Service Warning] BREVO_API_KEY is not set in environment variables.');
      return { success: false, error: 'BREVO_API_KEY missing' };
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'ConnectServe Community',
          email: fromAddress,
        },
        to: [{ email: to }],
        subject,
        htmlContent,
        ...(attachments && attachments.length ? { attachment: attachments } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || data.code || `Brevo API error ${response.status}`;
      console.error('[Email Service Error]', errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log(`[Email Service] Message sent successfully via Brevo API. ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('[Email Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

const sendEventTaggedEmail = async (organizer, tagger, event, post) => {
  const clientUrl = process.env.CLIENT_URL || 'https://www.connectserve.in';
  const subject = ` ${tagger.name} tagged your event "${event.title}"`;
  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderradius: 8px;">
<h2 style="color: #059669;">Your event was tagged in a post </h2>
<p>Hi <strong>${organizer.name}</strong>,</p>
<p><strong>${tagger.name}</strong> tagged your event <strong>"${event.title}"</strong> in a new community post.</p>
<div style="background:#f8fafc;padding:15px;border-radius:6px;margin:15px 0;">
<p style="margin:4px 0;">${(post.content || '').substring(0, 150)}</p>
</div>
<div style="text-align:center;margin:24px 0;">
<a href="${clientUrl}/feed" style="background:#059669;color:#fff;padding:12px 28px;
text-decoration:none;border-radius:6px;font-weight:bold;">View Post</a>
</div>
<p style="color:#64748b;font-size:12px;">ConnectServe - Empowering Social Impact & Volunteers</p>
</div>`;
  return sendEmail(organizer.email, subject, html);
};


const sendApplicationStatusEmail = async (user, event, status, notes = '') => {
  const isApproved = status === 'approved';
  const subject = isApproved
    ? `🎉 Application Approved: ${event.title}`
    : `Update on your application: ${event.title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: ${isApproved ? '#059669' : '#e11d48'};">
        ${isApproved ? 'You are confirmed!' : 'Application Update'}
      </h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>
        Your application for the community service event <strong>"${event.title}"</strong> has been
        <strong>${status.toUpperCase()}</strong>.
      </p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p style="margin: 4px 0;"><strong>Time:</strong> ${event.time}</p>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${event.location}</p>
        <p style="margin: 4px 0;"><strong>Hours:</strong> ${event.hoursGranted} hours</p>
        ${notes ? `<p style="margin: 4px 0;"><strong>Organizer Note:</strong> ${notes}</p>` : ''}
      </div>
      <p>Thank you for giving back to the community!</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 25px;">
        ConnectServe - Empowering Social Impact & Volunteers
      </p>
    </div>
  `;

  return sendEmail(user.email, subject, html);
};

/**
 * Sends a welcome email to newly registered volunteers
 * @param {Object} user - User document or object with name and email
 */
const sendVolunteerWelcomeEmail = async (user) => {
  const clientUrl = process.env.CLIENT_URL || 'https://www.connectserve.in';
  const supportEmail = 'support@connectserve.in';
  const subject = `Welcome to ConnectServe, ${user.name || 'Volunteer'}! 🎉`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #059669; margin-top: 0;">Welcome to ConnectServe! 🎉</h2>
      <p>Hi <strong>${user.name || 'Volunteer'}</strong>,</p>
      <p>
        Your volunteer account has been created successfully. We're thrilled to have you join our community of changemakers!
      </p>
      <div style="background-color: #f8fafc; padding: 18px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #0f172a;">Here is what you can do right now:</p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
          <li><strong>Explore Events:</strong> Discover local and virtual community service opportunities.</li>
          <li><strong>Apply & Connect:</strong> Register for events that align with your passion and skills.</li>
          <li><strong>Track Your Impact:</strong> Log hours, earn verified certificates, and build your volunteer portfolio.</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${clientUrl}/events" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Browse Volunteer Events
        </a>
      </div>
      <p style="font-size: 14px; color: #475569;">
        Need assistance or have questions? Reach out to our team anytime at <a href="mailto:${supportEmail}" style="color: #059669; text-decoration: none;">${supportEmail}</a>.
      </p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        ConnectServe - Empowering Social Impact & Volunteers
      </p>
    </div>
  `;

  return sendEmail(user.email, subject, html);
};

/**
 * Sends a welcome and verification-pending notification to newly registered organizations
 * @param {Object} org - Organization document or user object
 */
const sendOrgWelcomePendingEmail = async (org) => {
  const supportEmail = 'support@connectserve.in';
  const subject = 'ConnectServe - Your Organisation Account is Under Review';
  const regNumber = org.orgDetails?.registrationNumber || 'Pending Submission';
  const category = org.orgDetails?.category || 'General Community';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #d97706; margin-top: 0;">Organisation Account Under Review ⏳</h2>
      <p>Hi <strong>${org.name || 'Organisation Partner'}</strong>,</p>
      <p>
        Thank you for registering your organisation with <strong>ConnectServe</strong>! Your account has been created successfully.
      </p>
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #d97706; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">Account Status: PENDING VERIFICATION</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #78350f;">
          To ensure safety and trust across our platform, organization accounts must be verified by an administrator before you can publish events or receive volunteer applications.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 4px 0;"><strong>Category:</strong> ${category}</p>
        <p style="margin: 4px 0;"><strong>Registration Number:</strong> ${regNumber}</p>
      </div>
      <p style="line-height: 1.6;">
        <strong>What's next?</strong><br/>
        Our administration team will review your submitted registration details. You will receive another notification email as soon as your account has been reviewed and verified.
      </p>
      <p style="font-size: 14px; color: #475569;">
        If you have urgent inquiries or need to update your documentation, please contact <a href="mailto:${supportEmail}" style="color: #059669; text-decoration: none;">${supportEmail}</a>.
      </p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        ConnectServe - Empowering Social Impact & Volunteers
      </p>
    </div>
  `;

  return sendEmail(org.email, subject, html);
};

/**
 * Sends a confirmation email to an organization once approved/verified by an admin
 * @param {Object} org - Organization document or user object
 */
const sendOrgVerifiedEmail = async (org) => {
  const clientUrl = process.env.CLIENT_URL || 'https://www.connectserve.in';
  const supportEmail = 'support@connectserve.in';
  const subject = '🎉 Your Organisation Has Been Verified on ConnectServe';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #059669; margin-top: 0;">Your Organisation is Verified! 🎉</h2>
      <p>Hi <strong>${org.name || 'Organisation Partner'}</strong>,</p>
      <p>
        Congratulations! We are delighted to inform you that your organisation account on <strong>ConnectServe</strong> has been reviewed and <strong>VERIFIED</strong>.
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #059669; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #166534;">Your account now has full access to:</p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #14532d;">
          <li>Create, schedule, and publish community service events</li>
          <li>Receive and manage applications from eager volunteers</li>
          <li>Track attendance, award volunteer hours, and issue verified certificates</li>
          <li>Display the official Verified Badge on all your public organization listings</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${clientUrl}/org/dashboard" style="background-color: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Go to Organisation Dashboard
        </a>
      </div>
      <p style="font-size: 14px; color: #475569;">
        Need help setting up your first event? Feel free to contact our support team at <a href="mailto:${supportEmail}" style="color: #059669; text-decoration: none;">${supportEmail}</a>.
      </p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        ConnectServe - Empowering Social Impact & Volunteers
      </p>
    </div>
  `;

  return sendEmail(org.email, subject, html);
};

const sendNewApplicantEmail = async (organizer, volunteer, event) => {
  const clientUrl = process.env.CLIENT_URL || 'https://www.connectserve.in';
  const subject = ` New Volunteer Application: ${event.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #059669;">New Volunteer Application </h2>
      <p>Hi <strong>${organizer.name}</strong>,</p>
      <p><strong>${volunteer.name}</strong> has applied to volunteer for your event <strong>"${event.title}"</strong>.</p>
      <div style="background:#f8fafc;padding:15px;border-radius:6px;margin:15px 0;">
        <p style="margin:4px 0;"><strong>Applicant email:</strong> ${volunteer.email}</p>
        <p style="margin:4px 0;"><strong>Event date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${clientUrl}/org/dashboard" style="background:#059669;color:#fff;padding:12px 28px; text-decoration:none;border-radius:6px;font-weight:bold;">Review Application</a>
      </div>
      <p style="color:#64748b;font-size:12px;">ConnectServe - Empowering Social Impact & Volunteers</p>
    </div>`;
  return sendEmail(organizer.email, subject, html);
};

const sendCertificateEmail = async (volunteer, certificate) => {
  const clientUrl = process.env.CLIENT_URL || 'https://www.connectserve.in';
  const subject = ` Your Certificate for "${certificate.eventTitle}" has been issued!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="background-color: #f8fafc; padding: 20px;">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669;">Congratulations, ${volunteer.name}! </h2>
        <p>Your certificate for <strong>"${certificate.eventTitle}"</strong> (${certificate.hours} hours) has been successfully issued.</p>
        <p>Certificate Code: <strong>${certificate.certificateCode}</strong></p>
        <div style="background:#f8fafc;padding:15px;border-radius:6px;margin:15px 0;">
          <p style="margin:0 0 10px 0;font-weight:bold;">How to view and download your certificate:</p>
          <ol style="margin:0;padding-left:20px;color:#1e293b;">
            <li>Go to your <strong>Profile</strong></li>
            <li>Click on <strong>Digital Certificate</strong></li>
            <li>Select <strong>View & Download PDF</strong></li>
          </ol>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${clientUrl}/profile" style="background:#059669;color:#fff;padding:12px 28px; text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Go to Profile</a>
        </div>
        <p style="color:#64748b;font-size:12px;">ConnectServe - Empowering Social Impact & Volunteers</p>
      </div>
    </body>
    </html>`;
  return sendEmail(volunteer.email, subject, html);
};

const sendAccountBannedEmail = async (user, reason) => {
  const supportEmail = 'support@connectserve.in';
  const subject = 'ConnectServe - Your Account Has Been Suspended';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #dc2626;">Account Suspended</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your ConnectServe account has been <strong>banned</strong> by an administrator.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626; padding:15px;border-radius:6px;margin:20px 0;">
        <p style="margin:0;font-weight:bold;color:#991b1b;">Reason provided:</p>
        <p style="margin:8px 0 0 0;color:#7f1d1d;">${reason || 'No reason specified.'}</p>
      </div>
      <p>If you believe this was a mistake or need more information, please contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      <p style="color:#64748b;font-size:12px;">ConnectServe - Empowering Social Impact & Volunteers</p>
    </div>`;
  return sendEmail(user.email, subject, html);
};

const sendAccountDeletedEmail = async (user, reason) => {
  const supportEmail = 'support@connectserve.in';
  const subject = 'ConnectServe - Your Account Has Been Deleted';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #dc2626;">Account Deleted</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your ConnectServe account and all associated data have been permanently deleted by an administrator.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626; padding:15px;border-radius:6px;margin:20px 0;">
        <p style="margin:0;font-weight:bold;color:#991b1b;">Reason provided:</p>
        <p style="margin:8px 0 0 0;color:#7f1d1d;">${reason || 'No reason specified.'}</p>
      </div>
      <p>For questions, please contact <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
      <p style="color:#64748b;font-size:12px;">ConnectServe - Empowering Social Impact & Volunteers</p>
    </div>`;
  return sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendApplicationStatusEmail,
  sendEventTaggedEmail,
  sendVolunteerWelcomeEmail,
  sendOrgWelcomePendingEmail,
  sendOrgVerifiedEmail,
  sendNewApplicantEmail,
  sendCertificateEmail,
  sendAccountBannedEmail,
  sendAccountDeletedEmail,
};
