import { renderToBuffer, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: { 
    padding: 0,
    fontSize: 9, 
    fontFamily: 'Helvetica', 
    color: '#1F2937', 
    backgroundColor: '#FFFFFF' 
  },
  sidebarAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#1E3A8A',
  },
  mainContainer: {
    padding: 40,
  },
  
  // Header
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 30 
  },
  brandSection: { 
    flex: 1,
    maxWidth: '60%'
  },
  brandTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  companyDetail: { fontSize: 8, color: '#6B7280', marginTop: 2 },
  
  docInfoBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    textAlign: 'right',
    minWidth: 180
  },
  docLabel: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
  docNumber: { fontSize: 11, color: '#374151', marginTop: 4, fontWeight: 'bold' },

  // Address Card
  addressCard: { 
    backgroundColor: '#EFF6FF', 
    padding: 12, 
    borderRadius: 6, 
    marginBottom: 25,
    borderLeft: 4, 
    borderLeftColor: '#1E3A8A' 
  },
  addressRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  addressBox: { 
    width: '48%' 
  },
  addressLabel: { 
    fontSize: 7, 
    fontWeight: 'bold', 
    color: '#3B82F6', 
    textTransform: 'uppercase', 
    marginBottom: 2 
  },
  addressText: { 
    fontSize: 9, 
    lineHeight: 1.4,
    color: '#1F2937'
  },

  // Info Grid
  grid: { flexDirection: 'row', marginBottom: 25, gap: 15 },
  col: { flex: 1, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 6 },
  sectionTitle: { 
    fontSize: 7, 
    fontWeight: 'bold', 
    color: '#1E3A8A', 
    textTransform: 'uppercase', 
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 3
  },

  // Table Styling with Borders
  table: { 
    marginTop: 10, 
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden' 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    color: '#1E3A8A', 
    fontWeight: 'bold',
    fontSize: 8
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB', 
    alignItems: 'center',
    minHeight: 25
  },
  zebraRow: { backgroundColor: '#F9FAFB' },
  
  // Bordered Cells
  cell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  cellLast: {
    padding: 8,
    borderRightWidth: 0,
  },

  // Column Widths
  colDesc: { width: '45%' },
  colQty: { width: '10%', textAlign: 'center' },
  colUnit: { width: '15%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },

  // Extra Charges Table
  extraHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#FEE2E2', 
    color: '#991B1B', 
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FECACA',
    fontWeight: 'bold',
    fontSize: 8
  },
  extraRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FECACA',
    padding: 8
  },

  // Side-by-Side Bottom Section
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 20
  },

  // Signature (Left Side)
  signatureArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  signatureContainer: {
    marginTop: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  signatureImage: {
    maxHeight: 60,
    maxWidth: 180,
    objectFit: 'contain',
  },
  sigLine: { borderBottomWidth: 1, borderBottomColor: '#9CA3AF', width: '100%', marginTop: 35 },

  // Totals (Right Side)
  summaryBox: { 
    width: '200pt'
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 5 },
  grandTotalBox: { 
    backgroundColor: '#1E3A8A', 
    borderRadius: 6, 
    padding: 10, 
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  grandTotalText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

  // Delivery/Footer
  deliveryBox: {
    marginTop: 15,
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7'
  },
  deliveryText: { fontWeight: 'bold', color: '#166534', fontSize: 8 },

  footer: { 
    position: 'absolute', 
    bottom: 20, 
    left: 40, 
    right: 40, 
    textAlign: 'center', 
    fontSize: 7, 
    color: '#9CA3AF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    paddingTop: 10
  }
});

const InvoicePDFDocument = ({ invoice, companyInfo }) => {
  const formatCurrency = (val) => `£${(val || 0).toFixed(2)}`;
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return 'Invalid date'; }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'Invalid date'; }
  };

  const booking = invoice?.booking || {};
  const subtotalItems = (invoice?.items || []).reduce((s, i) => s + (i.totalPrice || 0), 0);
  const subtotalExtra = (invoice?.extraCharges || []).reduce((s, c) => s + (c.amount || 0), 0);
  const subtotal = subtotalItems + subtotalExtra;
  const totalAmount = invoice?.totalAmount || 0;
  const remainingAmount = invoice?.remainingAmount || 0;
  const paymentStatus = invoice?.paymentStatus || 'unpaid';

  return (
    <Document title={`Invoice_${invoice?.invoiceNumber || 'Draft'}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebarAccent} />
        
        <View style={styles.mainContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.brandSection}>
              <Text style={styles.brandTitle}>{companyInfo?.name || 'Company Name'}</Text>
              <Text style={styles.companyDetail}>{companyInfo?.address || ''}</Text>
              <Text style={styles.companyDetail}>{companyInfo?.phone || ''} | {companyInfo?.email || ''}</Text>
              <Text style={styles.companyDetail}>{companyInfo?.website || ''}</Text>
            </View>
            <View style={styles.docInfoBox}>
              <Text style={styles.docLabel}>INVOICE</Text>
              <Text style={styles.docNumber}>#{invoice?.invoiceNumber || 'DRAFT'}</Text>
              <Text style={{ fontSize: 7, color: '#1E3A8A', marginTop: 4 }}>
                Status: {(invoice?.status || 'draft').toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Locations */}
          {(booking?.pickupAddress || booking?.deliveryAddress) && (
            <View style={styles.addressCard}>
              <View style={styles.addressRow}>
                <View style={styles.addressBox}>
                  <Text style={styles.addressLabel}>PICKUP LOCATION</Text>
                  <Text style={styles.addressText}>{booking.pickupAddress || 'N/A'}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#BFDBFE', marginHorizontal: 10 }} />
                <View style={styles.addressBox}>
                  <Text style={styles.addressLabel}>DELIVERY LOCATION</Text>
                  <Text style={styles.addressText}>{booking.deliveryAddress || 'N/A'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Client & Date Info */}
          <View style={styles.grid}>
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{invoice?.clientName || 'N/A'}</Text>
              <Text style={styles.companyDetail}>{invoice?.clientPhone || 'N/A'}</Text>
              <Text style={styles.companyDetail}>{invoice?.clientEmail || 'N/A'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 8 }}>Issue Date:</Text>
                <Text style={{ fontWeight: 'bold' }}>{formatDate(invoice?.invoiceDate)}</Text>
              </View>
              {booking?.shiftingDate && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 8 }}>Move Date:</Text>
                  <Text style={{ fontWeight: 'bold' }}>{formatDate(booking.shiftingDate)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bordered Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.colDesc]}>Description</Text>
              <Text style={[styles.cell, styles.colQty]}>Qty</Text>
              <Text style={[styles.cell, styles.colUnit]}>Unit</Text>
              <Text style={[styles.cell, styles.colRate]}>Rate</Text>
              <Text style={[styles.cellLast, styles.colTotal]}>Total</Text>
            </View>
            {(invoice?.items || []).length > 0 ? (
              invoice.items.map((item, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.zebraRow : {}]}>
                  <Text style={[styles.cell, styles.colDesc]}>{item.name || 'Item'}</Text>
                  <Text style={[styles.cell, styles.colQty]}>{item.quantity || 0}</Text>
                  <Text style={[styles.cell, styles.colUnit]}>{item.unit || 'pc'}</Text>
                  <Text style={[styles.cell, styles.colRate]}>{formatCurrency(item.unitPrice)}</Text>
                  <Text style={[styles.cellLast, styles.colTotal]}>{formatCurrency(item.totalPrice)}</Text>
                </View>
              ))
            ) : null}
            {/* Items Subtotal Footer in Table */}
            <View style={[styles.tableRow, { backgroundColor: '#F9FAFB', fontWeight: 'bold' }]}>
              <Text style={[styles.cell, { width: '85%', textAlign: 'right' }]}>Items Subtotal</Text>
              <Text style={[styles.cellLast, styles.colTotal]}>{formatCurrency(subtotalItems)}</Text>
            </View>
          </View>

          {/* Bordered Extra Charges Table */}
          {(invoice?.extraCharges || []).length > 0 && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.extraHeader}>
                <Text style={[styles.cell, { width: '80%' }]}>Additional Charges</Text>
                <Text style={[styles.cellLast, { width: '20%', textAlign: 'right' }]}>Amount</Text>
              </View>
              {invoice.extraCharges.map((charge, i) => (
                <View key={i} style={styles.extraRow}>
                  <Text style={{ width: '80%', color: '#991B1B' }}>{charge.description || 'Extra charge'}</Text>
                  <Text style={{ width: '20%', textAlign: 'right', color: '#991B1B', fontWeight: 'bold' }}>
                    {formatCurrency(charge.amount)}
                  </Text>
                </View>
              ))}
              <View style={[styles.extraRow, { backgroundColor: '#FEE2E2' }]}>
                <Text style={{ width: '80%', fontWeight: 'bold', color: '#991B1B' }}>Total Additional</Text>
                <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#DC2626' }}>
                  {formatCurrency(subtotalExtra)}
                </Text>
              </View>
            </View>
          )}

          {/* Side-by-Side Summary and Signature */}
          <View style={styles.bottomSection}>
            {/* Left: Signature */}
            <View style={styles.signatureArea}>
              <Text style={styles.sectionTitle}>Customer Acknowledgment</Text>
              {invoice?.signature?.data ? (
                <View>
                  <Text style={{ fontSize: 7, color: '#4B5563' }}>Signed by: {invoice.signature.signedBy || invoice.clientName}</Text>
                  <Text style={{ fontSize: 7, color: '#4B5563' }}>Date: {formatDateTime(invoice.signature.signedAt)}</Text>
                  <View style={styles.signatureContainer}>
                    <Image src={invoice.signature.data} style={styles.signatureImage} />
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.sigLine} />
                  <Text style={{ fontSize: 7, color: '#9CA3AF', marginTop: 4 }}>Customer Signature</Text>
                </View>
              )}
              
              {invoice?.deliveryConfirmed && (
                <View style={styles.deliveryBox}>
                  <Text style={styles.deliveryText}>✓ Delivery Confirmed</Text>
                  <Text style={styles.deliveryText}>{formatDate(invoice.deliveryConfirmedAt)}</Text>
                </View>
              )}
            </View>

            {/* Right: Financial Summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={{ color: '#6B7280' }}>Items Total</Text>
                <Text>{formatCurrency(subtotalItems)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: '#6B7280' }}>Additional Fees</Text>
                <Text>{formatCurrency(subtotalExtra)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: '#6B7280' }}>VAT ({invoice?.vatPercentage || 0}%)</Text>
                <Text>{formatCurrency(invoice?.vatAmount || 0)}</Text>
              </View>
              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalText}>GRAND TOTAL</Text>
                <Text style={styles.grandTotalText}>{formatCurrency(totalAmount)}</Text>
              </View>
              
              <View style={[styles.summaryRow, { marginTop: 10 }]}>
                <Text style={{ color: '#6B7280' }}>Amount Paid</Text>
                <Text style={{ color: '#059669', fontWeight: 'bold' }}>{formatCurrency(invoice?.amountPaid || 0)}</Text>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 6 }]}>
                <Text style={{ fontWeight: 'bold' }}>Remaining Balance</Text>
                <Text style={{ color: remainingAmount > 0 ? '#DC2626' : '#059669', fontWeight: 'bold' }}>
                  {formatCurrency(remainingAmount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment History (Optional condensed) */}
          {(invoice?.paymentHistory || []).length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.historyTitle}>Payment Log</Text>
              {invoice.paymentHistory.map((payment, idx) => (
                <View key={idx} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{formatDateTime(payment.date)}</Text>
                  <Text style={styles.historyMethod}>{payment.method}</Text>
                  <Text style={styles.historyAmount}>{formatCurrency(payment.amount)}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.footer}>
            Thank you for choosing {companyInfo?.name}.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateInvoicePDF(invoice, companyInfo) {
  try {
    if (!invoice || !companyInfo) throw new Error('Missing data');
    const element = <InvoicePDFDocument invoice={invoice} companyInfo={companyInfo} />;
    return await renderToBuffer(element);
  } catch (error) {
    console.error('❌ PDF Error:', error);
    throw error;
  }
}