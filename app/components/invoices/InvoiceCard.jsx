"use client";

import { useState,useRef } from "react";
import Link from "next/link";
import {
  FiFileText,
  FiMail,
  FiDownload,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiUser,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiSend,
  FiLoader,
} from "react-icons/fi";
import { format } from "date-fns";
import SignatureCanvas from "react-signature-canvas";
const InvoiceCard = ({ invoice, onRefresh, onDelete, isExpanded, onToggleExpand }) => {
  // const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [signedBy, setSignedBy] = useState("");
  const [signatureData, setSignatureData] = useState(null);
  const signatureRef = useRef(null);

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy hh:mm a");
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

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        color: "bg-gray-100 text-gray-800",
        icon: <FiFileText size={14} />,
        label: "Draft",
      },
      sent: {
        color: "bg-blue-100 text-blue-800",
        icon: <FiMail size={14} />,
        label: "Sent",
      },
      paid: {
        color: "bg-green-100 text-green-800",
        icon: <FiCheckCircle size={14} />,
        label: "Paid",
      },
      overdue: {
        color: "bg-red-100 text-red-800",
        icon: <FiClock size={14} />,
        label: "Overdue",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800",
        icon: <FiXCircle size={14} />,
        label: "Cancelled",
      },
    };
    return configs[invoice.status] || configs.draft;
  };

  const getPaymentStatusConfig = (status) => {
    const configs = {
      paid: "text-green-600 bg-green-50",
      partial: "text-yellow-600 bg-yellow-50",
      unpaid: "text-red-600 bg-red-50",
      overdue: "text-red-600 bg-red-50",
    };
    return configs[invoice.paymentStatus] || "text-gray-600 bg-gray-50";
  };

  const statusConfig = getStatusConfig(invoice.status);

  const handleSendEmail = async () => {
    if (!invoice.clientEmail) {
      alert("No email address available for this client");
      return;
    }

    const customMessage = prompt(
      "Enter an optional message to include in the email (or click OK to send without custom message):",
      `Dear ${invoice.clientName},\n\nPlease find attached your invoice ${invoice.invoiceNumber}.`
    );

    if (customMessage === null) return;

    if (!confirm(`Send invoice to ${invoice.clientEmail}?`)) return;

    setSending(true);
    try {
      const response = await fetch(`/api/invoices/${invoice._id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: invoice.clientEmail,
          customMessage: customMessage || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      alert("✅ Invoice sent successfully!");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      console.log('📥 Starting invoice download for ID:', invoice._id);
      
      const response = await fetch(`/api/invoices/${invoice._id}/pdf`, {
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

      const response = await fetch(`/api/invoices/${invoice._id}/signature`, {
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
      setSignedBy("");
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error saving signature:", error);
      alert(error.message);
    } finally {
      setSavingSignature(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete invoice");
      }

      alert("Invoice deleted successfully!");
      if (onDelete) onDelete(invoice._id);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert(error.message);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${statusConfig.color}`}>
                {statusConfig.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {invoice.invoiceNumber}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  <FiCalendar className="inline mr-1" size={12} />
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Client Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiUser className="text-blue-600" size={14} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{invoice.clientName}</p>
              <p className="text-xs text-gray-500">{invoice.clientPhone}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(invoice.totalAmount)}
              </p>
            </div>
            <div className={`rounded-lg p-2 text-center ${getPaymentStatusConfig(invoice.paymentStatus)}`}>
              <p className="text-xs">Status</p>
              <p className="text-sm font-bold capitalize">
                {invoice.paymentStatus}
              </p>
            </div>
          </div>

          {/* Signature Status */}
          {!invoice.deliveryConfirmed && (
            <div className="mb-3 p-2 bg-green-50 rounded-lg flex items-center gap-2">
              <FiCheckCircle className="text-green-600" size={14} />
              <span className="text-xs text-green-700">
                Delivery confirmed on:
              </span>
            </div>
          )}
          {invoice.deliveryConfirmed && (
            <div className="mb-3 p-2 bg-green-50 rounded-lg flex items-center gap-2">
              <FiCheckCircle className="text-green-600" size={14} />
              <span className="text-xs text-green-700">
                Delivery confirmed on {formatDate(invoice.deliveryConfirmedAt)}
              </span>
            </div>
          )}
          {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSendEmail}
                  disabled={sending || invoice.emailSent}
                  className="flex-1 px-3 py-2 cursor-pointer bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {sending ? <FiLoader className="animate-spin" size={12} /> : <FiSend size={12} />}
                  {sending ? "Sending..." : invoice.emailSent ? "Resend" : "Send Email"}
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  className="flex-1 px-3 py-2 cursor-pointer bg-purple-50 text-purple-600 text-xs font-medium rounded-lg hover:bg-purple-100 transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {downloading ? <FiLoader className="animate-spin" size={12} /> : <FiDownload size={12} />}
                  {downloading ? "Generating..." : "Download PDF"}
                </button>
                {/* Signature Button */}
              {!invoice.deliveryConfirmed && invoice.status !== 'cancelled' && (
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className="p-2 text-white cursor-pointer hover:bg-secondary bg-secondary rounded-lg transition"
                >
                   Digital Signature
                </button>
              )}
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 cursor-pointer hover:bg-red-50 rounded-lg transition"
                >
                  <FiTrash2 size={16} />
                </button>
                
              </div>

              

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Link
              href={`/admin/invoices/${invoice._id}`}
              className="flex-1 px-3 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-secondary transition text-center"
            >
              View Details
            </Link>
              <button
              onClick={() => onToggleExpand(invoice._id)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>
          </div>

          {/* Expanded Content */}
          {isExpanded&& (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              {/* Email */}
              {invoice.clientEmail && (
                <div className="flex items-center gap-2 text-xs">
                  <FiMail className="text-gray-400" size={12} />
                  <span className="text-gray-600">{invoice.clientEmail}</span>
                  {invoice.emailSent && (
                    <span className="text-green-600 text-xs flex items-center gap-1">
                      <FiCheckCircle size={10} />
                      Sent {formatDate(invoice.emailSentAt)}
                    </span>
                  )}
                </div>
              )}

              {/* Due Date */}
              {invoice.dueDate && (
                <div className="flex items-center gap-2 text-xs">
                  <FiCalendar className="text-gray-400" size={12} />
                  <span className="text-gray-600">Due: {formatDate(invoice.dueDate)}</span>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">VAT ({invoice.vatPercentage}%):</span>
                  <span className="font-medium">{formatCurrency(invoice.vatAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-gray-600">Paid:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="text-orange-600 font-medium">{formatCurrency(invoice.remainingAmount)}</span>
                </div>
              </div>

              {/* Signature Preview if exists */}
              {invoice.signature?.data && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Digital Signature:</p>
                  <img 
                    src={invoice.signature.data} 
                    alt="Digital Signature" 
                    className="max-h-16 w-auto mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Signed by: {invoice.signature.signedBy} on {formatDateTime(invoice.signature.signedAt)}
                  </p>
                </div>
              )}

              
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
    </>
  );
};

export default InvoiceCard;