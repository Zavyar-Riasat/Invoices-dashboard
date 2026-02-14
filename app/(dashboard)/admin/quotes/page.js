"use client";

import { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiDownload,
  FiFileText,
  FiSend,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import QuoteCard from "./../../../components/quotes/QuoteCard";
import Link from "next/link";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
const [expandedQuoteId, setExpandedQuoteId] = useState(null);  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  
  // Statistics
  const [stats, setStats] = useState({
    draft: 0,
    sent: 0,
    // pending: 0,
    // accepted: 0,
    // rejected: 0,
    // converted: 0,
  });

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("page", page);
      queryParams.set("limit", limit);
      if (search) queryParams.set("search", search);
      if (statusFilter !== "all") queryParams.set("status", statusFilter);

      const response = await fetch(`/api/quotes?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }

      const data = await response.json();

      if (data.success) {
        setQuotes(data.quotes || []);
        setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch quotes");
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setError(error.message);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics for all quotes (not just current page)
  const fetchStatistics = async () => {
    try {
      // Fetch all quotes to calculate stats
      const response = await fetch(`/api/quotes?page=1&limit=10000`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();

      if (data.success) {
        // Calculate statistics from all quotes
        const stats = {
          draft: 0,
          sent: 0,
        };
        
        data.quotes.forEach(quote => {
          if (quote.status in stats) {
            stats[quote.status]++;
          }
        });
        
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Fetch quotes based on pagination and filters
  useEffect(() => {
    fetchQuotes();
    // Fetch statistics only on initial page (not on every pagination change)
    // fetchStatistics();
  }, [page, statusFilter]);

  // Fetch statistics on component mount and when search changes
  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
          setExpandedQuoteId(null);
      setPage(1);
      fetchQuotes();
      fetchStatistics();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.pages) {
    setExpandedQuoteId(null); // 🔥 ADD THIS
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};


  const generatePageNumbers = () => {
    const totalPages = pagination.pages;
    const currentPage = pagination.page;
    const pageNumbers = [];
    
    if (totalPages <= 1) return [1];
    
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      // case 'pending': return 'bg-yellow-100 text-yellow-800';
      // case 'accepted': return 'bg-green-100 text-green-800';
      // case 'rejected': return 'bg-red-100 text-red-800';
      // case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <FiFileText />;
      case 'sent': return <FiSend />;
      // case 'pending': return <FiClock />;
      // case 'accepted': return <FiCheckCircle />;
      // case 'rejected': return <FiXCircle />;
      // case 'converted': return <FiDollarSign />;
      default: return <FiFileText />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quoting Management</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and track quotes for potential clients
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/quotes/create"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition flex items-center gap-2"
          >
            <FiPlus />
            Create New Quote
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 capitalize">{status}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
              <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by quote number, client name, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                 setExpandedQuoteId(null);
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              {/* <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="converted">Converted</option> */}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || statusFilter !== "all" || dateFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mt-4">
            {search && (
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                <FiSearch size={12} />
                Search: "{search}"
                <button
                  onClick={() => setSearch("")}
                  className="text-blue-500 hover:text-blue-700 ml-1"
                >
                  ×
                </button>
              </div>
            )}
            {statusFilter !== "all" && (
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-purple-500 hover:text-purple-700 ml-1"
                >
                  ×
                </button>
              </div>
            )}
            {dateFilter !== "all" && (
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
                Date: {dateFilter}
                <button
                  onClick={() => setDateFilter("all")}
                  className="text-green-500 hover:text-green-700 ml-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading quotes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 bg-red-50 border border-red-200 rounded-xl">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiFileText className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Error Loading Quotes
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchQuotes}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quotes List */}
      {!loading && !error && quotes.length > 0 && (
        <>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {quotes.map((quote) => (
            <QuoteCard
              key={quote._id}
              quote={quote}
              onRefresh={fetchQuotes}
              expandedQuoteId={expandedQuoteId}
              setExpandedQuoteId={setExpandedQuoteId}
            />
          ))}
        </div>

          {/* Pagination & Results Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {Math.min((page - 1) * limit + 1, pagination.total)}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(page * limit, pagination.total)}
                </span>{" "}
                of <span className="font-semibold">{pagination.total}</span>{" "}
                quotes
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className={`p-2 rounded-lg border ${
                      page > 1
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="First Page"
                  >
                    <FiChevronsLeft />
                  </button>

                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`p-2 rounded-lg border ${
                      page > 1
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="Previous Page"
                  >
                    <FiChevronLeft />
                  </button>

                  <div className="flex items-center gap-1 mx-2">
                    {generatePageNumbers().map((pageNum, index) =>
                      pageNum === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-1 text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                            page === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pagination.pages}
                    className={`p-2 rounded-lg border ${
                      page < pagination.pages
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="Next Page"
                  >
                    <FiChevronRight />
                  </button>

                  <button
                    onClick={() => handlePageChange(pagination.pages)}
                    disabled={page === pagination.pages}
                    className={`p-2 rounded-lg border ${
                      page < pagination.pages
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="Last Page"
                  >
                    <FiChevronsRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && quotes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiFileText className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No quotes found
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "No quotes match your search criteria. Try adjusting your filters."
              : "You haven't created any quotes yet. Start by creating your first quote!"}
          </p>
          <Link
            href="/admin/quotes/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <FiPlus />
            Create First Quote
          </Link>
        </div>
      )}
    </div>
  );
}