import html2pdf from 'html2pdf.js';
import { PropertyInvoice } from '../types/propertyInvoice.types';

/**
 * Generates and downloads a PDF property invoice using html2pdf
 * @param invoice - The property invoice data to generate PDF from
 */
export const generatePropertyInvoicePDF = (invoice: PropertyInvoice): void => {
  // Determine if this is a receipt (paid invoice) or invoice
  const isPaid = invoice.status === 'PAID';
  const documentTitle = isPaid ? 'RECEIPT' : 'INVOICE';
  const titleColor = isPaid ? '#28a745' : '#dc3545';

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatCurrency = (amount: number) => `${invoice.currency} ${Number(amount).toFixed(2)}`;

  // Calculate totals from payments
  const totalPaid = invoice.payments
    .filter((p) => p?.payment?.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = Number(invoice.totalAmount) - totalPaid;

  // Create a temporary container with content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `
    <div id="invoice-content" style="width: 100%; max-width: 190mm; background: white; padding: 10px;">
      <div class="header" style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 28px; color: ${titleColor}; margin-bottom: 15px;">PROPERTY ${documentTitle}</h1>
      </div>
      
      <div class="invoice-info" style="margin-bottom: 20px; color: #000;">
        <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${formatDate(invoice.createdAt)}</p>
        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
        <p style="margin: 5px 0;"><strong>Billing Period:</strong> ${formatDate(invoice.billingPeriodStart)} - ${formatDate(invoice.billingPeriodEnd)}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> ${invoice.status}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <h3 style="font-size: 14px; margin-bottom: 10px; color: #000;">Bill To</h3>
          <p style="margin: 5px 0; color: #000;">${invoice.property?.owner?.fullName || 'N/A'}</p>
          <p style="margin: 5px 0; color: #000;">${invoice.property?.owner?.email || 'N/A'}</p>
          <p style="margin: 5px 0; color: #000;">${invoice.property?.owner?.phone || 'N/A'}</p>
        </div>
        
        <div style="width: 48%; text-align: right;">
          <h3 style="font-size: 14px; margin-bottom: 10px; color: #000;">Property Details</h3>
          <p style="margin: 5px 0; color: #000;">${invoice.property?.name || 'N/A'}</p>
          <p style="margin: 5px 0; color: #000;">${invoice.property?.town || ''}, ${invoice.property?.county || ''}</p>
          <p style="margin: 5px 0; color: #000;">Occupied Units: ${invoice.occupiedUnits}</p>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead style="background-color: #428bca; color: white;">
          <tr>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 11px;">Unit</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 11px;">Type</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 11px;">Description</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 11px;">Rate</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 11px;">Qty</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 11px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            invoice.items && invoice.items.length > 0
              ? invoice.items
                  .map(
                    (item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; color: #000; font-size: 11px;">${item.unitNumber}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; color: #000; font-size: 11px;">${item.unitType}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; color: #000; font-size: 11px;">${item.description || 'Monthly management fee'}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; color: #000; font-size: 11px; text-align: right;">${formatCurrency(item.unitAmount)}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; color: #000; font-size: 11px; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; color: #000; font-size: 11px; text-align: right;">${formatCurrency(item.total)}</td>
            </tr>
          `
                  )
                  .join('')
              : `<tr><td colspan="7" style="text-align: center; padding: 20px;">No items</td></tr>`
          }
        </tbody>
      </table>
      
      <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #000;">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          ${
            Number(invoice.tax) > 0
              ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #000;">
            <span>Tax:</span>
            <span>${formatCurrency(invoice.tax)}</span>
          </div>
          `
              : ''
          }
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #000; margin-top: 10px; font-weight: bold; font-size: 14px; color: #000;">
            <span>Total:</span>
            <span>${formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>
      
      ${
        invoice.notes
          ? `
        <div style="margin-top: 30px; padding: 15px; background-color: #f0f8ff; border-left: 4px solid #428bca;">
          <h3 style="font-size: 12px; margin-bottom: 8px; color: #000;">Notes:</h3>
          <p style="color: #000; line-height: 1.6;">${invoice.notes}</p>
        </div>
      `
          : ''
      }
      
      ${
        invoice.payments && invoice.payments.length > 0
          ? `
        <div style="margin-top: 30px;">
          <h3 style="font-size: 14px; margin-bottom: 15px; color: #000; border-bottom: 2px solid #428bca; padding-bottom: 8px;">Payment History</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f8f8f8;">
              <tr>
                <th style="padding: 10px; text-align: left; font-weight: 600; font-size: 11px; border-bottom: 2px solid #ddd;">Payment Date</th>
                <th style="padding: 10px; text-align: left; font-weight: 600; font-size: 11px; border-bottom: 2px solid #ddd;">Method</th>
                <th style="padding: 10px; text-align: left; font-weight: 600; font-size: 11px; border-bottom: 2px solid #ddd;">Reference</th>
                <th style="padding: 10px; text-align: left; font-weight: 600; font-size: 11px; border-bottom: 2px solid #ddd;">Status</th>
                <th style="padding: 10px; text-align: right; font-weight: 600; font-size: 11px; border-bottom: 2px solid #ddd;">Amount</th>
              </tr>
            </thead>
            <tbody style="color: #000;">
              ${invoice.payments
                .map(
                  (payment, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${payment?.payment?.paidAt ? formatDate(payment?.payment?.paidAt) : '-'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${payment?.payment?.mpesaReceipt || payment?.payment?.method || '-'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${payment?.payment?.reference || payment?.payment?.mpesaReceipt || '-'}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${payment?.payment?.status}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px; text-align: right; color: #28a745; font-weight: 600;">${formatCurrency(payment?.amount)}</td>
                </tr>
              `
                )
                .join('')}
              <tr style="background-color: #f0f8ff;">
                <td colspan="4" style="padding: 12px; font-weight: bold; font-size: 11px; border-top: 2px solid #428bca;">Total Paid:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 11px; color: #28a745; border-top: 2px solid #428bca;">${formatCurrency(totalPaid)}</td>
              </tr>
              <tr style="background-color: #fff3cd;">
                <td colspan="4" style="padding: 12px; font-weight: bold; font-size: 11px;">Balance Due:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 11px; color: #dc3545;">${formatCurrency(balance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
          : ''
      }
      
      <div style="margin-top: 40px; text-align: center; color: #666; font-size: 10px;">
        <p>Thank you for using Rentio Property Management System</p>
        <p>This is a computer generated invoice</p>
      </div>
    </div>
  `;

  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  document.body.appendChild(tempDiv);

  // Configure html2pdf options
  const options: any = {
    margin: [10, 10, 10, 10],
    filename: `PROPERTY_${isPaid ? 'RECEIPT' : 'INVOICE'}_${invoice.invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 800,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  // Give the browser time to render, then generate PDF
  setTimeout(() => {
    const element: any = tempDiv.querySelector('#invoice-content');

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      })
      .catch((error: Error) => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(tempDiv);
      });
  }, 100);
};
