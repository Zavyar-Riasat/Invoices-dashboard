"use client";

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';

// Styles (copied from QuotePDF and adapted)
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.5 },
  header: { marginBottom: 20, borderBottom: 2, borderBottomColor: '#283593', paddingBottom: 10 },
  companyName: { fontSize: 22, color: '#283593', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', marginBottom: 20, paddingBottom:5 },
  companySub: { marginTop: 10, textAlign: 'center', color: '#444', marginTop: 2, fontSize: 9 },
  titleSection: { marginVertical: 15, textAlign: 'center', backgroundColor: '#F3F4F6', padding: 5 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, marginTop: 10 },
  infoBox: { width: '45%' },
  label: { fontWeight: 'bold', color: '#283593', marginBottom: 2, fontSize: 9, textTransform: 'uppercase' },
  table: { display: 'table', width: 'auto', marginTop: 10, borderStyle: 'solid', borderWidth: 1, borderColor: '#EEE' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 6, paddingHorizontal: 4, alignItems: 'center' },
  tableHeader: { backgroundColor: '#283593', color: '#FFF', fontWeight: 'bold' },
  col1: { width: '45%' },
  col2: { width: '10%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  summarySection: { marginTop: 20, flexDirection: 'column', alignItems: 'flex-end' },
  summaryRow: { flexDirection: 'row', marginBottom: 3, width: '200pt', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F9F9F9', paddingBottom: 2 },
  grandTotalRow: { marginTop: 5, paddingTop: 5, borderTopWidth: 2, borderTopColor: '#283593' },
  grandTotalLabel: { fontSize: 12, fontWeight: 'bold', color: '#283593' },
  grandTotalValue: { fontSize: 12, fontWeight: 'bold', color: '#283593' },
  notesSection: { marginTop: 30, padding: 10, backgroundColor: '#FAFAFA', borderRadius: 4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, textAlign: 'center', fontSize: 8, color: '#999' },
});

export const MyBookingDocument = ({ booking, companyInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyInfo.name}</Text>
        <br />
        <Text style={styles.companySub}>{companyInfo.address}</Text>
        <Text style={styles.companySub}>Tel: {companyInfo.phone}  |  Email: {companyInfo.email}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>BOOKING: #{booking.bookingNumber}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Client:</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{booking.clientName || 'Valued Client'}</Text>
          <Text>{booking.clientPhone || ''}</Text>
          <Text>{booking.clientEmail || ''}</Text>
        </View>
        <View style={[styles.infoBox, { textAlign: 'right' }]}>
          <Text style={styles.label}>Booking Details:</Text>
          <Text>Date: {new Date(booking.shiftingDate).toLocaleDateString()}</Text>
          <Text>Time: {booking.shiftingTime || ''}</Text>
          <Text>Pickup: {booking.pickupAddress || ''}</Text>
          <Text>Delivery: {booking.deliveryAddress || ''}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Unit</Text>
          <Text style={styles.col4}>Unit Price</Text>
          <Text style={styles.col5}>Total</Text>
        </View>

        {(booking.items || []).map((item, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.col1}>{item.name}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{item.unit}</Text>
            <Text style={styles.col4}>${(item.unitPrice || 0).toFixed(2)}</Text>
            <Text style={styles.col5}>${(item.totalPrice || 0).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summarySection} wrap={false}>
        <View style={styles.summaryRow}>
          <Text>Subtotal:</Text>
          <Text>${(booking.subtotal || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text>VAT ({booking.vatPercentage || 0}%):</Text>
          <Text>${(booking.vatAmount || 0).toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
          <Text style={styles.grandTotalValue}>${(booking.totalAmount || 0).toFixed(2)}</Text>
        </View>
      </View>

      {(booking.notes || booking.specialInstructions) && (
        <View style={styles.notesSection} wrap={false}>
          <Text style={[styles.label, { marginBottom: 4 }]}>Notes & Instructions:</Text>
          <Text style={{ fontSize: 9, color: '#555' }}>{booking.notes || booking.specialInstructions || ''}</Text>
        </View>
      )}

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (`${companyInfo.name}  |  Page ${pageNumber} of ${totalPages}`)} fixed />
    </Page>
  </Document>
);

export const BookingDownloadButton = ({ booking, companyInfo }) => (
  <PDFDownloadLink
    document={<MyBookingDocument booking={booking} companyInfo={companyInfo} />}
    fileName={`Booking_${booking.bookingNumber || booking._id}.pdf`}
    style={{ textDecoration: 'none' }}
  >
    {({ loading }) => (
      <div className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition cursor-pointer" title="Print / Download">
        {loading ? 'Generating...' : 'Print / Download'}
      </div>
    )}
  </PDFDownloadLink>
);
