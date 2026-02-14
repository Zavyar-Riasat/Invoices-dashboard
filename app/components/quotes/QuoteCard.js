"use client";
import { pdf } from "@react-pdf/renderer";
import { MyQuoteDocument } from "../../lib/pdf/QuotePDF";
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
  FiCalendar,
  FiPackage,
} from "react-icons/fi";
import Link from "next/link";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const QuoteDownloadButton = dynamic(
  () =>
    import("../../lib/pdf/QuotePDF").then((mod) => ({
      default: mod.QuoteDownloadButton,
    })),
  { ssr: false },
);

const QuoteCard = ({
  quote,
  onRefresh,
  expandedQuoteId,
  setExpandedQuoteId,
}) => {
  const isExpanded = expandedQuoteId === quote._id;

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "converted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <FiFileText size={14} />;
      case "sent":
        return <FiSend size={14} />;
      case "pending":
        return <FiClock size={14} />;
      case "accepted":
        return <FiCheckCircle size={14} />;
      case "rejected":
        return <FiXCircle size={14} />;
      case "converted":
        return <FiDollarSign size={14} />;
      default:
        return <FiFileText size={14} />;
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (
      !confirm(`Are you sure you want to update quote status to ${newStatus}?`)
    ) {
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
    if (
      !confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)
    ) {
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
    if (!quote.clientEmail || quote.clientEmail.trim() === '') {
      alert("Error: Client email is not available.\n\nPlease edit the client to add an email address before sending the quote.");
      return;
    }

    if (!confirm(`Send PDF quote to ${quote.clientEmail}?`)) return;

    setLoading(true);
    try {
      const companyInfo = {
        name: "Pack & Attack Removal Ltd",
        address:
          "Based in London — proudly serving all of Greater London, with nationwide moves available.",
        phone: "07577 441 654 / 07775 144 475",
        email: "info@Packattackremovalltd.com",
      };

      const doc = <MyQuoteDocument quote={quote} companyInfo={companyInfo} />;
      const asBlob = await pdf(doc).toBlob();

      const formData = new FormData();
      formData.append("file", asBlob);
      formData.append("email", quote.clientEmail);
      formData.append("quoteNumber", quote.quoteNumber);
      formData.append("clientName", quote.clientName);

      console.log("📧 Sending email to:", quote.clientEmail);
      const response = await fetch("/api/quotes/send-email", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📥 Email response:", data, "Status:", response.status);
      
      if (!response.ok) {
        console.error("❌ Email send failed:", data.error);
        throw new Error(data.error || "Failed to send email");
      }

      console.log("✅ Email sent successfully");

      // Update status to "sent" after successful email send
      console.log("🔄 Updating quote status to 'sent' for quote ID:", quote._id);
      const statusResponse = await fetch(`/api/quotes/${quote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });

      const statusData = await statusResponse.json();
      console.log("📥 Status update response:", statusData, "Status code:", statusResponse.status);
      
      if (!statusResponse.ok) {
        console.error("❌ Status update failed:", statusData.error);
        // Email was sent successfully, so show success message even if status update fails
        alert(`Quote PDF sent successfully to ${quote.clientEmail}!\n\nNote: Status update encountered an issue, but the email was sent.`);
        onRefresh();
        return;
      }

      alert(`Quote PDF sent successfully to ${quote.clientEmail} and status updated to Sent`);
      onRefresh();
    } catch (error) {
      console.error("❌ Error in handleSendQuote:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToBooking = () => {
    window.location.href = `/bookings/create?quoteId=${quote._id}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative">

      {/* Header - Always visible */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${getStatusColor(quote.status)}`}>
              {getStatusIcon(quote.status)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {quote.quoteNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(quote.createdAt)}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}
          >
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Compact View - Default */}
      {!isExpanded ? (
        <div className="p-4 flex-1">
          {/* Client Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUser className="text-blue-600" size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {quote.clientName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {quote.clientPhone}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <FiPackage className="mx-auto text-gray-400 mb-1" size={14} />
              <p className="text-xs text-gray-500">Items</p>
              <p className="text-sm font-semibold text-gray-900">
                {quote.items?.length || 0}
              </p>
            </div>
            {/* <div className="text-center p-2 bg-gray-50 rounded-lg">
              <FiCalendar className="mx-auto text-gray-400 mb-1" size={14} />
              <p className="text-xs text-gray-500">Valid</p>
              <p className="text-sm font-semibold text-gray-900">
                {quote.validityDays}d
              </p>
            </div> */}
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <FiDollarSign className="mx-auto text-gray-400 mb-1" size={14} />
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(quote.grandTotal)}
              </p>
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setExpandedQuoteId(quote._id)}
            className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition flex items-center justify-center gap-1 border border-gray-200"
          >
            <FiChevronDown size={14} />
            View Details
          </button>
        </div>
      ) : (
        /* Expanded View - Only this card expands */
        <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
          {/* Close Expand Button */}
          {/* <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <FiChevronUp size={16} className="text-gray-600" />
          </button> */}

          {/* Client Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                CLIENT INFORMATION
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400 flex-shrink-0" size={14} />
                  <span className="text-sm font-medium text-gray-900">
                    {quote.clientName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                  <span className="text-sm text-gray-700">
                    {quote.clientPhone}
                  </span>
                </div>
                {quote.clientEmail && (
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-sm text-gray-700 truncate">
                      {quote.clientEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">ITEMS</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {quote.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} {item.unit} ×{" "}
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 ml-2">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
<button
                    onClick={() => setExpandedQuoteId(null)}
                    className=" w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition flex items-center justify-center gap-1 border border-gray-200"
                  > 
                  Close
                    <FiChevronUp size={16} className="text-gray-600" />
                  </button>
            {/* Charges & Discounts */}
            {(quote.additionalCharges?.length > 0 ||
              quote.discounts?.length > 0) && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                 Additonal Charges                </h4>
                <div className="space-y-1">
                  {quote.additionalCharges?.map((charge, index) => (
                    <div
                      key={`charge-${index}`}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-gray-600">
                        {charge.description}
                      </span>
                      <span className="text-xs font-medium text-green-600">
                        +{formatCurrency(charge.amount)}
                      </span>
                    </div>
                  ))}
                  {quote.discounts?.map((discount, index) => (
                    <div
                      key={`discount-${index}`}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-gray-600">
                        {discount.description}
                      </span>
                      <span className="text-xs font-medium text-red-600">
                        -{formatCurrency(discount.amount)}
                      </span>
                    </div>
                  ))}
                  
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Subtotal:</span>
                  <span className="text-xs font-medium">
                    {formatCurrency(quote.subtotal)}
                  </span>
                </div>
                {quote.totalAdditionalCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">
                      Additional Charges:
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      +{formatCurrency(quote.totalAdditionalCharges)}
                    </span>
                  </div>
                )}
                {quote.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Discount:</span>
                    <span className="text-xs font-medium text-red-600">
                      -{formatCurrency(quote.totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">
                    VAT ({quote.vatPercentage || 15}%):
                  </span>
                  <span className="text-xs font-medium">
                    {formatCurrency(quote.vatAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-900">
                    Grand Total:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(quote.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1">
                  NOTES
                </h4>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  {quote.notes}
                </p>
              </div>
        
            )}
            
          </div>
        </div>
      )}

      {/* Actions - Always visible */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
        <div className="flex flex-wrap gap-1.5 justify-end">
          <Link
            href={`/admin/quotes/edit/${quote._id}`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit Quote"
          >
            <FiEdit2 size={16} />
          </Link>

          <QuoteDownloadButton
            quote={quote}
            companyInfo={{
              name: "Pack & Attack Removal Ltd",
              address:
                "Based in London — proudly serving all of Greater London, with nationwide moves available.",
              phone: "07577 441 654 / 07775 144 475",
              email: "info@Packattackremovalltd.com",
            }}
          />

          {(quote.status === "draft" || quote.status === "sent") && (
            <>
              <button
                onClick={handleSendQuote}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                title="Send Quote"
              >
                <FiSend size={16} />
              </button>

              <button
                onClick={handleDeleteQuote}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete Quote"
              >
                <FiTrash2 size={16} />
              </button>
              
            </>
          )}

          {quote.status === "accepted" && !quote.convertedToBooking && (
            <button
              onClick={handleConvertToBooking}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition disabled:opacity-50"
              title="Convert to Booking"
            >
              <FiCheckCircle size={16} />
            </button>
            
          )}
          
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
