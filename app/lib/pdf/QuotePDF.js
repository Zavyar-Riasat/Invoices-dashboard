"use client";

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink 
} from '@react-pdf/renderer';

// === 1. Define Styles (Flexbox based) ===
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 1, borderBottomColor: '#283593', paddingBottom: 10 },
  companyName: { fontSize: 20, color: '#283593', fontWeight: 'bold', textAlign: 'center' },
  companySub: { textAlign: 'center', color: '#646464', marginTop: 2 },
  
  titleSection: { marginVertical: 20, textAlign: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', textDecoration: 'underline' },

  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  infoBox: { width: '45%' },
  label: { fontWeight: 'bold', marginBottom: 2 },

  // Table Styles
  table: { display: 'table', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 5 },
  tableHeader: { backgroundColor: '#283593', color: '#FFF', fontWeight: 'bold' },
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },

  summarySection: { marginTop: 20, alignItems: 'flex-end' },
  summaryRow: { flexDirection: 'row', marginBottom: 4 },
  grandTotal: { fontSize: 12, fontWeight: 'bold', marginTop: 8, color: '#283593' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, textAlign: 'center', fontSize: 8, color: '#999' }
});

// === 2. The PDF Document Template ===
const MyQuoteDocument = ({ quote, companyInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyInfo.name}</Text>
        <Text style={styles.companySub}>{companyInfo.address}</Text>
        <Text style={styles.companySub}>{companyInfo.phone} | {companyInfo.email}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>QUOTATION</Text>
      </View>

      {/* Client & Quote Info */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>BILL TO:</Text>
          <Text>{quote.clientName || "-"}</Text>
          <Text>{quote.clientPhone || "-"}</Text>
          <Text>{quote.clientEmail || ""}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text><Text style={styles.label}>Quote #:</Text> {quote.quoteNumber}</Text>
          <Text><Text style={styles.label}>Date:</Text> {new Date(quote.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}> Description</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Unit</Text>
          <Text style={styles.col4}>Price</Text>
          <Text style={styles.col5}>Total</Text>
        </View>
        {(quote.items || []).map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.col1}>{item.name}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{item.unit}</Text>
            <Text style={styles.col4}>${item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.col5}>${item.totalPrice.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={{ width: 100 }}>Subtotal:</Text>
          <Text style={{ width: 60, textAlign: 'right' }}>${(quote.subtotal || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ width: 100 }}>Additional charges:</Text>
          <Text style={{ width: 60, textAlign: 'right' }}>${(quote.totalAdditionalCharges || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ width: 100 }}>VAT ({quote.vatPercentage}%):</Text>
          <Text style={{ width: 60, textAlign: 'right' }}>${(quote.vatAmount || 0).toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.grandTotal]}>
          <Text style={{ width: 100 }}>GRAND TOTAL:</Text>
          <Text style={{ width: 60, textAlign: 'right' }}>${(quote.grandTotal || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `${companyInfo.name}  |  Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

// === 3. The Action Button Component ===
export const QuoteDownloadButton = ({ quote, companyInfo }) => (
  <PDFDownloadLink
    document={<MyQuoteDocument quote={quote} companyInfo={companyInfo} />}
    fileName={`Quote_${quote.quoteNumber}.pdf`}
    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
  >
    {({ loading }) => (
      <>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2a2 2 0 00-2-2m-4-4V9m4 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
        </svg>
        {loading ? 'Preparing PDF...' : 'Print'}
      </>
    )}
  </PDFDownloadLink>
);