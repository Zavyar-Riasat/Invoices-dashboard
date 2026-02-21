import { renderToBuffer, Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import React from 'react';

// Create styles
const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontSize: 9, 
    fontFamily: 'Helvetica', 
    color: '#1A1A1A', 
    backgroundColor: '#FFFFFF' 
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    borderBottom: 2, 
    borderBottomColor: '#1E3A8A', 
    paddingBottom: 20, 
    marginBottom: 20 
  },
  companySection: { 
    width: '60%' 
  },
  brandTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    letterSpacing: 0.5,
    marginBottom: 4 
  },
  companyDetail: { 
    fontSize: 8, 
    color: '#4B5563', 
    marginTop: 2 
  },
  docLabelContainer: { 
    textAlign: 'right', 
    justifyContent: 'center' 
  },
  docLabel: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    textTransform: 'uppercase' 
  },
  docNumber: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginTop: 4 
  },
  statusBadge: {
    fontSize: 8,
    padding: 4,
    borderRadius: 4,
    marginTop: 8,
    textAlign: 'center',
    backgroundColor: '#E5E7EB',
    color: '#374151'
  },
  grid: { 
    flexDirection: 'row', 
    marginBottom: 20 
  },
  col: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 4, 
    marginRight: 8 
  },
  colLast: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 4, 
    marginRight: 0 
  },
  sectionTitle: { 
    fontSize: 8, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    textTransform: 'uppercase', 
    marginBottom: 6, 
    borderBottom: 1, 
    borderBottomColor: '#E5E7EB', 
    paddingBottom: 2 
  },
  table: { 
    marginTop: 10 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#1E3A8A', 
    color: '#FFFFFF', 
    padding: 8, 
    fontSize: 8,
    fontWeight: 'bold' 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6', 
    padding: 8, 
    alignItems: 'center' 
  },
  zebraRow: { 
    backgroundColor: '#F9FAFB' 
  },
  colDesc: { width: '40%' },
  colQty: { width: '10%', textAlign: 'center' },
  colUnit: { width: '15%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  extraChargesHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#DC2626', 
    color: '#FFFFFF', 
    padding: 8, 
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 15 
  },
  extraDescCol: { width: '60%' },
  extraTypeCol: { width: '20%', textAlign: 'center' },
  extraAmountCol: { width: '20%', textAlign: 'right' },
  summaryContainer: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 20 
  },
  summaryBox: { 
    width: '250pt' 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 4 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8, 
    paddingTop: 8, 
    borderTopWidth: 2, 
    borderTopColor: '#1E3A8A' 
  },
  totalLabel: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#1E3A8A' 
  },
  totalValue: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#1E3A8A' 
  },
  paymentStatusBox: { 
    marginTop: 10, 
    padding: 10, 
    borderRadius: 4, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  signatureSection: {
    marginTop: 30,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 7,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    width: 150,
    marginTop: 15,
  },
  signatureText: {
    fontSize: 8,
    color: '#4B5563',
    marginTop: 5,
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    textAlign: 'center', 
    fontSize: 7, 
    color: '#9CA3AF', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingTop: 10 
  },
});

// Server-compatible PDF component
const InvoicePDFDocument = ({ invoice, companyInfo }) => {
  // Helper functions
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return `£${(amount || 0).toFixed(2)}`;
  };

  // Calculate totals with safe defaults
  const itemsTotal = (invoice?.items || []).reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
  const extraChargesTotal = (invoice?.extraCharges || []).reduce((sum, charge) => sum + (charge.amount || 0), 0) || 0;
  const subtotal = itemsTotal + extraChargesTotal;

  // Get payment status style
  const getPaymentStatusStyle = () => {
    switch(invoice?.paymentStatus) {
      case 'paid': return { backgroundColor: '#DCFCE7', color: '#166534' };
      case 'partial': return { backgroundColor: '#FEF3C7', color: '#92400E' };
      default: return { backgroundColor: '#FEE2E2', color: '#991B1B' };
    }
  };

  const statusStyle = getPaymentStatusStyle();

  return (
    <Document title={`Invoice_${invoice?.invoiceNumber || 'Draft'}`}>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.companySection}>
            <Text style={styles.brandTitle}>{companyInfo?.name || 'Company Name'}</Text>
            <Text style={styles.companyDetail}>{companyInfo?.address || ''}</Text>
            <Text style={styles.companyDetail}>Email: {companyInfo?.email || ''}</Text>
            <Text style={styles.companyDetail}>Phone: {companyInfo?.phone || ''}</Text>
            <Text style={styles.companyDetail}>Web: {companyInfo?.website || ''}</Text>
          </View>
          <View style={styles.docLabelContainer}>
            <Text style={styles.docLabel}>INVOICE</Text>
            <Text style={styles.docNumber}>#{invoice?.invoiceNumber || 'DRAFT'}</Text>
            <Text style={styles.statusBadge}>
              Status: {(invoice?.status || 'draft').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Client & Invoice Info Grid */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{invoice?.clientName || 'N/A'}</Text>
            <Text style={{ marginTop: 2 }}>{invoice?.clientPhone || 'N/A'}</Text>
            <Text>{invoice?.clientEmail || 'N/A'}</Text>
          </View>
          <View style={styles.colLast}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={{ fontSize: 9 }}>
              Invoice Date: <Text style={{ fontWeight: 'bold' }}>{formatDate(invoice?.invoiceDate)}</Text>
            </Text>
            <Text style={{ marginTop: 2, fontSize: 9 }}>
              Due Date: <Text style={{ fontWeight: 'bold' }}>{formatDate(invoice?.dueDate)}</Text>
            </Text>
            <Text style={{ marginTop: 2, fontSize: 9 }}>
              Generated: {formatDate(new Date())}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnit}>Unit</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          
          {(invoice?.items || []).length > 0 ? (
            invoice.items.map((item, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.zebraRow : {}]}>
                <Text style={styles.colDesc}>{item.name || 'Item'}</Text>
                <Text style={styles.colQty}>{item.quantity || 0}</Text>
                <Text style={styles.colUnit}>{item.unit || 'pc'}</Text>
                <Text style={styles.colRate}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={styles.colTotal}>{formatCurrency(item.totalPrice)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>No items</Text>
              <Text style={styles.colQty}>-</Text>
              <Text style={styles.colUnit}>-</Text>
              <Text style={styles.colRate}>-</Text>
              <Text style={styles.colTotal}>-</Text>
            </View>
          )}
        </View>

        {/* Extra Charges Table */}
        {(invoice?.extraCharges || []).length > 0 && (
          <View style={{ marginTop: 15 }}>
            <View style={styles.extraChargesHeader}>
              <Text style={styles.extraDescCol}>Extra Charges</Text>
              <Text style={styles.extraTypeCol}>Type</Text>
              <Text style={styles.extraAmountCol}>Amount</Text>
            </View>
            
            {invoice.extraCharges.map((charge, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.zebraRow : {}]}>
                <Text style={styles.extraDescCol}>{charge.description || 'Extra charge'}</Text>
                <Text style={styles.extraTypeCol}>
                  {(charge.type || 'other').charAt(0).toUpperCase() + (charge.type || 'other').slice(1)}
                </Text>
                <Text style={styles.extraAmountCol}>{formatCurrency(charge.amount)}</Text>
              </View>
            ))}
            
            {/* Extra Charges Total */}
            <View style={[styles.tableRow, { backgroundColor: '#FEE2E2', borderTopWidth: 1, borderTopColor: '#DC2626' }]}>
              <Text style={[styles.extraDescCol, { fontWeight: 'bold' }]}>Total Extra Charges</Text>
              <Text style={styles.extraTypeCol}></Text>
              <Text style={[styles.extraAmountCol, { fontWeight: 'bold', color: '#DC2626' }]}>
                {formatCurrency(extraChargesTotal)}
              </Text>
            </View>
          </View>
        )}

        {/* Financial Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>Items Subtotal</Text>
              <Text>{formatCurrency(itemsTotal)}</Text>
            </View>
            
            {extraChargesTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: '#6B7280' }}>Extra Charges</Text>
                <Text style={{ color: '#DC2626' }}>+{formatCurrency(extraChargesTotal)}</Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>Subtotal</Text>
              <Text>{formatCurrency(subtotal)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>VAT ({invoice?.vatPercentage || 0}%)</Text>
              <Text>{formatCurrency(invoice?.vatAmount || 0)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice?.totalAmount || 0)}</Text>
            </View>

            {/* Payment Status */}
            <View style={[styles.paymentStatusBox, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={{ fontWeight: 'bold', color: statusStyle.color }}>Payment Status:</Text>
              <Text style={{ fontWeight: 'bold', color: statusStyle.color }}>
                {(invoice?.paymentStatus || 'unpaid').toUpperCase()}
              </Text>
            </View>

            {/* Payment Summary */}
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>Amount Paid:</Text>
              <Text style={{ color: '#059669' }}>{formatCurrency(invoice?.amountPaid || 0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>Remaining Balance:</Text>
              <Text style={{ color: (invoice?.remainingAmount || 0) > 0 ? '#DC2626' : '#059669' }}>
                {formatCurrency(invoice?.remainingAmount || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Customer Signature</Text>
            {invoice?.signature?.data ? (
              <>
                <Text style={styles.signatureText}>
                  Signed by: {invoice.signature.signedBy || invoice.clientName}
                </Text>
                <Text style={styles.signatureText}>
                  Date: {formatDateTime(invoice.signature.signedAt)}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Not signed yet</Text>
              </>
            )}
          </View>
          
          <View style={{ width: '45%', alignItems: 'flex-end' }}>
            <Text style={styles.signatureLabel}>Company Stamp</Text>
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1E3A8A' }}>{companyInfo?.name}</Text>
              <Text style={styles.signatureText}>Authorized Signature</Text>
              <Text style={styles.signatureText}>{formatDate(new Date())}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Confirmation */}
        {invoice?.deliveryConfirmed && (
          <View style={[styles.paymentStatusBox, { backgroundColor: '#DCFCE7', marginTop: 15 }]}>
            <Text style={{ fontWeight: 'bold', color: '#166534' }}>Delivery Confirmed</Text>
            <Text style={{ fontWeight: 'bold', color: '#166534' }}>
              {formatDateTime(invoice.deliveryConfirmedAt)}
            </Text>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
          <Text style={{ fontSize: 8, color: '#4B5563', lineHeight: 1.4 }}>
            Payment is due within 30 days. Please include the invoice number with your payment.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business. This is a computer generated invoice.
        </Text>
      </Page>
    </Document>
  );
};

export async function generateInvoicePDF(invoice, companyInfo) {
  try {
    console.log('📄 Starting PDF generation for invoice:', invoice?.invoiceNumber);
    
    // Validate inputs
    if (!invoice) {
      throw new Error('Invoice data is required');
    }
    
    if (!companyInfo) {
      throw new Error('Company info is required');
    }
    
    console.log('✅ Input validation passed');
    
    // Create the PDF element
    const element = <InvoicePDFDocument invoice={invoice} companyInfo={companyInfo} />;
    
    // Render to buffer
    console.log('🔄 Rendering PDF to buffer...');
    const buffer = await renderToBuffer(element);
    
    console.log('✅ PDF generated successfully, size:', buffer.length, 'bytes');
    return buffer;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}