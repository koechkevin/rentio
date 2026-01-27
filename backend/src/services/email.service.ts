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
