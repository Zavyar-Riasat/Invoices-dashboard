"use client";

import { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiTruck,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import BookingCard from "./../../../components/bookings/BookingCard";
import Link from "next/link";
import { format } from "date-fns";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  });

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search,
        status: statusFilter !== "all" ? statusFilter : "",
        dateFrom,
        dateTo,
      });

      const response = await fetch(`/api/bookings?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
        setPagination(data.pagination);
        setStats(data.stats || {});
      } else {
        throw new Error(data.error || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBookings();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, dateFrom, dateTo]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiCheckCircle />;
      case 'in_progress': return <FiLoader />;
      case 'completed': return <FiTruck />;
      case 'cancelled': return <FiXCircle />;
      default: return <FiClock />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">
            Manage client bookings, payments, and shifting schedules
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/bookings/create"
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition flex items-center gap-2"
          >
            <FiPlus />
            Create New Booking
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(stats).map(([status, count]) => (
          status !== 'total' && (
            <div key={status} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 capitalize">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
                <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
              </div>
            </div>
          )
        ))}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-100">
              <FiTruck className="text-gray-600" />
            </div>
          </div>
        </div>
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
                placeholder="Search by booking number, client name, or phone..."
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
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setPage(1);
                fetchBookings();
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Apply Date Filter
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || statusFilter !== "all" || dateFrom || dateTo) && (
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
            {dateFrom && (
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
                From: {formatDate(dateFrom)}
                <button
                  onClick={() => setDateFrom("")}
                  className="text-green-500 hover:text-green-700 ml-1"
                >
                  ×
                </button>
              </div>
            )}
            {dateTo && (
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm">
                To: {formatDate(dateTo)}
                <button
                  onClick={() => setDateTo("")}
                  className="text-orange-500 hover:text-orange-700 ml-1"
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
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 bg-red-50 border border-red-200 rounded-xl">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiTruck className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Error Loading Bookings
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onRefresh={fetchBookings}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
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
                  bookings
                </div>

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
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiTruck className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {search || statusFilter !== "all" || dateFrom || dateTo
              ? "No bookings match your search criteria. Try adjusting your filters."
              : "You haven't created any bookings yet. Start by creating your first booking!"}
          </p>
          <Link
            href="/bookings/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <FiPlus />
            Create First Booking
          </Link>
        </div>
      )}
    </div>
  );
}