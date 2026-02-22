"use client";

import { useState, useEffect } from "react";  
import Link from "next/link";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiPlus,
  FiLoader,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import InvoiceCard from "@/app/components/invoices/InvoiceCard";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
    const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
    const handleToggleExpand = (id) => {
    setExpandedInvoiceId((prev) => (prev === id ? null : id));
  };

  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchInvoices();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
    }
  };

  const handleDeleteInvoice = (invoiceId) => {
    setInvoices(invoices.filter(inv => inv._id !== invoiceId));
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1,
    }));
  };

  const generatePageNumbers = () => {
    const totalPages = pagination.pages;
    const currentPage = page;
    const pageNumbers = [];
    
    pageNumbers.push(1);
    
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    if (start > 2) {
      pageNumbers.push("...");
    }
    
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }
    
    if (end < totalPages - 1) {
      pageNumbers.push("...");
    }
    
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">
            Total Invoices: {pagination.total}
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition flex items-center gap-2"
        >
          <FiFileText />
          Create from Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number or client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            {/* <option value="overdue">Overdue</option> */}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Invoices</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <FiLoader className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      )}

      {/* Invoices Grid */}
      {!loading && !error && (
        <>
          {invoices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <FiFileText className="mx-auto text-gray-400 text-5xl mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-8">
                {search || statusFilter !== "all"
                  ? "No invoices match your search criteria"
                  : "Create your first invoice from a completed booking"}
              </p>
              <Link
                href="/admin/bookings"
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition inline-flex items-center gap-2"
              >
                <FiFileText />
                Go to Bookings
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start">
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice._id}
                    invoice={invoice}
                    onRefresh={fetchInvoices}
                      isExpanded={expandedInvoiceId === invoice._id}
          onToggleExpand={handleToggleExpand}
                    onDelete={handleDeleteInvoice}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {Math.min((page - 1) * limit + 1, pagination.total)} to{" "}
                      {Math.min(page * limit, pagination.total)} of {pagination.total} invoices
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FiChevronsLeft />
                      </button>
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FiChevronLeft />
                      </button>

                      <div className="flex items-center gap-1 mx-2">
                        {generatePageNumbers().map((pageNum, index) =>
                          pageNum === "..." ? (
                            <span key={index} className="px-3 py-1 text-gray-400">...</span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                                page === pageNum
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.pages}
                        className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FiChevronRight />
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.pages)}
                        disabled={page === pagination.pages}
                        className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FiChevronsRight />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}