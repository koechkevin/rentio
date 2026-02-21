import {
  sendInvoiceNotificationEmail,
  sendInvoiceNotificationSMS,
} from "./email.service";

/**
 * Send invoice notifications via email and SMS
 */
export const sendInvoiceNotifications = async (
  customer: { email?: string; phone: string },
  invoice: {
    id: string;
    invoiceNumber: string;
    totalAmount: string;
    dueDate: string;
  },
  originUrl: string,
) => {
  const errors: string[] = [];

  // Send email notification
  if (customer.email) {
    try {
      await sendInvoiceNotificationEmail(
        customer.email,
        invoice.invoiceNumber,
        invoice.totalAmount,
        invoice.dueDate,
        invoice.id,
        originUrl,
      );
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      errors.push("Email notification failed");
    }
  }

  // Send SMS notification
  try {
    await sendInvoiceNotificationSMS(
      customer.phone,
      invoice.invoiceNumber,
      invoice.totalAmount,
      invoice.id,
      originUrl,
    );
  } catch (error) {
    console.error("Failed to send invoice SMS:", error);
    errors.push("SMS notification failed");
  }

  if (errors.length > 0) {
    console.warn("Some invoice notifications failed:", errors);
  }

  return { success: errors.length === 0, errors };
};
