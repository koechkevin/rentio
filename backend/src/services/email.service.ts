import nodemailer from "nodemailer";
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

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log("Brevo campaign created:", result);
    return result;
  } catch (error) {
    console.error("Failed to send email via Brevo API:", error);
    return null;
  }
};

export const sendVerificationEmail = async (
  to: string,
  verificationCode: string,
) => {
  const from = process.env.EMAIL_FROM || "kevin@kevinkoech.com";

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Verify Your Email - Property SAAS",
      name: "Email Verification",
      html: `
        <h2>Email Verification</h2>
        <p>Thank you for registering with Property SAAS.</p>
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
  const from = process.env.EMAIL_FROM || "kevin@kevinkoech.com";
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}&code=${verificationCode}`;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Reset Your Password - Property SAAS",
      name: "Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for Property SAAS.</p>
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
