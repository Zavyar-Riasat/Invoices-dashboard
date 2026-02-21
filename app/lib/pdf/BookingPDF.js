"use client";

import React, { useState, useEffect } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font
} from '@react-pdf/renderer';
import { FiDownload, FiLoader, FiCheck } from 'react-icons/fi';

// Define professional styles
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#1A1A1A', backgroundColor: '#FFFFFF' },
  
  // Header Section
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: 2, borderBottomColor: '#1E3A8A', paddingBottom: 20, marginBottom: 20 },
  companySection: { width: '60%' },
  brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A', letterSpacing: 0.5 },
  companyDetail: { fontSize: 8, color: '#4B5563', marginTop: 2 },
  
  // Document Type Header
  docLabelContainer: { textAlign: 'right', justifyContent: 'center' },
  docLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', textTransform: 'uppercase' },
  docNumber: { fontSize: 10, color: '#6B7280', marginTop: 4 },

  // Summary Grid (Client & Schedule)
  grid: { flexDirection: 'row', marginBottom: 20 },
  col: { flex: 1, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4, marginRight: 8 },
  colLast: { flex: 1, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4, marginRight: 0 },
  sectionTitle: { fontSize: 8, fontWeight: 'bold', color: '#1E3A8A', textTransform: 'uppercase', marginBottom: 6, borderBottom: 1, borderBottomColor: '#E5E7EB', paddingBottom: 2 },
  
  // Address Styling
  addressCard: { padding: 12, backgroundColor: '#EFF6FF', borderRadius: 6, marginBottom: 20, borderLeft: 4, borderLeftColor: '#1E3A8A' },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  addressBox: { width: '48%' },
  addressLabel: { fontSize: 7, fontWeight: 'bold', color: '#3B82F6', textTransform: 'uppercase', marginBottom: 2 },
  addressText: { fontSize: 9, lineHeight: 1.4 },

  // Table Layout
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1E3A8A', color: '#FFFFFF', padding: 6, borderRadius: 2, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', padding: 6, alignItems: 'center' },
  zebraRow: { backgroundColor: '#F9FAFB' },
  
  // Table Columns
  cellDesc: { width: '45%' },
  cellQty: { width: '10%', textAlign: 'center' },
  cellUnit: { width: '15%', textAlign: 'center' },
  cellRate: { width: '15%', textAlign: 'right' },
  cellTotal: { width: '15%', textAlign: 'right' },

  // Extra Charges Section
  extraChargesContainer: { marginTop: 10 },
  extraChargesHeader: { flexDirection: 'row', backgroundColor: '#DC2626', color: '#FFFFFF', padding: 6, borderRadius: 2, fontWeight: 'bold' },
  extraChargesRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', padding: 6, alignItems: 'center' },
  extraChargesCellDesc: { width: '60%' },
  extraChargesCellType: { width: '20%', textAlign: 'center' },
  extraChargesCellAmount: { width: '20%', textAlign: 'right' },

  // Financial Section
  financialContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  summaryBox: { width: '200pt' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#1E3A8A' },
  totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#1E3A8A' },
  totalValue: { fontSize: 12, fontWeight: 'bold', color: '#1E3A8A' },

  // Payment Status Ribbon
  balanceBox: { marginTop: 10, padding: 8, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between' },
  paidStatus: { backgroundColor: '#DCFCE7', color: '#166534' },
  unpaidStatus: { backgroundColor: '#FFEDD5', color: '#9A3412' },

  // Notes and History
  historyTitle: { fontSize: 9, fontWeight: 'bold', color: '#1E3A8A', marginTop: 20, marginBottom: 8, textTransform: 'uppercase' },
  historyRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 4, fontSize: 8 },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 7, color: '#9CA3AF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
});

// The Professional PDF Component
export const MyBookingDocument = ({ booking, companyInfo }) => {
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';
  const formatDateTime = (date) => date ? new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD';

  // Calculate items total
  const itemsTotal = (booking.items || []).reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  
  // Calculate extra charges total
  const extraChargesTotal = (booking.extraCharges || []).reduce((sum, charge) => sum + (charge.amount || 0), 0);
  
  // Calculate subtotal (items + extra charges)
  const subtotal = itemsTotal + extraChargesTotal;
  
  const vat = booking.vatAmount || 0;
  const grandTotal = subtotal + vat;
  const totalPaid = (booking.paymentHistory || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingBalance = Math.max(0, grandTotal - totalPaid);

  return (
    <Document title={`Booking_${booking.bookingNumber}`}>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.companySection}>
            <Text style={styles.brandTitle}>{companyInfo.name}</Text>
            <Text style={styles.companyDetail}>{companyInfo.address}</Text>
            <Text style={styles.companyDetail}>Email: {companyInfo.email} | Web: {companyInfo.website}</Text>
            <Text style={styles.companyDetail}>Phone: {companyInfo.phone}</Text>
          </View>
          <View style={styles.docLabelContainer}>
            <Text style={styles.docLabel}>Booking Confirmation</Text>
            <Text style={styles.docNumber}>Ref: #{booking.bookingNumber || booking._id?.slice(-6).toUpperCase()}</Text>
            <Text style={[styles.docNumber, { color: '#1E3A8A', fontWeight: 'bold' }]}>
              Status: {(booking.status || 'Pending').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Client & Date Info Grid */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Client Details</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{booking.clientName}</Text>
            <Text style={{ marginTop: 2 }}>{booking.clientPhone}</Text>
            <Text>{booking.clientEmail}</Text>
          </View>
          <View style={styles.colLast}>
            <Text style={styles.sectionTitle}>Move Schedule</Text>
            <Text style={{ fontSize: 10 }}>Move Date: <Text style={{ fontWeight: 'bold' }}>{formatDate(booking.shiftingDate)}</Text></Text>
            <Text style={{ marginTop: 2 }}>Move Time: {booking.shiftingTime || 'Flexible'}</Text>
            <Text style={{ marginTop: 2 }}>Generated: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Professional Address Card */}
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Pickup Location</Text>
              <Text style={styles.addressText}>{booking.pickupAddress}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#BFDBFE', marginHorizontal: 15 }} />
            <View style={styles.addressBox}>
              <Text style={styles.addressLabel}>Delivery Location</Text>
              <Text style={styles.addressText}>{booking.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {/* Inventory Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellDesc}>Item Description</Text>
            <Text style={styles.cellQty}>Qty</Text>
            <Text style={styles.cellUnit}>Unit</Text>
            <Text style={styles.cellRate}>Rate</Text>
            <Text style={styles.cellTotal}>Total</Text>
          </View>
          {(booking.items || []).map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.zebraRow : {}]}>
              <Text style={styles.cellDesc}>{item.name}</Text>
              <Text style={styles.cellQty}>{item.quantity}</Text>
              <Text style={styles.cellUnit}>{item.unit || 'pc'}</Text>
              <Text style={styles.cellRate}>£{(item.unitPrice || 0).toFixed(2)}</Text>
              <Text style={styles.cellTotal}>£{(item.totalPrice || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Extra Charges Table */}
        {booking.extraCharges && booking.extraCharges.length > 0 && (
          <View style={styles.extraChargesContainer}>
            <View style={styles.extraChargesHeader}>
              <Text style={styles.extraChargesCellDesc}>Extra Charge Description</Text>
              <Text style={styles.extraChargesCellType}>Type</Text>
              <Text style={styles.extraChargesCellAmount}>Amount</Text>
            </View>
            {(booking.extraCharges || []).map((charge, i) => (
              <View key={i} style={[styles.extraChargesRow, i % 2 === 1 ? styles.zebraRow : {}]}>
                <Text style={styles.extraChargesCellDesc}>{charge.description}</Text>
                <Text style={styles.extraChargesCellType}>{(charge.type || 'other').charAt(0).toUpperCase() + (charge.type || 'other').slice(1)}</Text>
                <Text style={styles.extraChargesCellAmount}>£{(charge.amount || 0).toFixed(2)}</Text>
              </View>
            ))}
            {/* Extra Charges Total */}
            <View style={[styles.extraChargesRow, { backgroundColor: '#FEE2E2', borderTopWidth: 1, borderTopColor: '#DC2626' }]}>
              <Text style={[styles.extraChargesCellDesc, { fontWeight: 'bold' }]}>Total Extra Charges</Text>
              <Text style={styles.extraChargesCellType}></Text>
              <Text style={[styles.extraChargesCellAmount, { fontWeight: 'bold', color: '#DC2626' }]}>£{extraChargesTotal.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Financial Summary */}
        <View style={styles.financialContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>Items Subtotal</Text>
              <Text>£{(itemsTotal).toFixed(2)}</Text>
            </View>
            
            {/* Extra Charges Line in Summary */}
            {extraChargesTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: '#6B7280' }}>Extra Charges</Text>
                <Text style={{ color: '#DC2626' }}>+£{extraChargesTotal.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>Net Subtotal</Text>
              <Text>£{(subtotal).toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={{ color: '#6B7280' }}>VAT ({booking.vatPercentage || 0}%)</Text>
              <Text>£{(vat).toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalValue}>£{(grandTotal).toFixed(2)}</Text>
            </View>

            {/* Payment Summary Ribbon */}
            <View style={[styles.balanceBox, remainingBalance === 0 ? styles.paidStatus : styles.unpaidStatus]}>
              <Text style={{ fontWeight: 'bold' }}>Balance Outstanding:</Text>
              <Text style={{ fontWeight: 'bold' }}>£{remainingBalance.toFixed(2)}</Text>
            </View>
            <Text style={{ fontSize: 7, color: '#6B7280', textAlign: 'right', marginTop: 4 }}>
              Total Paid to Date: £{totalPaid.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment History Segment */}
        {booking.paymentHistory?.length > 0 && (
          <View wrap={false}>
            <Text style={styles.historyTitle}>Payment History</Text>
            {booking.paymentHistory.map((p, idx) => (
              <View key={idx} style={styles.historyRow}>
                <Text style={{ width: '30%' }}>{formatDateTime(p.date)}</Text>
                <Text style={{ width: '25%', color: '#4B5563' }}>{p.method}</Text>
                <Text style={{ width: '25%', fontStyle: 'italic' }}>{p.notes || 'Payment received'}</Text>
                <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>£{p.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => (
          `Thank you for choosing ${companyInfo.name}. This is a computer generated document. Page ${pageNumber} of ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

// UI Button Component
export const BookingDownloadButton = ({ booking, companyInfo }) => {
  const [isClient, setIsClient] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient) return <FiLoader className="animate-spin text-gray-400" />;

  return (
    <div onMouseEnter={() => setReady(true)}>
      {!ready ? (
        <button className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors">
          <FiDownload /> Generate Invoice
        </button>
      ) : (
        <PDFDownloadLink
          document={<MyBookingDocument booking={booking} companyInfo={companyInfo} />}
          fileName={`Booking_${booking.bookingNumber}.pdf`}
        >
          {({ loading }) => (
            <div className={`flex items-center gap-2 px-2 py-1 text-sm font-bold rounded-lg transition-all ${
              loading ? 'bg-gray-100 text-black cursor-wait' : 'bg-secondary text-white hover:bg-emerald-700 shadow-md'
            }`}>
              {loading ? <FiLoader className="animate-spin" /> : <FiCheck />}
              {loading ? 'Processing...' : 'Download PDF'}
            </div>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};