"use client";

import React, { useState, useEffect } from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink 
} from '@react-pdf/renderer';
import { FiPrinter, FiLoader, FiDownload } from 'react-icons/fi';

// === 1. Professional Styles ===
const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontSize: 10, 
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
    color: '#333'
  },
  header: { 
    marginBottom: 20, 
    borderBottom: 2, 
    borderBottomColor: '#283593', 
    paddingBottom: 15 
  },
  companyName: { 
    fontSize: 22, 
    color: '#283593', 
    fontWeight: 'bold', 
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  companySub: { 
    textAlign: 'center', 
    color: '#555', 
    fontSize: 9,
    marginBottom: 2
  },
  titleSection: { 
    marginVertical: 15, 
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 2
  },
  title: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#111',
    letterSpacing: 0.5
  },
  infoGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25,
    marginTop: 10
  },
  infoBox: { 
    width: '48%' 
  },
  label: { 
    fontWeight: 'bold', 
    color: '#283593',
    marginBottom: 3,
    fontSize: 8,
    textTransform: 'uppercase'
  },
  table: { 
    display: 'table', 
    width: 'auto', 
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#DDD'
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#EEE', 
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  tableHeader: { 
    backgroundColor: '#283593', 
    color: '#FFF',
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
    marginBottom: 4,
    width: '180pt',
    justifyContent: 'space-between',
    paddingBottom: 2
  },
  grandTotalRow: {
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1.5,
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
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    borderLeft: 3,
    borderLeftColor: '#283593'
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    borderTopWidth: 0.5, 
    borderTopColor: '#EEE', 
    paddingTop: 10, 
    textAlign: 'center', 
    fontSize: 8, 
    color: '#999' 
  }
});

// === 2. The PDF Document Template ===
export const MyQuoteDocument = ({ quote, companyInfo }) => (
  <Document title={`Quote #${quote.quoteNumber}`}>
    <Page size="A4" style={styles.page}>
      {/* Header - Fixed <br/> issue */}
      <View style={styles.header}>
        <Text style={styles.companyName}>{companyInfo.name}</Text>
        <Text style={styles.companySub}>{companyInfo.address}</Text>
        <Text style={styles.companySub}>Tel: {companyInfo.phone} | Email: {companyInfo.email}</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>QUOTATION: #{quote.quoteNumber}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Bill To:</Text>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>
            {quote.clientName || "Valued Client"}
          </Text>
          <Text>{quote.clientPhone || ""}</Text>
          <Text>{quote.clientEmail || ""}</Text>
        </View>
        <View style={[styles.infoBox, { textAlign: 'right' }]}>
          <Text style={styles.label}>Quote Details:</Text>
          <Text>Date: {new Date(quote.createdAt || Date.now()).toLocaleDateString('en-GB')}</Text>
          {/* <Text>Valid For: {quote.validityDays || 30} Days</Text> */}
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.col1, { fontWeight: 'bold' }]}>Description</Text>
          <Text style={[styles.col2, { fontWeight: 'bold' }]}>Qty</Text>
          <Text style={[styles.col3, { fontWeight: 'bold' }]}>Unit</Text>
          <Text style={[styles.col4, { fontWeight: 'bold' }]}>Price</Text>
          <Text style={[styles.col5, { fontWeight: 'bold' }]}>Total</Text>
        </View>
        
        {(quote.items || []).map((item, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.col1}>{item.name}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>{item.unit}</Text>
            <Text style={styles.col4}>£{(item.unitPrice || 0).toFixed(2)}</Text>
            <Text style={styles.col5}>£{(item.totalPrice || 0).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summarySection} wrap={false}>
        <View style={styles.summaryRow}>
          <Text style={{ color: '#666' }}>Subtotal:</Text>
          <Text>£{(quote.subtotal || 0).toFixed(2)}</Text>
        </View>

        {quote.totalAdditionalCharges > 0 && (
          <View style={styles.summaryRow}>
            <Text style={{ color: '#666' }}>Add. Charges:</Text>
            <Text>£{quote.totalAdditionalCharges.toFixed(2)}</Text>
          </View>
        )}

        {quote.totalDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={{ color: '#E53E3E' }}>Discount:</Text>
            <Text style={{ color: '#E53E3E' }}>-£{quote.totalDiscount.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={{ color: '#666' }}>VAT ({quote.vatPercentage || 0}%):</Text>
          <Text>£{(quote.vatAmount || 0).toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
          <Text style={styles.grandTotalValue}>£{(quote.grandTotal || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Notes / Terms */}
      {(quote.notes || quote.termsConditions) && (
        <View style={styles.notesSection} wrap={false}>
          <Text style={styles.label}>Notes & Terms:</Text>
          <Text style={{ fontSize: 9, color: '#444' }}>
            {quote.notes || "Thank you for choosing Pack & Attack Removal Ltd."}
          </Text>
        </View>
      )}

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `${companyInfo.name} | Page ${pageNumber} of ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

// === 3. Professional UI Button ===
export const QuoteDownloadButton = ({ quote, companyInfo }) => {
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div 
      onMouseEnter={() => setIsReady(true)} 
      onClick={() => setIsReady(true)}
      className="inline-block"
    >
      {!isReady ? (
        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 cursor-pointer border border-gray-200 shadow-sm">
          <FiPrinter className="w-4 h-4" />
          Print / Download
        </button>
      ) : (
        <PDFDownloadLink
          document={<MyQuoteDocument quote={quote} companyInfo={companyInfo} />}
          fileName={`Quote_${quote.quoteNumber || 'Draft'}.pdf`}
        >
          {({ loading }) => (
            <div className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 cursor-pointer border shadow-sm ${
              loading ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            }`}>
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  Download Now
                </>
              )}
            </div>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};