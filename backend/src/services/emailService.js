import nodemailer from "nodemailer";
import dotenv from "dotenv";

let cachedTransporter = null;
let lastSmtpConfigKey = null;

/**
 * Get or create the Nodemailer transporter.
 * Supports:
 * 1. Real SMTP (Gmail, Brevo, SendGrid, Resend, or custom SMTP) via .env
 * 2. Ethereal Email test account (Auto-provisioned live sandbox for local testing)
 */
async function getTransporter() {
  // Always reload .env so edits to .env are picked up immediately without restarting
  try {
    dotenv.config();
  } catch (_e) {
    // ignore
  }

  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").trim();
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const currentKey = `${host}:${port}:${smtpUser}:${smtpPass}`;

  if (cachedTransporter && lastSmtpConfigKey === currentKey) {
    return cachedTransporter;
  }

  if (smtpUser && smtpPass) {
    const isSecure = port === 465;
    const isGmail = host.toLowerCase().includes("gmail");
    const cleanPass = smtpPass.replace(/\s+/g, ""); // Strip any spaces from Google App Password

    cachedTransporter = nodemailer.createTransport(
      isGmail
        ? {
            service: "gmail",
            auth: {
              user: smtpUser,
              pass: cleanPass
            }
          }
        : {
            host,
            port,
            secure: isSecure,
            auth: {
              user: smtpUser,
              pass: cleanPass
            },
            tls: {
              rejectUnauthorized: false
            }
          }
    );

    lastSmtpConfigKey = currentKey;
    console.log(`📧 [EmailService] Initialized SMTP Transporter (${isGmail ? "Gmail Service" : `${host}:${port}`}) for ${smtpUser}`);
    return cachedTransporter;
  }

  // Fallback: Auto-generate an Ethereal Test Account on the fly
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    lastSmtpConfigKey = `ethereal:${testAccount.user}`;
    console.log(`📧 [EmailService] Using Ethereal Test Account: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err) {
    console.error("📧 [EmailService] Error creating test email account:", err.message);
    return null;
  }
}

/**
 * Generate a responsive, professional HTML email for BakeSphere OTP verification.
 */
function getOtpHtmlTemplate({ name, otp, roleLabel }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BakeSphere Email Verification</title>
  <style>
    body { margin: 0; padding: 0; background-color: #fdf2f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(200, 16, 46, 0.08); border: 1px solid #fecdd3; }
    .header { background: linear-gradient(135deg, #c8102e 0%, #881337 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
    .logo-icon { font-size: 42px; line-height: 1; margin-bottom: 8px; }
    .brand-title { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin: 0; color: #ffffff; }
    .brand-tagline { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #fecdd3; margin-top: 4px; }
    .content { padding: 36px 32px 30px; color: #334155; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }
    .role-badge { display: inline-block; background: #ffe4e6; color: #be123c; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; margin: 6px 0 16px; border: 1px solid #fecdd3; }
    .otp-box { background: #fdf2f4; border: 2px dashed #f43f5e; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #c8102e; display: inline-block; }
    .otp-validity { font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 600; }
    .instructions { font-size: 14px; color: #64748b; margin: 16px 0; }
    .security-notice { background: #f8fafc; border-left: 4px solid #94a3b8; padding: 12px 16px; font-size: 12px; color: #64748b; border-radius: 0 8px 8px 0; margin-top: 24px; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-icon">🥐</div>
      <h1 class="brand-title">BakeSphere</h1>
      <div class="brand-tagline">Online Patisserie & Smart Bakery Management</div>
    </div>
    <div class="content">
      <h2 class="greeting">Hello, ${name || "Baker"}! 👋</h2>
      <p style="margin: 0;">Thank you for registering on BakeSphere. You are verifying your identity to activate your account:</p>
      <div><span class="role-badge">🎯 Role: ${roleLabel || "Customer"}</span></div>
      
      <p style="font-size: 14px; margin-top: 14px;">Use the One-Time Password (OTP) below to complete your registration:</p>
      
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-validity">⏱️ Valid for 10 minutes (Time-Based OTP)</div>
      </div>

      <p class="instructions">
        Enter this 6-digit code on the BakeSphere registration screen to verify your email and access your dashboard.
      </p>

      <div class="security-notice">
        <strong>🔒 Security Notice:</strong> Never share this OTP with anyone. BakeSphere staff will never request your verification code or password.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} BakeSphere Smart Bakery ERP. All rights reserved.<br>
      This is an automated security transmission. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatch real verification email with OTP.
 * @param {Object} params - { to, name, otp, roleLabel }
 * @returns {Promise<{ success: boolean, messageId?: string, previewUrl?: string, error?: string }>}
 */
export async function sendOtpEmail({ to, name, otp, roleLabel }) {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn("⚠️ [EmailService] No transporter available. Email dispatch skipped.");
      return { success: false, error: "Email transporter not initialized" };
    }

    const smtpUser = process.env.SMTP_USER;
    const fromAddress = smtpUser
      ? `"BakeSphere Patisserie" <${smtpUser}>`
      : (process.env.EMAIL_FROM || `"BakeSphere Bakery" <noreply@bakesphere.com>`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `🔑 [${otp}] Your BakeSphere Verification Code`,
      text: `Hello ${name}!\n\nYour BakeSphere verification OTP for role (${roleLabel || "Customer"}) is: ${otp}\n\nThis code will expire in 10 minutes.\n\nNever share this code with anyone.\n\n- The BakeSphere Team`,
      html: getOtpHtmlTemplate({ name, otp, roleLabel })
    });

    console.log(`✅ [EmailService] Real Email sent to ${to}! MessageID: ${info.messageId}`);

    // If using Ethereal, log the live preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [EmailService] Ethereal Live Email Web Preview: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined
    };
  } catch (err) {
    console.error(`❌ [EmailService] Failed to send email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message
    };
  }
}
