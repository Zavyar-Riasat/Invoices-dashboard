"use client";

import { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiDownload,
  FiUserPlus,
  FiAlertCircle,
  FiRefreshCw,
  FiTag,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import ClientCard from "@/app/components/clients/ClientCard";
import ClientForm from "@/app/components/clients/ClientForm";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [expandedClientId, setExpandedClientId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Form loading state
  const [formLoading, setFormLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    totalDeliveries: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch clients with error handling
  const fetchClients = async () => {
    console.log("ClientsPage: fetchClients called");
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search,
        status: statusFilter !== "all" ? statusFilter : "",
        sortBy,
        sortOrder,
      });

      console.log("ClientsPage: Making API request to /api/clients");

      const response = await fetch(`/api/clients?${queryParams}`);

      console.log("ClientsPage: API response status", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("ClientsPage: API response data", data);

      if (data.success) {
        setClients(data.clients || []);
        setPagination(data.pagination);

        // Calculate statistics
        const activeClients =
          data.clients?.filter((c) => c.status === "active") || [];
        const totalRevenue =
          data.clients?.reduce(
            (sum, client) => sum + (client.totalSpent || 0),
            0,
          ) || 0;
        const totalDeliveries =
          data.clients?.reduce(
            (sum, client) => sum + (client.totalDeliveries || 0),
            0,
          ) || 0;

        setStats({
          totalClients: data.pagination.total || 0,
          activeClients: activeClients.length,
          totalRevenue,
          totalDeliveries,
        });
      } else {
        throw new Error(data.error || "Failed to fetch clients");
      }
    } catch (error) {
      console.error("ClientsPage: Error fetching clients", error);
      setError(error.message || "Failed to fetch clients. Please try again.");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchClients();
  }, [page, statusFilter, sortBy, sortOrder]);

  // Debounced search (500ms delay)
  useEffect(() => {
    console.log("ClientsPage: Search term changed", { search });

    const timer = setTimeout(() => {
      console.log("ClientsPage: Executing debounced search");
      // Reset to page 1 when search changes
      setPage(1);
      fetchClients();
    }, 500);

    return () => {
      console.log("ClientsPage: Clearing search timeout");
      clearTimeout(timer);
    };
  }, [search]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle create client
  const handleCreateClient = async (formData) => {
    console.log("ClientsPage: handleCreateClient called", formData);

    setFormLoading(true);

    try {
      console.log("ClientsPage: Making POST request to create client");

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log(
        "ClientsPage: Create client response status",
        response.status,
      );

      const data = await response.json();
      console.log("ClientsPage: Create client response data", data);

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to create client. Status: ${response.status}`,
        );
      }

      console.log("ClientsPage: Client created successfully", data.client);

      // Refresh client list
      await fetchClients();

      // Close modal
      setShowFormModal(false);

      // Show success message
      alert(`Client "${formData.name}" created successfully!`);
    } catch (error) {
      console.error("ClientsPage: Error creating client", error);
      alert(`Error: ${error.message}`);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update client
  const handleUpdateClient = async (formData) => {
    console.log("ClientsPage: handleUpdateClient called", {
      clientId: editingClient?._id,
      formData,
    });

    if (!editingClient) {
      console.error("ClientsPage: No client to update");
      return;
    }

    setFormLoading(true);

    try {
      console.log("ClientsPage: Making PUT request to update client");

      const response = await fetch(`/api/clients/${editingClient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log(
        "ClientsPage: Update client response status",
        response.status,
      );

      const data = await response.json();
      console.log("ClientsPage: Update client response data", data);

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to update client. Status: ${response.status}`,
        );
      }

      console.log("ClientsPage: Client updated successfully", data.client);

      // Refresh client list
      await fetchClients();

      // Close modal and clear editing client
      setEditingClient(null);
      setShowFormModal(false);

      // Show success message
      alert(`Client "${formData.name}" updated successfully!`);
    } catch (error) {
      console.error("ClientsPage: Error updating client", error);
      alert(`Error: ${error.message}`);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete client
  const handleDeleteClient = async (client) => {
    console.log("ClientsPage: handleDeleteClient called", {
      clientId: client._id,
      clientName: client.name,
    });

    if (
      !confirm(
        `Are you sure you want to delete "${client.name}"? This action cannot be undone.`,
      )
    ) {
      console.log("ClientsPage: Delete cancelled by user");
      return;
    }

    try {
      console.log("ClientsPage: Making DELETE request");

      const response = await fetch(`/api/clients/${client._id}`, {
        method: "DELETE",
      });

      console.log(
        "ClientsPage: Delete client response status",
        response.status,
      );

      const data = await response.json();
      console.log("ClientsPage: Delete client response data", data);

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to delete client. Status: ${response.status}`,
        );
      }

      console.log("ClientsPage: Client deleted successfully");

      // Refresh client list
      await fetchClients();

      // Show success message
      alert(`Client "${client.name}" deleted successfully!`);
    } catch (error) {
      console.error("ClientsPage: Error deleting client", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Open edit modal
  const handleOpenEditModal = (client) => {
    console.log("ClientsPage: Opening edit modal for client", {
      clientId: client._id,
      clientName: client.name,
    });
    setEditingClient(client);
    setShowFormModal(true);
  };

  // Open add modal
  const handleOpenAddModal = () => {
    console.log("ClientsPage: Opening add modal for new client");
    setEditingClient(null);
    setShowFormModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    console.log("ClientsPage: Closing modal");
    setShowFormModal(false);
    setEditingClient(null);
  };

  // Retry fetch on error
  const handleRetry = () => {
    console.log("ClientsPage: Retrying fetch");
    fetchClients();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const totalPages = pagination.pages;
    const currentPage = pagination.page;
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate start and end
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis if needed
    if (start > 2) {
      pageNumbers.push("...");
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pageNumbers.push("...");
    }
    
    // Always show last page if there is more than 1 page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Client Management
          </h1>
          <p className="text-gray-600 mt-2">
            Store, organize, and track all your clients
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-primary cursor-pointer text-white rounded-lg font-medium hover:bg-secondary transition flex items-center gap-2"
          >
            <FiUserPlus />
            Add New Client
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalClients.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiDollarSign className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalDeliveries.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiPackage className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, email, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setSortBy(sortBy);
                setSortOrder(sortOrder);
                setPage(1); // Reset to first page when sorting changes
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="totalDeliveries-desc">Most Deliveries</option>
              <option value="totalSpent-desc">Highest Spending</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || statusFilter !== "all") && (
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
                <FiTag size={12} />
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-purple-500 hover:text-purple-700 ml-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client Form Modal */}
      <ClientForm
        key={editingClient ? `edit-${editingClient._id}` : "add-new"}
        client={editingClient}
        onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
        onCancel={handleCloseModal}
        isLoading={formLoading}
        isOpen={showFormModal}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle
              className="text-red-500 mt-0.5 flex-shrink-0"
              size={20}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">
                Error Loading Clients
              </h3>
              <p className="text-red-700 mt-1">{error}</p>
              <div className="mt-4">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      )}

      {/* Clients Grid */}
      {!loading && !error && clients.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {clients.map((client) => (
              <ClientCard
                key={client._id}
                client={client}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteClient}
                isExpanded={expandedClientId === client._id}
                onToggle={() =>
                  setExpandedClientId(
                    expandedClientId === client._id ? null : client._id,
                  )
                }
              />
            ))}
          </div>

          {/* Pagination Controls - NEW SECTION */}
          {pagination.pages > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
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
                  clients
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  {/* First Page Button */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={!pagination.hasPrevPage}
                    className={`p-2 rounded-lg border ${
                      pagination.hasPrevPage
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="First Page"
                  >
                    <FiChevronsLeft />
                  </button>

                  {/* Previous Page Button */}
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`p-2 rounded-lg border ${
                      pagination.hasPrevPage
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="Previous Page"
                  >
                    <FiChevronLeft />
                  </button>

                  {/* Page Numbers */}
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

                  {/* Next Page Button */}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`p-2 rounded-lg border ${
                      pagination.hasNextPage
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="Next Page"
                  >
                    <FiChevronRight />
                  </button>

                  {/* Last Page Button */}
                  <button
                    onClick={() => handlePageChange(pagination.pages)}
                    disabled={!pagination.hasNextPage}
                    className={`p-2 rounded-lg border ${
                      pagination.hasNextPage
                        ? "hover:bg-gray-50 cursor-pointer text-gray-600"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                    title="Last Page"
                  >
                    <FiChevronsRight />
                  </button>
                </div>

                {/* Page Size Selector (Optional) */}
                {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      // If you want to allow changing page size
                      // You'll need to make limit stateful instead of constant
                      console.log("Page size changed to:", e.target.value);
                    }}
                    className="border rounded px-2 py-1"
                    disabled // Enable this if you want to allow changing page size
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span>per page</span>
                </div> */}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && clients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiUserPlus className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No clients found
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "No clients match your search criteria. Try adjusting your filters."
              : "You haven't added any clients yet. Get started by adding your first client."}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <FiUserPlus />
            Add First Client
          </button>
        </div>
      )}
    </div>
  );
}