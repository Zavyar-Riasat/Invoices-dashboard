"use client";

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiDownload, FiUserPlus, FiAlertCircle } from 'react-icons/fi';
import ClientCard from '@/app/components/clients/ClientCard';
import ClientForm from '@/app/components/clients/ClientForm';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Form loading state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Log component mount
  useEffect(() => {
    console.log("ClientsPage: Component mounted");
    return () => {
      console.log("ClientsPage: Component unmounted");
    };
  }, []);

  // Fetch clients with error handling
  const fetchClients = async () => {
    console.log("ClientsPage: fetchClients called");
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        search: search,
        status: statusFilter !== 'all' ? statusFilter : '',
        sortBy,
        sortOrder
      });

      console.log("ClientsPage: Making API request", {
        url: `/api/clients?${queryParams}`,
        params: { search, statusFilter, sortBy, sortOrder }
      });

      const response = await fetch(`/api/clients?${queryParams}`);
      
      console.log("ClientsPage: API response status", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("ClientsPage: API response data", data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setClients(data.clients || []);
      console.log("ClientsPage: Clients data set successfully", { count: data.clients?.length || 0 });
      
    } catch (error) {
      console.error("ClientsPage: Error fetching clients", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      setError(error.message || "Failed to fetch clients. Please try again.");
      setClients([]); // Clear clients on error
      
      // Show alert for user (optional)
      alert(`Error loading clients: ${error.message}`);
      
    } finally {
      setLoading(false);
      console.log("ClientsPage: fetchClients completed");
    }
  };

  // Fetch clients when filters change
  useEffect(() => {
    console.log("ClientsPage: Filters changed, fetching clients");
    fetchClients();
  }, [statusFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    console.log("ClientsPage: Search term changed", { search });
    
    const timer = setTimeout(() => {
      if (search !== undefined) { // Check if search is defined
        console.log("ClientsPage: Executing debounced search");
        fetchClients();
      }
    }, 500);

    return () => {
      console.log("ClientsPage: Clearing search timeout");
      clearTimeout(timer);
    };
  }, [search]);

  // Handle create client
  const handleCreateClient = async (formData) => {
    console.log("ClientsPage: handleCreateClient called", formData);
    
    setFormLoading(true);
    setFormError(null);
    
    try {
      console.log("ClientsPage: Making POST request to create client", formData);
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log("ClientsPage: Create client response status", response.status);
      
      const data = await response.json();
      console.log("ClientsPage: Create client response data", data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to create client. Status: ${response.status}`);
      }

      console.log("ClientsPage: Client created successfully", data.client);
      
      // Refresh client list
      await fetchClients();
      
      // Close modal
      setShowFormModal(false);
      
      // Show success message
      alert(`Client "${formData.name}" created successfully!`);
      
    } catch (error) {
      console.error("ClientsPage: Error creating client", {
        message: error.message,
        stack: error.stack,
        formData,
        timestamp: new Date().toISOString()
      });
      
      setFormError(error.message);
      
      // Re-throw error for form component to catch
      throw error;
      
    } finally {
      setFormLoading(false);
      console.log("ClientsPage: Create client process completed");
    }
  };

  // Handle update client
  const handleUpdateClient = async (formData) => {
  console.log("ClientsPage: handleUpdateClient called", { 
    clientId: editingClient?._id, 
    formData 
  });
  
  if (!editingClient) {
    console.error("ClientsPage: No client to update");
    return;
  }
  
  setFormLoading(true);
  setFormError(null);
  
  try {
    console.log("ClientsPage: Making PUT request to update client");
    
    const response = await fetch(`/api/clients/${editingClient._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log("ClientsPage: Update client response status", response.status);
    
    // First, try to get response as text to see what's returned
    const responseText = await response.text();
    console.log("ClientsPage: Raw response text", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("ClientsPage: Update client response data", data);
    } catch (parseError) {
      console.error("ClientsPage: Failed to parse JSON response", {
        text: responseText,
        error: parseError.message
      });
      throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      // Create a detailed error with response data
      const error = new Error(data?.error || `Failed to update client. Status: ${response.status}`);
      error.response = data;
      error.status = response.status;
      throw error;
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
    console.error("ClientsPage: Error updating client", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response,
      status: error.status,
      clientId: editingClient?._id,
      formData,
      timestamp: new Date().toISOString()
    });
    
    // Set form error for user feedback
    setFormError(error.message || 'Failed to update client');
    
    // Re-throw error for form component to catch
    throw error;
    
  } finally {
    setFormLoading(false);
    console.log("ClientsPage: Update client process completed");
  }
};

  // Handle delete client
  const handleDeleteClient = async (client) => {
    console.log("ClientsPage: handleDeleteClient called", { clientId: client._id, clientName: client.name });
    
    if (!confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`)) {
      console.log("ClientsPage: Delete cancelled by user");
      return;
    }

    try {
      console.log("ClientsPage: Making DELETE request");
      
      const response = await fetch(`/api/clients/${client._id}`, {
        method: 'DELETE',
      });

      console.log("ClientsPage: Delete client response status", response.status);
      
      const data = await response.json();
      console.log("ClientsPage: Delete client response data", data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to delete client. Status: ${response.status}`);
      }

      console.log("ClientsPage: Client deleted successfully");
      
      // Refresh client list
      await fetchClients();
      
      // Show success message
      alert(`Client "${client.name}" deleted successfully!`);
      
    } catch (error) {
      console.error("ClientsPage: Error deleting client", {
        message: error.message,
        stack: error.stack,
        clientId: client._id,
        timestamp: new Date().toISOString()
      });
      
      alert(`Error deleting client: ${error.message}`);
    }
  };

  // Open edit modal
  const handleOpenEditModal = (client) => {
    console.log("ClientsPage: Opening edit modal for client", { clientId: client._id, clientName: client.name });
    setEditingClient(client);
    setShowFormModal(true);
    setFormError(null);
  };

  // Close modal
  const handleCloseModal = () => {
    console.log("ClientsPage: Closing modal");
    setShowFormModal(false);
    setEditingClient(null);
    setFormError(null);
  };

  // Retry fetch on error
  const handleRetry = () => {
    console.log("ClientsPage: Retrying fetch");
    fetchClients();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Store, organize, and track all your clients</p>
        </div>
        <div className="flex gap-3">
          {/* <button 
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
            onClick={() => console.log("Export clicked")}
          >
            <FiDownload />
            Export
          </button> */}
          <button
            onClick={() => {
              console.log("Add New Client button clicked");
             setEditingClient(null);
              setShowFormModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FiUserPlus />
            Add New Client
          </button>
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
                placeholder="Search by name, phone, email, or address..."
                value={search}
                onChange={(e) => {
                  console.log("ClientsPage: Search input changed", e.target.value);
                  setSearch(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                console.log("ClientsPage: Status filter changed", e.target.value);
                setStatusFilter(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                console.log("ClientsPage: Sort changed", { sortBy, sortOrder });
                setSortBy(sortBy);
                setSortOrder(sortOrder);
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
        
        {/* Debug info (remove in production) */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600">
            Debug: Showing {clients.length} clients | Search: "{search}" | Status: {statusFilter} | Sort: {sortBy}-{sortOrder}
          </p>
        </div>
      </div>

      {/* Client Form Modal */}
      <ClientForm
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
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Error Loading Clients</h3>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteClient}
              onView={setViewingClient}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiUserPlus className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {search || statusFilter !== 'all'
              ? 'No clients match your search criteria. Try adjusting your filters.'
              : "You haven't added any clients yet. Get started by adding your first client."}
          </p>
          <button
            onClick={() => {
              console.log("Add First Client button clicked from empty state");
              setEditingClient(null);
              setShowFormModal(true);
            }}
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