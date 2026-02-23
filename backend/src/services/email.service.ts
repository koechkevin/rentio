import nodemailer from "nodemailer";
import axios from "axios";
import { AppError } from "../middleware/errorHandler";

// BREVO_API_KEY
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendWithAPI = async (payload: any) => {
  const apiKey = process.env.BREVO_API_KEY;
  const endpoint =
    process.env.BREVO_API_ENDPOINT || "https://api.brevo.com/v3/emailCampaigns";

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    console.log("Brevo campaign created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to send email via Brevo API:", error);
    return null;
  }
};

export const sendVerificationEmail = async (
  to: string,
  verificationCode: string,
) => {
  const from = process.env.EMAIL_FROM || "noreply@rentalhub.cloud";

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Verify Your Email - RentalHub",
      name: "Email Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Thank you for registering with RentalHub.</p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>Please use this code to verify your account.</p>
      `,
    });

    console.log(info);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new AppError(JSON.stringify(error), 500);
  }
};

/**
 * Reusable utility to send password reset email with verification code and JWT token
 * @param email - User's email address
 * @param verificationCode - 6-digit verification code
 * @param resetToken - JWT token for password reset
 * @param frontendUrl - Base URL of the frontend application
 */
export const sendPasswordResetEmail = async (
  email: string,
  verificationCode: string,
  resetToken: string,
  frontendUrl: string,
) => {
  const from = process.env.EMAIL_FROM || "noreply@rentalhub.cloud";
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}&code=${verificationCode}`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Reset Your Password - RentalHub",
      name: "Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for RentalHub.</p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log(`Password reset email sent to ${email}`);
    return info;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new AppError("Failed to send password reset email", 500);
  }
};

/**
 * Reusable utility to send WhatsApp message via Brevo
 * @param phoneNumber - Recipient's phone number in E.164 format (e.g., +1234567890)
 * @param message - Message content to send
 */
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string,
) => {
  const apiKey = process.env.BREVO_API_KEY;
  const endpoint =
    process.env.BREVO_WHATSAPP_ENDPOINT ||
    "https://api.brevo.com/v3/whatsapp/sendMessage";

  if (!apiKey) {
    throw new AppError("BREVO_API_KEY is not configured", 500);
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        contactNumbers: [phoneNumber],
        type: "text",
        text: message,
        senderNumber: process.env.WHATSAPP_PHONE_NUMBER_ID,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`WhatsApp message sent to ${phoneNumber}:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to send WhatsApp message via Brevo:", error);
    throw new AppError("Failed to send WhatsApp message", 500);
  }
};

/**
 * Reusable utility to send SMS message via Africa's Talking
 * @param phoneNumber - Recipient's phone number in E.164 format (e.g., +254712345678)
 * @param message - Message content to send
 */
export const sendSMSMessage = async (phoneNumber: string, message: string) => {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME || "sandbox";
  const endpoint =
    process.env.AFRICASTALKING_ENDPOINT ||
    "https://api.sandbox.africastalking.com/version1/messaging";

  if (!apiKey) {
    throw new AppError("Africa's Talking API key is not configured", 500);
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        username,
        message,
        from: "RENTIO", // Sender ID (must be registered with Africa's Talking)
        to: phoneNumber,
      },
      {
        headers: {
          apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      },
    );

    console.log(`SMS sent to ${phoneNumber}:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to send SMS via Africa's Talking:", error);
    throw new AppError("Failed to send SMS", 500);
  }
};

/**
 * Reusable utility to send SMS message via Brevo
 * @param phoneNumber - Recipient's phone number in E.164 format (e.g., +254712345678)
 * @param message - Message content to send
 */
export const sendSMSMessageViaBrevo = async (
  phoneNumber: string,
  message: string,
) => {
  const apiKey = process.env.BREVO_API_KEY;
  const endpoint =
    process.env.BREVO_SMS_ENDPOINT ||
    "https://api.brevo.com/v3/transactionalSMS/send";
  const senderName = process.env.SMS_SENDER_NAME || "RENTIO";

  if (!apiKey) {
    throw new AppError("BREVO_API_KEY is not configured", 500);
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        sender: senderName,
        recipient: phoneNumber,
        content: message,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`SMS sent via Brevo to ${phoneNumber}:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to send SMS via Brevo:", error);
    throw new AppError("Failed to send SMS", 500);
  }
};

/**
 * Send invoice notification email to customer
 * @param email - Customer's email
 * @param invoiceNumber - Invoice number
 * @param totalAmount - Total invoice amount
 * @param dueDate - Invoice due date
 * @param invoiceId - Invoice ID for viewing link
 * @param originUrl - Frontend origin URL
 */
export const sendInvoiceNotificationEmail = async (
  email: string,
  invoiceNumber: string,
  totalAmount: string,
  dueDate: string,
  invoiceId: string,
  originUrl: string,
) => {
  const from = process.env.EMAIL_FROM || "kevin@kevinkoech.com";
  const invoiceUrl = `${originUrl}/finance/invoices/${invoiceId}`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: `Invoice ${invoiceNumber} - Payment Due`,
      html: `
        <h2>Invoice Notification</h2>
        <p>You have received a new invoice.</p>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Total Amount:</strong> ${totalAmount}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p>
          <a href="${invoiceUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Invoice</a>
        </p>
        <p>If you have any questions, please contact us.</p>
      `,
    });

    console.log(`Invoice notification email sent to ${email}`);
    return info;
  } catch (error) {
    console.error("Failed to send invoice notification email:", error);
    throw new AppError("Failed to send invoice notification email", 500);
  }
};

/**
 * Send invoice notification SMS to customer
 * @param phoneNumber - Customer's phone number
 * @param invoiceNumber - Invoice number
 * @param totalAmount - Total invoice amount
 * @param invoiceId - Invoice ID for viewing link
 * @param originUrl - Frontend origin URL
 */
export const sendInvoiceNotificationSMS = async (
  phoneNumber: string,
  invoiceNumber: string,
  totalAmount: string,
  invoiceId: string,
  originUrl: string,
) => {
  const invoiceUrl = `${originUrl}/finance/invoices/${invoiceId}`;
  const message = `Invoice ${invoiceNumber} created for KES ${totalAmount}. View: ${invoiceUrl}`;

  return await sendSMSMessageViaBrevo(phoneNumber, message);
};
