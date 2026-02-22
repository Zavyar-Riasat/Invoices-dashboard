"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SignatureCanvas from "react-signature-canvas";
import {
  FiArrowLeft,
  FiDownload,
  FiMail,
  FiCheckCircle,
  FiX,
  FiLoader,
  FiCalendar,
  FiUser,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiFileText,
} from "react-icons/fi";
import { format } from "date-fns";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [signedBy, setSignedBy] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const signatureRef = useRef(null);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const companyInfo = {
    name: "Pack & Attack Removal Ltd",
    address: "Based in London — proudly serving all of Greater London, with nationwide moves available.",
    phone: "07577 441 654 / 07775 144 475",
    email: "info@Packattackremovalltd.com",
    website: "www.packattackremovals.com",
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response.json();

      if (data.success) {
        setInvoice(data.invoice);
        setSignedBy(data.invoice.clientName || "");
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSaveSignature = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert("Please provide a signature");
      return;
    }

    if (!signedBy.trim()) {
      alert("Please enter the name of the person signing");
      return;
    }

    setSavingSignature(true);
    try {
      const signatureData = signatureRef.current.toDataURL();

      const response = await fetch(`/api/invoices/${invoiceId}/signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature: signatureData,
          signedBy: signedBy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save signature");
      }

      alert("Signature saved successfully!");
      setShowSignatureModal(false);
      fetchInvoice();
    } catch (error) {
      console.error("Error saving signature:", error);
      alert(error.message);
    } finally {
      setSavingSignature(false);
    }
  };

const handleDownloadInvoice = async () => {
  setDownloading(true);
  try {
    console.log('📥 Starting invoice download for ID:', invoiceId);
    
    const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
      method: 'GET',
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(errorData.error || 'Failed to generate PDF');
    }

    const blob = await response.blob();
    console.log('📦 Received blob of size:', blob.size, 'bytes');
    
    if (blob.size === 0) {
      throw new Error('Received empty PDF file');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Download completed successfully');
  } catch (err) {
    console.error('❌ Invoice download failed:', err);
    alert(`Failed to download invoice: ${err.message}`);
  } finally {
    setDownloading(false);
  }
};
  const handleSendEmail = async () => {
    if (!invoice.clientEmail) {
      alert("No email address available for this client");
      return;
    }

    if (!confirm(`Send invoice to ${invoice.clientEmail}?`)) return;

    setSendingEmail(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: invoice.clientEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      alert("Invoice sent successfully!");
      fetchInvoice();
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert(error.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return configs[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusBadge = (status) => {
    const configs = {
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      unpaid: "bg-red-100 text-red-800",
      overdue: "bg-red-100 text-red-800",
    };
    return configs[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <FiFileText className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Invoice</h2>
          <p className="text-red-600 mb-4">{error || "Invoice not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft size={20} />
          Back to Invoices
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600 mt-2">
              Created on {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary cursor-pointer  transition flex items-center gap-2 disabled:opacity-50"
            >
              {sendingEmail ? <FiLoader className="animate-spin" /> : <FiMail />}
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? <FiLoader className="animate-spin" /> : <FiDownload />}
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(invoice.status)}`}>
          Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadge(invoice.paymentStatus)}`}>
          Payment: {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
        </span>
        {invoice.deliveryConfirmed && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Delivery Confirmed
          </span>
        )}
      </div>

      {/* Main Content - Add the rest of your detailed invoice view here */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiUser className="text-gray-400" />
                <span className="font-medium">{invoice.clientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-gray-400" />
                <span>{invoice.clientPhone}</span>
              </div>
              {invoice.clientEmail && (
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400" />
                  <span>{invoice.clientEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.unit || 'pc'}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extra Charges */}
          {invoice.extraCharges && invoice.extraCharges.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Extra Charges</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.extraCharges.map((charge, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{charge.description}</td>
                        <td className="px-4 py-3 text-sm text-center capitalize">{charge.type}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                          {formatCurrency(charge.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary & Signature */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT ({invoice.vatPercentage}%):</span>
                <span className="font-medium text-blue-600">+{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-blue-700">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-bold text-orange-600">{formatCurrency(invoice.remainingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Confirmation</h2>
            
            {invoice.deliveryConfirmed ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCheckCircle className="text-green-600" size={20} />
                    <span className="font-medium text-green-700">Delivery Confirmed</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Signed by: {invoice.signature?.signedBy}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    on {formatDate(invoice.deliveryConfirmedAt)}
                  </p>
                </div>
                
                {invoice.signature?.data && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2">Digital Signature:</p>
                    <img 
                      src={invoice.signature.data} 
                      alt="Digital Signature" 
                      className="max-h-20 w-auto mx-auto"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Get digital signature to confirm delivery of items.
                </p>
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Get Digital Signature
                </button>
              </div>
            )}
          </div>

          {/* Email History */}
          {invoice.emailSent && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center gap-2">
                <FiMail className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  Email sent to {invoice.emailSentTo} on {formatDate(invoice.emailSentAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Digital Signature</h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signed By *
                </label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  placeholder="Enter name of person signing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature *
                </label>
                <div className="border-2 border-gray-300 rounded-lg bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-48 cursor-crosshair",
                    }}
                    clearOnResize={false}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sign above using your mouse or touch
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClearSignature}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveSignature}
                  disabled={savingSignature}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingSignature ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Save Signature
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}