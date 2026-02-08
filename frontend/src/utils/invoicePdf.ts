import html2pdf from 'html2pdf.js';
import { Invoice } from '../types/invoice.types';

/**
 * Generates and downloads a PDF invoice using html2pdf
 * @param invoice - The invoice data to generate PDF from
 */
export const generateInvoicePDF = (invoice: Invoice): void => {
  // Create a temporary container with content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `
    <div id="invoice-content" style="width: 100%; max-width: 190mm; background: white; padding: 10px;">
      <div class="header" style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 28px; color: #000; margin-bottom: 15px;">INVOICE</h1>
      </div>
      
      <div class="invoice-info" style="margin-bottom: 20px; color: #000;">
        <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p style="margin: 5px 0;"><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> ${invoice.status}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <h3 style="font-size: 14px; margin-bottom: 10px; color: #000;">Bill To:</h3>
          <p style="margin: 5px 0; color: #000;">${invoice.customer?.fullName || 'N/A'}</p>
          <p style="margin: 5px 0; color: #000;">${invoice.customer?.email || 'N/A'}</p>
          <p style="margin: 5px 0; color: #000;">${invoice.customer?.phone || 'N/A'}</p>
        </div>
        
        <div style="width: 48%; text-align: right;">
          <h3 style="font-size: 14px; margin-bottom: 10px; color: #000;">Property Details:</h3>
          <p style="margin: 5px 0; color: #000;">${invoice.property?.name || 'N/A'}</p>
          <p style="margin: 5px 0; color: #000;">Unit: ${invoice.unit?.unitNumber || 'N/A'}</p>
          <p style="margin: 5px 0; color: #000;">Type: ${invoice.unit?.type || 'N/A'}</p>
        </div>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead style="background-color: #428bca; color: white;">
          <tr>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 11px;">Item</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 11px;">Description</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 11px;">Unit Amount</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 11px;">Qty</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 11px;">Duration</th>
            <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 11px;">Period</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; font-size: 11px;">VAT Incl.</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; font-size: 11px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            invoice.items
              ?.map(
                (item, index) => `
            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${item.itemName}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${item.itemDescription || '-'}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px; text-align: right;">KES ${Number(item.unitAmount).toFixed(2)}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${item.billingDuration}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px;">${item.billingPeriod ? new Date(item.billingPeriod).toLocaleDateString() : '-'}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px; text-align: center;">${item.vatable ? '✓' : '-'}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 11px; text-align: right;">KES ${Number(item.total).toFixed(2)}</td>
            </tr>
          `
              )
              .join('') || '<tr><td colspan="8" style="text-align: center; padding: 20px;">No items</td></tr>'
          }
        </tbody>
      </table>
      
      <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #000;">
            <span>Subtotal:</span>
            <span>KES ${Number(invoice.subTotal).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #000;">
            <span>VAT (${invoice.vatRate}%):</span>
            <span>KES ${Number(invoice.vatAmount).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #000; margin-top: 10px; font-weight: bold; font-size: 14px; color: #000;">
            <span>Total:</span>
            <span>KES ${Number(invoice.totalAmount).toFixed(2)}</span>
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
      
    </div>
  `;

  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  document.body.appendChild(tempDiv);

  // Configure html2pdf options
  const options: any = {
    margin: [10, 10, 10, 10],
    filename: `${invoice.invoiceNumber}.pdf`,
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
