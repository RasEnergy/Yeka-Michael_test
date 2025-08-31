interface ReceiptData {
	invoiceNumber: string;
	studentName: string;
	studentId: string;
	branchName: string;
	gradeName?: string;
	paymentMethod: string;
	amount: number;
	discountAmount?: number;
	finalAmount: number;
	receiptNumber?: string;
	transactionNumber?: string;
	paymentDate: string;
	cashierName: string;
}

export class ReceiptGenerator {
	static generateReceiptPDF(data: ReceiptData): string {
		// In a real implementation, you would use a PDF library like jsPDF or PDFKit
		// For now, we'll return a formatted receipt as HTML that can be printed

		const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment Receipt - ${data.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .school-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .receipt-title { font-size: 16px; font-weight: bold; margin-top: 10px; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .info-label { font-weight: bold; }
            .amount-section { border-top: 1px solid #ccc; margin-top: 15px; padding-top: 10px; }
            .total-amount { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">Yeka Michael Schools</div>
            <div>Payment Receipt</div>
            <div class="receipt-title">Receipt #: ${data.invoiceNumber}</div>
          </div>
          
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Student Name:</span>
              <span>${data.studentName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Student ID:</span>
              <span>${data.studentId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Branch:</span>
              <span>${data.branchName}</span>
            </div>
            ${
							data.gradeName
								? `
            <div class="info-row">
              <span class="info-label">Grade:</span>
              <span>${data.gradeName}</span>
            </div>
            `
								: ""
						}
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span>${data.paymentMethod.replace("_", " ")}</span>
            </div>
            ${
							data.receiptNumber
								? `
            <div class="info-row">
              <span class="info-label">Receipt Number:</span>
              <span>${data.receiptNumber}</span>
            </div>
            `
								: ""
						}
            ${
							data.transactionNumber
								? `
            <div class="info-row">
              <span class="info-label">Transaction Number:</span>
              <span>${data.transactionNumber}</span>
            </div>
            `
								: ""
						}
            <div class="info-row">
              <span class="info-label">Payment Date:</span>
              <span>${new Date(data.paymentDate).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Processed By:</span>
              <span>${data.cashierName}</span>
            </div>
          </div>
          
          <div class="amount-section">
            <div class="info-row">
              <span class="info-label">Registration Amount:</span>
              <span>ETB ${data.amount.toLocaleString()}</span>
            </div>
            ${
							data.discountAmount && data.discountAmount > 0
								? `
            <div class="info-row">
              <span class="info-label">Discount:</span>
              <span>- ETB ${data.discountAmount.toLocaleString()}</span>
            </div>
            `
								: ""
						}
            <div class="info-row total-amount">
              <span class="info-label">Total Paid:</span>
              <span>ETB ${data.finalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Keep this receipt for your records</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

		return receiptHTML;
	}

	static downloadReceipt(data: ReceiptData): void {
		const receiptHTML = this.generateReceiptPDF(data);
		const blob = new Blob([receiptHTML], { type: "text/html" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `Receipt_${data.invoiceNumber}_${data.studentId}.html`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}
