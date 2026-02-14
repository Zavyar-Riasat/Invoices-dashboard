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

// === 1. Define Styles (Professional Typography & Spacing) ===
const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontSize: 10, 
    fontFamily: 'Helvetica',
    lineHeight: 1.5 
  },
  header: { 
    marginBottom: 20, 
    borderBottom: 2, 
    borderBottomColor: '#283593', 
    paddingBottom: 10 
  },
  companyName: { 
    fontSize: 22, 
    color: '#283593', 
    fontWeight: 'bold', 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  companySub: { 
    textAlign: 'center', 
    color: '#444', 
    marginTop: 2,
    fontSize: 9
  },
  
  titleSection: { 
    marginVertical: 15, 
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    padding: 5
  },
  title: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#111' 
  },

  infoGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25,
    marginTop: 10
  },
  infoBox: { 
    width: '45%' 
  },
  label: { 
    fontWeight: 'bold', 
    color: '#283593',
    marginBottom: 2,
    fontSize: 9,
    textTransform: 'uppercase'
  },

  // Table Styles
  table: { 
    display: 'table', 
    width: 'auto', 
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE', 
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center'
  },
  tableHeader: { 
    backgroundColor: '#283593', 
    color: '#FFF', 
    fontWeight: 'bold',
  },
  col1: { width: '45%' },
  col2: { width: '10%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },

  summarySection: { 
    marginTop: 20, 
    flexDirection: 'column',
    alignItems: 'flex-end' 
  },
  summaryRow: { 
    flexDirection: 'row', 
    marginBottom: 3,
    width: '200pt',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
    paddingBottom: 2
  },
  grandTotalRow: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 2,
    borderTopColor: '#283593'
  },
  grandTotalLabel: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#283593' 
  },
  grandTotalValue: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#283593' 
  },

  notesSection: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 4
  },
  
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    borderTopWidth: 1, 
    borderTopColor: '#EEE', 
    paddingTop: 10, 
    textAlign: 'center', 
    fontSize: 8, 
    color: '#999' 
  }
});

// === 2. The PDF Document Template (Used for both Download & Email) ===
export const MyQuoteDocument = ({ quote, companyInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyInfo.name}</Text>
        <Text style={styles.companySub}>{companyInfo.address}</Text>
        <Text style={styles.companySub}>Tel: {companyInfo.phone}  |  Email: {companyInfo.email}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>QUOTATION: #{quote.quoteNumber}</Text>
      </View>

      {/* Client & Quote Info */}
      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Bill To:</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{quote.clientName || "Valued Client"}</Text>
          <Text>{quote.clientPhone || ""}</Text>
          <Text>{quote.clientEmail || ""}</Text>
        </View>
        <View style={[styles.infoBox, { textAlign: 'right' }]}>
          <Text style={styles.label}>Quote Details:</Text>
          <Text>Date: {new Date(quote.createdAt).toLocaleDateString()}</Text>
          <Text>Valid For: {quote.validityDays || 30} Days</Text>
          <Text>Status: {quote.status?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Unit</Text>
          <Text style={styles.col4}>Unit Price</Text>
          <Text style={styles.col5}>Total</Text>
        </View>
        
        {(quote.items || []).map((item, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.col1}>{item.name}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{item.unit}</Text>
            <Text style={styles.col4}>${(item.unitPrice || 0).toFixed(2)}</Text>
            <Text style={styles.col5}>${(item.totalPrice || 0).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Charges & Summary */}
      <View style={styles.summarySection} wrap={false}>
        <View style={styles.summaryRow}>
          <Text>Subtotal:</Text>
          <Text>${(quote.subtotal || 0).toFixed(2)}</Text>
        </View>

        {quote.totalAdditionalCharges > 0 && (
          <View style={styles.summaryRow}>
            <Text>Additional Charges:</Text>
            <Text>${quote.totalAdditionalCharges.toFixed(2)}</Text>
          </View>
        )}

        {quote.totalDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Discount:</Text>
            <Text>-${quote.totalDiscount.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text>VAT ({quote.vatPercentage || 0}%):</Text>
          <Text>${(quote.vatAmount || 0).toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
          <Text style={styles.grandTotalValue}>${(quote.grandTotal || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Notes / Terms */}
      {(quote.notes || quote.termsConditions) && (
        <View style={styles.notesSection} wrap={false}>
          <Text style={[styles.label, { marginBottom: 4 }]}>Notes & Terms:</Text>
          <Text style={{ fontSize: 9, color: '#555' }}>
            {quote.notes || "Thank you for choosing Pack & Attack Removal Ltd. We look forward to working with you."}
          </Text>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `${companyInfo.name}  |  Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

// === 3. The Print/Download Button (UI Component) ===
export const QuoteDownloadButton = ({ quote, companyInfo }) => (
  <PDFDownloadLink
    document={<MyQuoteDocument quote={quote} companyInfo={companyInfo} />}
    fileName={`Quote_${quote.quoteNumber}.pdf`}
    style={{ textDecoration: 'none' }}
  >
    {({ loading }) => (
      <div className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2a2 2 0 00-2-2m-4-4V9m4 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
        </svg>
        {loading ? 'Generating...' : 'Print / Download'}
      </div>
    )}
  </PDFDownloadLink>
);