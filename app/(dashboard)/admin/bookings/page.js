"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import BookingCard from "@/app/components/bookings/BookingCard";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchBookings = useCallback(async (pageNum = 1, currentStatus = "all", currentSearch = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        status: currentStatus !== "all" ? currentStatus : "all",
        search: currentSearch,
      });

      const response = await fetch(`/api/bookings?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.bookings) {
        setBookings(data.bookings);
        setPagination({
          page: data.pagination?.page || pageNum,
          limit: data.pagination?.limit || 10,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
        });

        // Calculate summary from all bookings (not just current page)
        if (data.allBookingsSummary) {
          setSummary(data.allBookingsSummary);
        } else {
          // Fallback: calculate from current page if summary not provided
          calculateSummary(data.bookings);
        }
      } else {
        console.warn("API response missing bookings:", data);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate summary from bookings
  const calculateSummary = (bookingsList) => {
    const summary = {
      total: bookingsList.length,
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      totalAmount: 0,
      totalPaid: 0,
      totalRemaining: 0,
    };

    bookingsList.forEach(booking => {
      // Count by status
      if (booking.status === 'pending') summary.pending++;
      else if (booking.status === 'confirmed') summary.confirmed++;
      else if (booking.status === 'in_progress') summary.in_progress++;
      else if (booking.status === 'completed') summary.completed++;
      else if (booking.status === 'cancelled') summary.cancelled++;

      // Calculate payment totals
      const grandTotal = (booking.subtotal || booking.totalAmount || 0) + (booking.vatAmount || 0);
      const totalPaid = booking.paymentHistory 
        ? booking.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0)
        : (booking.advanceAmount || 0);
      const remaining = Math.max(0, grandTotal - totalPaid);

      summary.totalAmount += grandTotal;
      summary.totalPaid += totalPaid;
      summary.totalRemaining += remaining;
    });

    setSummary(summary);
  };

  // Fetch all bookings for summary on initial load
  const fetchSummaryData = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings?limit=1000&summary=true", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.bookings) {
        calculateSummary(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchBookings(1, "all", "");
    fetchSummaryData();
  }, []);

  // Fetch on search term change (with debounce) and status filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(1, statusFilter, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchBookings]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchBookings(pagination.page, statusFilter, searchTerm);
        fetchSummaryData(); // Refresh summary after delete
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your moving bookings</p>
        </div>
        <Link
          href="/admin/bookings/create"
          className="px-4 py-2 bg-primary cursor-pointer text-white rounded-lg hover:bg-secondary transition flex items-center gap-2"
        >
          <FiPlus />
          New Booking
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiPackage className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiClock className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>

        {/* Confirmed */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">{summary.confirmed}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-blue-600" size={20} />
            </div>
          </div>
        </div> */}
        

        {/* In Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-indigo-600">{summary.in_progress}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FiTruck className="text-indigo-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - More Status and Payment Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Completed */}
        

        {/* Cancelled */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{summary.cancelled}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiXCircle className="text-red-600" size={20} />
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="text-purple-600" size={20} />
            </div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalRemaining)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-orange-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking number, client name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="sm:w-48 relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FiPackage className="mx-auto text-gray-400 text-5xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first booking</p>
          <Link
            href="/admin/bookings/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus />
            Create Booking
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onRefresh={() => {
                fetchBookings(pagination.page, statusFilter, searchTerm);
                fetchSummaryData(); // Refresh summary after any update
              }}
              expandedBookingId={expandedId}
              setExpandedBookingId={setExpandedId}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => fetchBookings(pagination.page - 1, statusFilter, searchTerm)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchBookings(pagination.page + 1, statusFilter, searchTerm)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}