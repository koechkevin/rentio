import html2pdf from 'html2pdf.js';
import { PayslipData } from '../types/payslip.types';

export const generatePayslipPDF = (payslip: PayslipData): void => {
  const tempDiv = document.createElement('div');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: payslip.currency || 'KES',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  tempDiv.innerHTML = `
    <div id="payslip-content" style="width: 100%; max-width: 210mm; background: white; padding: 15px; font-family: 'Roboto', 'Helvetica', sans-serif; color: #000;">
      
      <!-- Header with Logo -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px;">
        <div style="display: flex; align-items: flex-start; gap: 15px; flex: 1;">
          ${payslip.companyLogo ? `<img src="${payslip.companyLogo}" style="height: 60px; width: auto; object-fit: contain;" alt="Company Logo">` : ''}
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: bold; font-family: 'Roboto', 'Helvetica', sans-serif;">${payslip.companyName}</h2>
            ${payslip.companyAddress ? `<p style="margin: 5px 0; font-size: 11px; font-family: 'Roboto', 'Helvetica', sans-serif;">${payslip.companyAddress}</p>` : ''}
          </div>
        </div>
        <div style="text-align: right;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #a41e34; font-family: 'Roboto', 'Helvetica', sans-serif;">PAYSLIP</h1>
          <p style="margin: 5px 0; font-size: 11px; font-family: 'Roboto', 'Helvetica', sans-serif;">For the period: ${formatDate(payslip.periodStartDate)} to ${formatDate(payslip.periodEndDate)}</p>
        </div>
      </div>

      <!-- Employee Information -->
      <div style="display: flex; gap: 30px; margin-bottom: 25px;">
        <div style="flex: 1;">
          <table style="width: 100%; font-size: 11px; border-collapse: collapse; font-family: 'Roboto', 'Helvetica', sans-serif;">
            <tr>
              <td style="padding: 5px 0; font-weight: bold; width: 40%;">First Names:</td>
              <td style="padding: 5px 0;">${payslip.firstName}</td>
              <td style="padding: 5px 0 5px 20px; font-weight: bold; width: 30%;">Last Name:</td>
              <td style="padding: 5px 0;">${payslip.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Birth Date:</td>
              <td style="padding: 5px 0;">${payslip.birthDate ? formatDate(payslip.birthDate) : '-'}</td>
              <td style="padding: 5px 0 5px 20px; font-weight: bold;">Position:</td>
              <td style="padding: 5px 0;">${payslip.position}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Period Start Date:</td>
              <td style="padding: 5px 0;">${formatDate(payslip.periodStartDate)}</td>
              <td style="padding: 5px 0 5px 20px; font-weight: bold;">Period End Date:</td>
              <td style="padding: 5px 0;">${formatDate(payslip.periodEndDate)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Engagement Date:</td>
              <td style="padding: 5px 0;">-</td>
              <td style="padding: 5px 0 5px 20px; font-weight: bold;">Termination Date:</td>
              <td style="padding: 5px 0;">-</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="display: flex; gap: 30px; margin-bottom: 25px;">
        <div style="flex: 1;">
          <table style="width: 100%; font-size: 11px; border-collapse: collapse; font-family: 'Roboto', 'Helvetica', sans-serif;">
            <tr>
              <td style="padding: 5px 0; font-weight: bold; width: 40%;">Tax Ref. Number:</td>
              <td style="padding: 5px 0;">${payslip.taxRefNumber}</td>
              <td style="padding: 5px 0 5px 20px; font-weight: bold; width: 30%;">Currency:</td>
              <td style="padding: 5px 0;">${payslip.currency}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Phys. Add:</td>
              <td style="padding: 5px 0;">${payslip.physicalAddress}</td>
              <td style="padding: 5px 0 5px 20px; font-weight: bold;">Pay Rate:</td>
              <td style="padding: 5px 0;">${formatCurrency(payslip.payRate)}</td>
            </tr>
          </table>
        </div>
        <div style="flex: 1; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
          <table style="width: 100%; font-size: 11px; border-collapse: collapse; font-family: 'Roboto', 'Helvetica', sans-serif;">
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">National ID Number</td>
              <td style="padding: 5px 0; text-align: right;">${payslip.socialSecurityNo}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Run:</td>
              <td style="padding: 5px 0; text-align: right;">${payslip.paymentFrequency}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-weight: bold;">Tax Status:</td>
              <td style="padding: 5px 0; text-align: right;">${payslip.taxStatus}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Income Section -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12px; font-weight: bold; background-color: #e8e8e8; padding: 8px; margin: 0 0 10px 0; font-family: 'Roboto', 'Helvetica', sans-serif;">Income</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; font-family: 'Roboto', 'Helvetica', sans-serif;">
          <thead>
            <tr style="background-color: #d0d0d0;">
              <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #999;">Description</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; border: 1px solid #999;">Qty</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #999;">Current</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; border: 1px solid #999;">Tax Code</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #999;">YTD Amount</th>
            </tr>
          </thead>
          <tbody>
            ${payslip.incomeItems
              .map(
                (item, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};">
                <td style="padding: 6px 8px; border: 1px solid #ddd;">${item.description}</td>
                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${item.quantity || '-'}</td>
                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.current)}</td>
                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${item.taxCode || '-'}</td>
                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.ytdAmount)}</td>
              </tr>
            `
              )
              .join('')}
            <tr style="background-color: #e8e8e8; font-weight: bold;">
              <td colspan="2" style="padding: 8px; border: 1px solid #999;">Total Earnings</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #999;">${formatCurrency(payslip.totalEarnings)}</td>
              <td style="padding: 8px; border: 1px solid #999;"></td>
              <td style="padding: 8px; text-align: right; border: 1px solid #999;">${formatCurrency(payslip.totalEarningsYTD)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Deductions Section -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12px; font-weight: bold; background-color: #e8e8e8; padding: 8px; margin: 0 0 10px 0; font-family: 'Roboto', 'Helvetica', sans-serif;">Deductions</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; font-family: 'Roboto', 'Helvetica', sans-serif;">
          <thead>
            <tr style="background-color: #d0d0d0;">
              <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #999;">Description</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; border: 1px solid #999;">Balance</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #999;">Current</th>
              <th style="padding: 8px; text-align: center; font-weight: bold; border: 1px solid #999;">Tax Code</th>
              <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #999;">YTD Amount</th>
            </tr>
          </thead>
          <tbody>
            ${payslip.deductionItems
              .map(
                (item, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};">
                <td style="padding: 6px 8px; border: 1px solid #ddd;">${item.description}</td>
                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${item.balance ? formatCurrency(item.balance) : '-'}</td>
                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.current)}</td>
                <td style="padding: 6px 8px; text-align: center; border: 1px solid #ddd;">${item.taxCode || '-'}</td>
                <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.ytdAmount)}</td>
              </tr>
            `
              )
              .join('')}
            <tr style="background-color: #e8e8e8; font-weight: bold;">
              <td colspan="2" style="padding: 8px; border: 1px solid #999;">Total Deductions</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #999;">${formatCurrency(payslip.totalDeductions)}</td>
              <td style="padding: 8px; border: 1px solid #999;"></td>
              <td style="padding: 8px; text-align: right; border: 1px solid #999;">${formatCurrency(payslip.totalDeductionsYTD)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Net Pay -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 25px;">
        <div style="width: 400px; background-color: #a41e34; color: white; padding: 15px; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; font-family: 'Roboto', 'Helvetica', sans-serif;">
            <span>Net Pay:</span>
            <span>${formatCurrency(payslip.netPay)}</span>
          </div>
        </div>
      </div>

      <!-- Company Contributions -->
      ${
        payslip.companyContributions.length > 0
          ? `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 12px; font-weight: bold; background-color: #e8e8e8; padding: 8px; margin: 0 0 10px 0; font-family: 'Roboto', 'Helvetica', sans-serif;">Company Contributions</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; font-family: 'Roboto', 'Helvetica', sans-serif;">
            <thead>
              <tr style="background-color: #d0d0d0;">
                <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #999;">Description</th>
                <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #999;">Amount</th>
                <th style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #999;">YTD Amount</th>
              </tr>
            </thead>
            <tbody>
              ${payslip.companyContributions
                .map(
                  (item, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};">
                  <td style="padding: 6px 8px; border: 1px solid #ddd;">${item.description}</td>
                  <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.amount)}</td>
                  <td style="padding: 6px 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.ytdAmount)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
          : ''
      }

      <!-- Notes -->
      ${
        payslip.notes
          ? `
        <div style="margin-top: 20px; padding: 10px; background-color: #f0f8ff; border-left: 4px solid #a41e34;">
          <p style="margin: 0; font-size: 10px; font-family: 'Roboto', 'Helvetica', sans-serif;"><strong>Notes:</strong> ${payslip.notes}</p>
        </div>
      `
          : ''
      }

    </div>
  `;

  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);

  const options: any = {
    margin: [8, 8, 8, 8],
    filename: `PAYSLIP_${payslip.firstName}_${payslip.lastName}_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: 900,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  setTimeout(() => {
    const element: any = tempDiv.querySelector('#payslip-content');
    html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        const imgData = element.querySelector('img');
        if (imgData && imgData.complete) {
          pdf.save(options.filename);
          document.body.removeChild(tempDiv);
        } else {
          pdf.save(options.filename);
          document.body.removeChild(tempDiv);
        }
      })
      .catch((error: Error) => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(tempDiv);
      });
  }, 500);
};
