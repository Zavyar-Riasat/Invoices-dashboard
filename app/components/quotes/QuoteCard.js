"use client";

import { useState } from "react";
import {
  FiFileText,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiUser,
  FiPhone,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiPrinter,
  FiDownload,
} from "react-icons/fi";
import Link from "next/link";
import { format } from "date-fns";

const QuoteCard = ({ quote, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

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
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <FiFileText />;
      case 'sent': return <FiSend />;
      case 'pending': return <FiClock />;
      case 'accepted': return <FiCheckCircle />;
      case 'rejected': return <FiXCircle />;
      case 'converted': return <FiDollarSign />;
      default: return <FiFileText />;
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!confirm(`Are you sure you want to update quote status to ${newStatus}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/${quote._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quote status");
      }

      alert(`Quote status updated to ${newStatus}`);
      onRefresh();
    } catch (error) {
      console.error("Error updating quote status:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async () => {
    if (!confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/${quote._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete quote");
      }

      alert("Quote deleted successfully");
      onRefresh();
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    // This would integrate with email/SMS service
    alert("Send quote functionality would integrate with email/SMS service");
  };

  const handleConvertToBooking = () => {
    // Navigate to booking creation page
    window.location.href = `/bookings/create?quoteId=${quote._id}`;
  };

  const handleDownloadPDF = async () => {
    // This would generate and download PDF
    alert("PDF download functionality would generate quote PDF");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className={`p-3 rounded-lg ${getStatusColor(quote.status)}`}>
              {getStatusIcon(quote.status)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {quote.quoteNumber}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Created: {formatDate(quote.createdAt)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <FiUser className="text-gray-400" size={14} />
                <span className="text-sm text-gray-700">{quote.clientName}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(quote.grandTotal)}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
              {quote.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!isExpanded ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{quote.clientName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{quote.clientPhone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Items</p>
                <p className="text-xl font-bold">{quote.items?.length || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Validity</p>
                <p className="text-xl font-bold">{quote.validityDays} days</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{formatCurrency(quote.grandTotal)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" />
                  <span className="text-sm text-gray-500">Client:</span>
                </div>
                <p className="font-medium">{quote.clientName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400" />
                  <span className="text-sm text-gray-500">Phone:</span>
                </div>
                <p className="font-medium">{quote.clientPhone}</p>
              </div>
              {quote.clientEmail && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-400" />
                    <span className="text-sm text-gray-500">Email:</span>
                  </div>
                  <p className="font-medium">{quote.clientEmail}</p>
                </div>
              )}
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
              <div className="space-y-2">
                {quote.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charges & Discounts */}
            {(quote.additionalCharges?.length > 0 || quote.discounts?.length > 0) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Charges & Discounts</h4>
                <div className="space-y-2">
                  {quote.additionalCharges?.map((charge, index) => (
                    <div key={`charge-${index}`} className="flex justify-between items-center">
                      <span className="text-sm">{charge.description}</span>
                      <span className="text-sm font-medium text-green-600">
                        +{formatCurrency(charge.amount)}
                      </span>
                    </div>
                  ))}
                  {quote.discounts?.map((discount, index) => (
                    <div key={`discount-${index}`} className="flex justify-between items-center">
                      <span className="text-sm">{discount.description}</span>
                      <span className="text-sm font-medium text-red-600">
                        -{formatCurrency(discount.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                </div>
                {quote.totalAdditionalCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Additional Charges:</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(quote.totalAdditionalCharges)}
                    </span>
                  </div>
                )}
                {quote.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(quote.totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">VAT ({quote.vatPercentage || 15}%):</span>
                  <span className="font-medium">{formatCurrency(quote.vatAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(quote.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{quote.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t">
        <div className="p-4 flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
            >
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
              {isExpanded ? "Show Less" : "Show Details"}
            </button>

            {quote.status === 'draft' && (
              <Link
                href={`/quotes/${quote._id}`}
                className="px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
              >
                <FiEdit2 />
                Edit
              </Link>
            )}
          </div>

          <div className="flex gap-2">
            {quote.status === 'draft' && (
              <button
                onClick={handleSendQuote}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiSend />
                Send
              </button>
            )}

            {quote.status === 'accepted' && !quote.convertedToBooking && (
              <button
                onClick={handleConvertToBooking}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiCheckCircle />
                Convert to Booking
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
            >
              <FiPrinter />
              Print
            </button>

            {quote.status === 'draft' && (
              <button
                onClick={handleDeleteQuote}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiTrash2 />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;