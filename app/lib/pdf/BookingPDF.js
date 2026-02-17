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

// Styles for professional document layout
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.5, color: '#333' },
  header: { marginBottom: 20, borderBottom: 2, borderBottomColor: '#283593', paddingBottom: 15 },
  companyName: { fontSize: 20, color: '#283593', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', marginBottom: 4 },
  companySub: { textAlign: 'center', color: '#555', fontSize: 9, marginBottom: 2 },
  
  titleSection: { marginVertical: 15, textAlign: 'center', backgroundColor: '#F3F4F6', padding: 8, borderRadius: 2 },
  title: { fontSize: 12, fontWeight: 'bold', color: '#111', letterSpacing: 1 },
  
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, marginTop: 10 },
  infoBox: { width: '48%' },
  label: { fontWeight: 'bold', color: '#283593', marginBottom: 4, fontSize: 8, textTransform: 'uppercase' },
  infoText: { fontSize: 10, marginBottom: 2 },
  
  table: { display: 'table', width: 'auto', marginTop: 10, borderStyle: 'solid', borderWidth: 0.5, borderColor: '#EEE' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#EEE', paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center' },
  tableHeader: { backgroundColor: '#283593', color: '#FFF' },
  
  col1: { width: '40%' },
  col2: { width: '10%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '17%', textAlign: 'right' },
  col5: { width: '18%', textAlign: 'right' },
  
  summarySection: { marginTop: 20, flexDirection: 'column', alignItems: 'flex-end' },
  summaryRow: { flexDirection: 'row', marginBottom: 4, width: '180pt', justifyContent: 'space-between', paddingBottom: 2 },
  grandTotalRow: { marginTop: 5, paddingTop: 8, borderTopWidth: 1.5, borderTopColor: '#283593' },
  grandTotalLabel: { fontSize: 11, fontWeight: 'bold', color: '#283593' },
  grandTotalValue: { fontSize: 11, fontWeight: 'bold', color: '#283593' },
  
  notesSection: { marginTop: 30, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 4, borderLeft: 3, borderLeftColor: '#283593' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 10, textAlign: 'center', fontSize: 8, color: '#999' },
});

// The actual PDF Document Template
export const MyBookingDocument = ({ booking, companyInfo }) => {
  const formatDate = (date) => {
    try { return date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'; } 
    catch { return 'N/A'; }
  };

  return (
    <Document title={`Booking ${booking.bookingNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header - Fixed the <br/> issue */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{companyInfo.name}</Text>
          <Text style={styles.companySub}>{companyInfo.address}</Text>
          <Text style={styles.companySub}>Tel: {companyInfo.phone}  |  Email: {companyInfo.email}</Text>
          {companyInfo.registration && <Text style={styles.companySub}>{companyInfo.registration}</Text>}
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>OFFICIAL BOOKING CONFIRMATION: #{booking.bookingNumber || booking._id?.slice(-6).toUpperCase()}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Client Details</Text>
            <Text style={[styles.infoText, { fontWeight: 'bold', fontSize: 11 }]}>{booking.clientName || 'Valued Client'}</Text>
            <Text style={styles.infoText}>{booking.clientPhone}</Text>
            <Text style={styles.infoText}>{booking.clientEmail}</Text>
          </View>
          <View style={[styles.infoBox, { textAlign: 'right' }]}>
            <Text style={styles.label}>Moving Schedule</Text>
            <Text style={styles.infoText}>Date: {formatDate(booking.shiftingDate)}</Text>
            <Text style={styles.infoText}>Time: {booking.shiftingTime || 'Flexible'}</Text>
            <View style={{ marginTop: 5 }}>
              <Text style={styles.label}>Route</Text>
              <Text style={[styles.infoText, { fontSize: 8 }]}>From: {booking.pickupAddress}</Text>
              <Text style={[styles.infoText, { fontSize: 8 }]}>To: {booking.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {/* Inventory Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.col1, { fontWeight: 'bold' }]}>Item Description</Text>
            <Text style={[styles.col2, { fontWeight: 'bold' }]}>Qty</Text>
            <Text style={[styles.col3, { fontWeight: 'bold' }]}>Unit</Text>
            <Text style={[styles.col4, { fontWeight: 'bold' }]}>Rate</Text>
            <Text style={[styles.col5, { fontWeight: 'bold' }]}>Total</Text>
          </View>

          {(booking.items || []).map((item, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.col1}>{item.name}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{item.unit}</Text>
              <Text style={styles.col4}>£{(item.unitPrice || 0).toFixed(2)}</Text>
              <Text style={styles.col5}>£{(item.totalPrice || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.summarySection} wrap={false}>
          <View style={styles.summaryRow}>
            <Text style={{ color: '#666' }}>Subtotal</Text>
            <Text>£{(booking.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: '#666' }}>VAT ({booking.vatPercentage || 0}%)</Text>
            <Text>£{(booking.vatAmount || 0).toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
            <Text style={styles.grandTotalValue}>£{(booking.totalAmount || 0).toFixed(2)}</Text>
          </View>
          {booking.advanceAmount > 0 && (
            <View style={[styles.summaryRow, { marginTop: 4, color: '#10B981' }]}>
              <Text style={{ fontSize: 9 }}>Deposit Paid</Text>
              <Text style={{ fontSize: 9 }}>- £{(booking.advanceAmount).toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {(booking.notes || booking.specialInstructions) && (
          <View style={styles.notesSection} wrap={false}>
            <Text style={styles.label}>Notes & Special Instructions</Text>
            <Text style={{ fontSize: 9, color: '#444', lineHeight: 1.4 }}>
              {booking.notes || booking.specialInstructions}
            </Text>
          </View>
        )}

        <Text 
          style={styles.footer} 
          render={({ pageNumber, totalPages }) => (
            `${companyInfo.name}  |  Generated on ${new Date().toLocaleDateString()}  |  Page ${pageNumber} of ${totalPages}`
          )} 
          fixed 
        />
      </Page>
    </Document>
  );
};

// Professional Download Button with State Handling
export const BookingDownloadButton = ({ booking, companyInfo }) => {
  const [isClient, setIsClient] = useState(false);
  const [ready, setReady] = useState(false);

  // Ensures we only render the PDF logic on the client to avoid hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="p-2 text-gray-400"><FiLoader className="animate-spin" /></div>;

  return (
    <div onMouseEnter={() => setReady(true)} onClick={() => setReady(true)}>
      {!ready ? (
        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2 cursor-pointer">
          <FiDownload size={16} />
          <span className="text-sm font-medium">Print PDF</span>
        </button>
      ) : (
        <PDFDownloadLink
          document={<MyBookingDocument booking={booking} companyInfo={companyInfo} />}
          fileName={`Booking_${booking.bookingNumber || 'Draft'}.pdf`}
        >
          {({ loading, error }) => (
            <div className={`p-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              loading ? 'text-amber-600' : 'text-emerald-600 hover:bg-emerald-50'
            }`}>
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  <span className="text-sm font-medium">Preparing...</span>
                </>
              ) : (
                <>
                  <FiCheck size={16} />
                  <span className="text-sm font-bold">Download PDF</span>
                </>
              )}
            </div>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};