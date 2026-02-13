import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateQuotePDF = (quote, companyInfo) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(40, 53, 147);
  doc.text(companyInfo.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(companyInfo.address, 105, 28, { align: 'center' });
  doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email}`, 105, 34, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('QUOTATION', 105, 50, { align: 'center' });
  
  // Quote Info
  doc.setFontSize(10);
  doc.text(`Quote Number: ${quote.quoteNumber}`, 20, 60);
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 20, 66);
  doc.text(`Valid Until: ${new Date(new Date(quote.createdAt).getTime() + quote.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 20, 72);
  
  // Client Info
  doc.text('BILL TO:', 130, 60);
  doc.text(quote.clientName, 130, 66);
  doc.text(quote.clientPhone, 130, 72);
  if (quote.clientEmail) {
    doc.text(quote.clientEmail, 130, 78);
  }
  
  // Items Table
  const itemsData = quote.items.map(item => [
    item.name,
    item.quantity,
    item.unit,
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.totalPrice.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: 90,
    head: [['Description', 'Qty', 'Unit', 'Unit Price', 'Total']],
    body: itemsData,
    theme: 'striped',
    headStyles: { fillColor: [40, 53, 147] },
  });
  
  let finalY = doc.lastAutoTable.finalY + 10;
  
  // Additional Charges
  if (quote.additionalCharges.length > 0) {
    doc.setFontSize(12);
    doc.text('Additional Charges', 20, finalY);
    finalY += 8;
    
    quote.additionalCharges.forEach(charge => {
      doc.setFontSize(10);
      doc.text(`${charge.description}: $${charge.amount.toFixed(2)}`, 30, finalY);
      finalY += 6;
    });
  }
  
  // Discounts
  if (quote.discounts.length > 0) {
    doc.setFontSize(12);
    doc.text('Discounts', 20, finalY);
    finalY += 8;
    
    quote.discounts.forEach(discount => {
      doc.setFontSize(10);
      doc.text(`${discount.description}: $${discount.amount.toFixed(2)}`, 30, finalY);
      finalY += 6;
    });
  }
  
  // Summary
  finalY += 10;
  doc.setFontSize(10);
  doc.text('Subtotal:', 130, finalY);
  doc.text(`$${quote.subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });
  finalY += 6;
  
  if (quote.totalAdditionalCharges > 0) {
    doc.text('Additional Charges:', 130, finalY);
    doc.text(`$${quote.totalAdditionalCharges.toFixed(2)}`, 180, finalY, { align: 'right' });
    finalY += 6;
  }
  
  if (quote.totalDiscount > 0) {
    doc.text('Discount:', 130, finalY);
    doc.text(`-$${quote.totalDiscount.toFixed(2)}`, 180, finalY, { align: 'right' });
    finalY += 6;
  }
  
  doc.text(`VAT (${quote.vatPercentage}%):`, 130, finalY);
  doc.text(`$${quote.vatAmount.toFixed(2)}`, 180, finalY, { align: 'right' });
  finalY += 8;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('GRAND TOTAL:', 130, finalY);
  doc.text(`$${quote.grandTotal.toFixed(2)}`, 180, finalY, { align: 'right' });
  
  // Notes & Terms
  finalY += 20;
  if (quote.notes) {
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Notes:', 20, finalY);
    doc.setFont(undefined, 'normal');
    doc.text(quote.notes, 20, finalY + 6, { maxWidth: 170 });
    finalY += 20;
  }
  
  doc.setFont(undefined, 'bold');
  doc.text('Terms & Conditions:', 20, finalY);
  doc.setFont(undefined, 'normal');
  const splitTerms = doc.splitTextToSize(quote.termsConditions || 'Payment due within 30 days. Prices valid for 30 days.', 170);
  doc.text(splitTerms, 20, finalY + 6);
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text(companyInfo.name, 105, 295, { align: 'center' });
  }
  
  return doc;
};