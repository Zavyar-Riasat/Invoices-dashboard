"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  FiUsers,
  FiPercent,
} from "react-icons/fi";
import { format } from "date-fns";

export default function CreateBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  
  // Add these state variables with your other useState declarations
const [quotes, setQuotes] = useState([]);
const [filteredQuotes, setFilteredQuotes] = useState([]);
const [searchQuote, setSearchQuote] = useState("");
const [showQuoteDropdown, setShowQuoteDropdown] = useState(false);
const quoteRef = useRef(null);

  const [searchClient, setSearchClient] = useState("");
  const [searchItem, setSearchItem] = useState("");
  
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  
  
  const clientRef = useRef(null);
  const itemRef = useRef(null);
  

  const [expandedSections, setExpandedSections] = useState({
    client: true,
    shifting: true,
    items: true,
    charges: false,
    payment: false,
    staff: false,
    settings: false,
    notes: false,
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
  });

  // Fetch data
  useEffect(() => {
    fetchClients();
    fetchItems();
    fetchQuotes();

  }, []);

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
    
    // Calculate VAT
    const vatAmount = itemsTotal * (formData.vatPercentage / 100);
    
    const remainingAmount = Math.max(0, (itemsTotal+vatAmount) - (formData.advanceAmount || 0));

    setCalculations({
      itemsTotal,
      advanceAmount: formData.advanceAmount || 0,
      remainingAmount,
      vatAmount,
    });

    setFormData(prev => ({
      ...prev,
      totalAmount: itemsTotal,
      remainingAmount,
      vatAmount,
    }));
  }, [formData.items, formData.advanceAmount, formData.vatPercentage]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients?limit=50");
      if (!response.ok) {
        console.error(`❌ Clients API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("❌ Error fetching clients:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items?limit=50&activeOnly=true");
      if (!response.ok) {
        console.error(`❌ Items API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("❌ Error fetching items:", error);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/quotes?limit=50");
      if (!response.ok) {
        console.error(`❌ Quotes API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error("❌ Error fetching quotes:", error);
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

 // Add this function to handle quote selection
const handleQuoteSelect = (selectedQuote) => {
  console.log("📄 Quote selected:", selectedQuote);
  
  // Auto-fill form with quote data while preserving existing fields
  setFormData(prev => ({
    ...prev,
    client: selectedQuote.client?._id || selectedQuote.client,
    clientName: selectedQuote.clientName || "",
    clientPhone: selectedQuote.clientPhone || "",
    clientEmail: selectedQuote.clientEmail || "",
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
    vatAmount: selectedQuote.vatAmount || 0,
  }));

  // Set client search to selected client name
  setSearchClient(selectedQuote.clientName || "");
  
  // Clear quote search
  setSearchQuote("");
  setShowQuoteDropdown(false);
  
  console.log("✅ Form auto-filled from quote");
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
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === "quantity" || field === "unitPrice") {
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
    
    // Validate advance amount
    const totalAmount = calculations.itemsTotal + calculations.vatAmount;
    if (formData.advanceAmount > totalAmount) {
      alert(`Advance amount (${formData.advanceAmount}) cannot exceed total amount (${totalAmount.toFixed(2)})`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        shiftingDate: new Date(formData.shiftingDate).toISOString(),
        advanceAmount: parseFloat(formData.advanceAmount) || 0,
        totalAmount: formData.totalAmount || 0,
        vatPercentage: parseFloat(formData.vatPercentage) || 15,
        vatAmount: formData.vatAmount || 0,
      };

      console.log("📝 Submitting booking data:", submitData);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      console.log("Response status:", response.status, response.statusText);

      // Check if response is JSON or HTML
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, get text to see what's being returned
        const text = await response.text();
        console.error("Failed to parse response as JSON. Raw response:", text.substring(0, 500));
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMsg = data.validationErrors 
          ? data.validationErrors.join(", ")
          : data.error || "Failed to create booking";
        throw new Error(errorMsg);
      }

      alert("Booking created successfully!");
      router.push("/admin/bookings");
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
            <p className="text-gray-600 mt-2">Schedule a new moving booking for your client</p>
          </div>
          <Link
            href="/admin/clients"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition"
          >
            Add New Client
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
            </div>
            {formData.client && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    client: "",
                    clientName: "",
                    clientPhone: "",
                    clientEmail: "",
                  });
                  setSearchClient("");
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Change Client
              </button>
            )}
          </div>

          {formData.client ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
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
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                  <FiCheck size={12} />
                  Selected
                </span>
              </div>
            </div>
          ) : (
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
          )}
        </div>

    {/* Quote Selection (Optional) */}
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

    {/* Quote Dropdown */}
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
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>Items: {quote.items?.length || 0}</span>
                  <span>•</span>
                  <span>Total: {formatCurrency(quote.grandTotal)}</span>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {quote.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* No results message */}
    {showQuoteDropdown && searchQuote && filteredQuotes.length === 0 && (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
        No quotes found matching "{searchQuote}"
      </div>
    )}
  </div>

  {/* Show selected quote info (optional) */}
  {searchQuote && !showQuoteDropdown && filteredQuotes.length === 0 && (
    <p className="text-sm text-gray-500 mt-2">
      Type to search for accepted quotes
    </p>
  )}
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
                      min={new Date().toISOString().split('T')[0]}
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
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          />
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

            {/* Settings - VAT */}
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
                <h2 className="text-lg font-semibold text-gray-900">VAT</h2>
                
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
                    <span className="absolute p-4 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                  <p className="text-xs text-gray-500 mt-1">
                    Set VAT percentage for this booking
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT Amount
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(formData.vatAmount)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Will be calculated based on total amount
                  </p>
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
                  Total: {formatCurrency(calculations.itemsTotal+calculations.vatAmount)}
                </p>
              </div>
            </div>
            {expandedSections.payment ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {expandedSections.payment && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(calculations.itemsTotal+calculations.vatAmount)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={calculations.itemsTotal + calculations.vatAmount}
                      value={formData.advanceAmount || 0}
                      onChange={(e) => {
                        let value = e.target.value ? parseFloat(e.target.value) : 0;
                        const totalAmount = calculations.itemsTotal + calculations.vatAmount;
                        
                        // Cap the value if it exceeds total amount
                        if (value > totalAmount) {
                          value = totalAmount;
                        }
                        
                        console.log("Advance amount changed to:", value, "Max allowed:", totalAmount);
                        setFormData({
                          ...formData,
                          advanceAmount: value
                        });
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  {formData.advanceAmount > calculations.itemsTotal + calculations.vatAmount && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Advance amount cannot exceed total amount (${(calculations.itemsTotal + calculations.vatAmount).toFixed(2)})
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remaining Amount
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(calculations.remainingAmount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method (Optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData({
                        ...formData,
                        payments: [{
                          amount: parseFloat(formData.advanceAmount) || 0,
                          paymentMethod: e.target.value,
                          status: 'completed',
                        }]
                      });
                    }
                  }}
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
          )}
        </div>

    

        {/* Notes & Instructions */}
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
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FiX />
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiSave />
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}