"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiCheck,
  FiInfo,
  FiPercent,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { format } from "date-fns";

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  
  const [searchClient, setSearchClient] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [searchQuote, setSearchQuote] = useState("");
  
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showQuoteDropdown, setShowQuoteDropdown] = useState(false);
  
  const clientRef = useRef(null);
  const itemRef = useRef(null);
  const quoteRef = useRef(null);

  const [expandedSections, setExpandedSections] = useState({
    client: true,
    shifting: true,
    items: true,
    payment: true,
    settings: true,
    notes: true,
  });

  // Form state
  const [formData, setFormData] = useState({
    client: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    quote: "",
    shiftingDate: "",
    shiftingTime: "",
    pickupAddress: "",
    deliveryAddress: "",
    items: [],
    totalAmount: 0,
    advanceAmount: 0,
    remainingAmount: 0,
    vatPercentage: 15,
    vatAmount: 0,
    payments: [],
    paymentHistory: [],
    assignedStaff: [],
    notes: "",
    specialInstructions: "",
    status: "pending",
  });

  // Calculations
  const [calculations, setCalculations] = useState({
    itemsTotal: 0,
    advanceAmount: 0,
    remainingAmount: 0,
    vatAmount: 0,
    totalPaid: 0,
    grandTotal: 0,
  });

  // Fetch booking data
  useEffect(() => {
    if (bookingId) {
      fetchBookingData();
      fetchClients();
      fetchItems();
      fetchQuotes();
    }
  }, [bookingId]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (clientRef.current && !clientRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutsideItems(event) {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        setShowItemDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideItems);
    return () => document.removeEventListener("mousedown", handleClickOutsideItems);
  }, []);

  useEffect(() => {
    function handleClickOutsideQuote(event) {
      if (quoteRef.current && !quoteRef.current.contains(event.target)) {
        setShowQuoteDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideQuote);
    return () => document.removeEventListener("mousedown", handleClickOutsideQuote);
  }, []);

  // Filter clients
  useEffect(() => {
    if (!searchClient.trim()) {
      setFilteredClients(clients.slice(0, 5));
      return;
    }
    const filtered = clients
      .filter(
        (client) =>
          client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
          client.phone.includes(searchClient) ||
          client.email?.toLowerCase().includes(searchClient.toLowerCase())
      )
      .slice(0, 5);
    setFilteredClients(filtered);
  }, [searchClient, clients]);

  // Filter items
  useEffect(() => {
    if (!searchItem.trim()) {
      setFilteredItems([]);
      return;
    }
    const filtered = items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchItem.toLowerCase())
      )
      .slice(0, 5);
    setFilteredItems(filtered);
  }, [searchItem, items]);

  // Filter quotes
  useEffect(() => {
    if (!searchQuote.trim()) {
      setFilteredQuotes(quotes.slice(0, 5));
      return;
    }
    const filtered = quotes
      .filter(
        (quote) =>
          quote.quoteNumber?.toLowerCase().includes(searchQuote.toLowerCase()) ||
          quote.clientName?.toLowerCase().includes(searchQuote.toLowerCase())
      )
      .slice(0, 5);
    setFilteredQuotes(filtered);
  }, [searchQuote, quotes]);

  // Calculate totals
  useEffect(() => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );

    const roundedItemsTotal = Math.round(itemsTotal);
    const vatAmount = Math.round(roundedItemsTotal * (formData.vatPercentage / 100));
    const grandTotal = roundedItemsTotal + vatAmount;
    
    // Calculate total paid from payment history
    const totalPaid = formData.paymentHistory?.reduce((sum, p) => sum + p.amount, 0) || formData.advanceAmount || 0;
    const remainingAmount = Math.max(0, grandTotal - totalPaid);

    setCalculations({
      itemsTotal: roundedItemsTotal,
      advanceAmount: formData.advanceAmount || 0,
      remainingAmount,
      vatAmount,
      totalPaid,
      grandTotal,
    });

    setFormData(prev => ({
      ...prev,
      totalAmount: grandTotal,
      vatAmount,
      remainingAmount,
    }));
  }, [formData.items, formData.advanceAmount, formData.vatPercentage, formData.paymentHistory]);

 const fetchBookingData = async () => {
  try {
    setLoading(true);
    const response = await fetch(`/api/bookings/${bookingId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch booking");
    }
    const data = await response.json();
    if (data.success) {
      const booking = data.booking;
      
      // Format dates for input fields
      const shiftingDate = booking.shiftingDate 
        ? new Date(booking.shiftingDate).toISOString().split('T')[0]
        : "";
      
      setFormData({
        client: booking.client?._id || booking.client || "",
        clientName: booking.clientName || "",
        clientPhone: booking.clientPhone || "",
        clientEmail: booking.clientEmail || "",
        // Fix: Set quote to null if empty string, otherwise keep the ID
        quote: booking.quote?._id || booking.quote || null,
        shiftingDate: shiftingDate,
        shiftingTime: booking.shiftingTime || "",
        pickupAddress: booking.pickupAddress || "",
        deliveryAddress: booking.deliveryAddress || "",
        items: booking.items || [],
        totalAmount: booking.totalAmount || 0,
        advanceAmount: booking.advanceAmount || 0,
        remainingAmount: booking.remainingAmount || 0,
        vatPercentage: booking.vatPercentage || 15,
        vatAmount: booking.vatAmount || 0,
        payments: booking.payments || [],
        paymentHistory: booking.paymentHistory || [],
        assignedStaff: booking.assignedStaff || [],
        notes: booking.notes || "",
        specialInstructions: booking.specialInstructions || "",
        status: booking.status || "pending",
      });

      setSearchClient(booking.clientName || "");
    }
  } catch (error) {
    console.error("Error fetching booking:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients?limit=50");
      const data = await response.json();
      if (data.success) {
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items?limit=50&activeOnly=true");
      const data = await response.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes?limit=50");
      const data = await response.json();
      if (data.success) {
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  };

  const handleClientSelect = (client) => {
    setFormData({
      ...formData,
      client: client._id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || "",
    });
    setSearchClient(client.name);
    setShowClientDropdown(false);
  };

  const handleQuoteSelect = (selectedQuote) => {
    setFormData(prev => ({
      ...prev,
      quote: selectedQuote._id,
      client: selectedQuote.client?._id || selectedQuote.client || prev.client,
      clientName: selectedQuote.clientName || prev.clientName,
      clientPhone: selectedQuote.clientPhone || prev.clientPhone,
      clientEmail: selectedQuote.clientEmail || prev.clientEmail,
      items: (selectedQuote.items || []).map(item => ({
        itemId: item.itemId?._id || item.itemId,
        name: item.name || item.itemId?.name || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.itemId?.basePrice || 0,
        totalPrice: item.totalPrice || (item.quantity * item.unitPrice) || 0,
        unit: item.unit || item.itemId?.unit || "",
        notes: item.notes || "",
      })),
      vatPercentage: selectedQuote.vatPercentage || 15,
    }));

    setSearchQuote(selectedQuote.quoteNumber || "");
    setShowQuoteDropdown(false);
  };

  const handleAddItem = (item) => {
    const newItem = {
      itemId: item._id,
      name: item.name,
      quantity: 1,
      unit: item.unit,
      unitPrice: item.basePrice,
      totalPrice: item.basePrice,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
    setSearchItem("");
    setShowItemDropdown(false);
  };

const handleUpdateItem = (index, field, value) => {
  // Prevent updating unitPrice
  if (field === "unitPrice") {
    return; // Do nothing if trying to update unit price
  }
  
  const updatedItems = [...formData.items];
  updatedItems[index][field] = value;

  if (field === "quantity") {
    updatedItems[index].totalPrice = 
      updatedItems[index].quantity * updatedItems[index].unitPrice;
  }

  setFormData({
    ...formData,
    items: updatedItems,
  });
};
  const handleRemoveItem = (index) => {
    if (window.confirm("Remove this item from booking?")) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: updatedItems,
      });
    }
  };

  const handleVATChange = (value) => {
    const vatPercentage = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      vatPercentage,
    }));
  };

  const validateForm = () => {
    if (!formData.client) {
      alert("Please select a client");
      return false;
    }
    if (!formData.shiftingDate) {
      alert("Please select shifting date");
      return false;
    }
    if (!formData.shiftingTime) {
      alert("Please select shifting time");
      return false;
    }
    if (!formData.pickupAddress) {
      alert("Please enter pickup address");
      return false;
    }
    if (!formData.deliveryAddress) {
      alert("Please enter delivery address");
      return false;
    }
    if (formData.items.length === 0) {
      alert("Please add at least one item");
      return false;
    }
    return true;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setSaving(true);
  try {
    // Create a copy of formData
    const submitData = {
      ...formData,
      shiftingDate: new Date(formData.shiftingDate).toISOString(),
      advanceAmount: Math.floor(parseFloat(formData.advanceAmount) || 0),
      vatPercentage: parseFloat(formData.vatPercentage) || 15,
    };
    
    // Remove quote if it's empty string or null
    if (!submitData.quote) {
      delete submitData.quote;
    }

    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update booking");
    }

    alert("Booking updated successfully!");
    router.push("/admin/bookings");
  } catch (error) {
    console.error("Error:", error);
    alert(`Error: ${error.message}`);
  } finally {
    setSaving(false);
  }
};

  const handleDeletePayment = async (paymentIndex) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) {
      return;
    }

    try {
      const updatedPayments = [...(formData.payments || [])];
      updatedPayments.splice(paymentIndex, 1);
      
      const updatedPaymentHistory = [...(formData.paymentHistory || [])];
      updatedPaymentHistory.splice(paymentIndex, 1);

      setFormData({
        ...formData,
        payments: updatedPayments,
        paymentHistory: updatedPaymentHistory,
      });
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDateTime = (date) => {
    try {
      return date ? format(new Date(date), "MMM dd, yyyy hh:mm a") : "N/A";
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <FiAlertCircle className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Booking</h2>
          <p className="text-red-600 mb-4">{error}</p>
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
            <p className="text-gray-600 mt-2">
              Booking #{formData.bookingNumber || bookingId.slice(-6)}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/bookings"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition disabled:opacity-50 flex items-center gap-2"
            >
              <FiSave />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Badge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiInfo className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Booking Status</h2>
              </div>
            </div>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Client Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
            </div>
          </div>

          <div ref={clientRef} className="relative">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, phone, or email..."
                value={searchClient}
                onChange={(e) => {
                  setSearchClient(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>

            {showClientDropdown && filteredClients.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client._id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {client.phone} {client.email && `• ${client.email}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {formData.client && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiUser className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{formData.clientName}</h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPhone size={14} />
                      {formData.clientPhone}
                    </div>
                    {formData.clientEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMail size={14} />
                        {formData.clientEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quote Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiFileText className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Link from Quote (Optional)</h2>
              <p className="text-sm text-gray-500">Select a quote to auto-fill details</p>
            </div>
          </div>

          <div ref={quoteRef} className="relative">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by quote number or client name..."
                value={searchQuote}
                onChange={(e) => {
                  setSearchQuote(e.target.value);
                  setShowQuoteDropdown(true);
                }}
                onFocus={() => setShowQuoteDropdown(true)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              />
            </div>

            {showQuoteDropdown && filteredQuotes.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredQuotes.map((quote) => (
                  <div
                    key={quote._id}
                    onClick={() => handleQuoteSelect(quote)}
                    className="p-3 hover:bg-purple-50 cursor-pointer transition border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {quote.quoteNumber || 'N/A'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {quote.clientName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shifting Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("shifting")}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-green-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Shifting Details</h2>
                <p className="text-sm text-gray-500">Date, time, and addresses</p>
              </div>
            </div>
            {expandedSections.shifting ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {expandedSections.shifting && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shifting Date *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={formData.shiftingDate}
                      onChange={(e) => setFormData({ ...formData, shiftingDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shifting Time *
                  </label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      required
                      value={formData.shiftingTime}
                      onChange={(e) => setFormData({ ...formData, shiftingTime: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Address *
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Full pickup address"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Full delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Section */}
      {/* Items Section */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <button
    type="button"
    onClick={() => toggleSection("items")}
    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
        <FiPackage className="text-orange-600" />
      </div>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        <p className="text-sm text-gray-500">
          {formData.items.length} item{formData.items.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
    {expandedSections.items ? <FiChevronUp /> : <FiChevronDown />}
  </button>

  {expandedSections.items && (
    <div className="px-6 pb-6 space-y-4">
      <div ref={itemRef} className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items to add..."
            value={searchItem}
            onChange={(e) => {
              setSearchItem(e.target.value);
              setShowItemDropdown(true);
            }}
            onFocus={() => setShowItemDropdown(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>

        {showItemDropdown && filteredItems.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredItems.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => handleAddItem(item)}
                className="w-full text-left px-4 py-2 hover:bg-orange-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {formatCurrency(item.basePrice)} • {item.unit}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {formData.items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FiPackage className="mx-auto text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500">No items added</p>
          <p className="text-sm text-gray-400 mt-1">Search and add items above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 hover:border-orange-300 transition">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 1
                    )}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unit Price
                  </label>
                  {/* Unit Price - Read Only */}
                  <div className="relative">
                    <input
                      type="number"
                      value={item.unitPrice}
                      readOnly
                      disabled
                      className="w-full px-2 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-md text-gray-700 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      {/* <span className="text-xs text-gray-500">(fixed)</span> */}
                    </div>
                  </div>
                  {/* <p className="text-xs text-gray-500 mt-1">Price is fixed</p> */}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <div className="px-2 py-1.5 bg-gray-50 rounded-md text-sm font-semibold">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>

        {/* VAT Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("settings")}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiPercent className="text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">VAT Settings</h2>
              </div>
            </div>
            {expandedSections.settings ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {expandedSections.settings && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT Percentage
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      %
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.vatPercentage}
                      onChange={(e) => handleVATChange(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT Amount
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(calculations.vatAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("payment")}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-green-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
                <p className="text-sm text-gray-500">
                  Total: {formatCurrency(calculations.grandTotal)}
                </p>
              </div>
            </div>
            {expandedSections.payment ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {expandedSections.payment && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(calculations.grandTotal)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Paid
                  </label>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(calculations.totalPaid)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remaining Balance
                  </label>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-xl font-bold text-orange-600">
                      {formatCurrency(calculations.remainingAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {formData.paymentHistory && formData.paymentHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Payment History</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.paymentHistory.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatDateTime(payment.date)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                              {payment.method}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {payment.notes || '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-2 text-sm text-center">
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("notes")}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiInfo className="text-yellow-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Notes & Instructions</h2>
                <p className="text-sm text-gray-500">Additional information</p>
              </div>
            </div>
            {expandedSections.notes ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {expandedSections.notes && (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  rows="3"
                  placeholder="Any special instructions for the move..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Internal notes for staff..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Link
              href="/admin/bookings"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FiX />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiSave />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}