"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMail,
  FiSend,
  FiSearch,
  FiFileText,
  FiDollarSign,
  FiPercent,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [searchClient, setSearchClient] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const clientRef = useRef(null);
  const itemRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    items: true,
    charges: false,
    discounts: false,
    settings: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    client: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    items: [],
    additionalCharges: [],
    discounts: [],
    vatPercentage: 15,
    vatAmount: 0,
    validityDays: 30,
    status: "draft",
    notes: "",
    termsConditions: "Payment due within 30 days. Prices valid for 30 days.",
  });

  // Calculations
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    totalAdditionalCharges: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    vatAmount: 0,
    grandTotal: 0,
  });

  // Fetch quote, clients and items
  useEffect(() => {
    console.log("🔄 Component mounted, fetching quote, clients and items...");
    fetchQuote();
    fetchClients();
    fetchItems();
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`);
      const data = await response.json();

      if (data.success && data.quote) {
        const quote = data.quote;
        console.log("📦 Quote fetched:", quote);

        // Format items with proper structure
        const formattedItems = quote.items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice || item.quantity * item.unitPrice,
          unit: item.unit,
          notes: item.notes || "",
        }));

        // Format charges and discounts
        const formattedCharges = (quote.additionalCharges || []).map(
          (charge, idx) => ({
            id: `charge-${idx}`,
            description: charge.description,
            amount: charge.amount,
            type: charge.type || "other",
          })
        );

        const formattedDiscounts = (quote.discounts || []).map((discount, idx) => ({
          id: `discount-${idx}`,
          description: discount.description,
          amount: discount.amount,
          type: discount.type || "fixed",
        }));

        setFormData({
          client: quote.client,
          clientName: quote.clientName,
          clientPhone: quote.clientPhone,
          clientEmail: quote.clientEmail,
          items: formattedItems,
          additionalCharges: formattedCharges,
          discounts: formattedDiscounts,
          vatPercentage: quote.vatPercentage || 15,
          vatAmount: quote.vatAmount || 0,
          validityDays: quote.validityDays || 30,
          status: quote.status,
          notes: quote.notes || "",
          termsConditions: quote.termsConditions || "",
        });

        // Set client search to current client name
        setSearchClient(quote.clientName);
        setLoading(false);
      } else {
        throw new Error(data.error || "Failed to fetch quote");
      }
    } catch (error) {
      console.error("❌ Error fetching quote:", error);
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  // Filter clients based on search
  useEffect(() => {
    console.log(
      "🔍 Filtering clients. Search term:",
      searchClient,
      "Total clients:",
      clients.length
    );

    if (!searchClient.trim()) {
      const topClients = clients.slice(0, 5);
      console.log("📋 Showing top 5 clients (no search):", topClients.length);
      setFilteredClients(topClients);
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

    console.log("🔍 Filtered clients:", filtered.length);
    setFilteredClients(filtered);
  }, [searchClient, clients]);

  // Filter items based on search
  useEffect(() => {
    console.log(
      "🔍 Filtering items. Search term:",
      searchItem,
      "Total items:",
      items.length
    );

    if (!searchItem.trim()) {
      const topItems = items.slice(0, 5);
      console.log("📋 Showing top 5 items (no search):", topItems.length);
      setFilteredItems(topItems);
      return;
    }

    const filtered = items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.category.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchItem.toLowerCase())
      )
      .slice(0, 5);

    console.log("🔍 Filtered items:", filtered.length);
    setFilteredItems(filtered);
  }, [searchItem, items]);

  const fetchClients = async () => {
    console.log("📞 Fetching clients from API...");
    try {
      const response = await fetch("/api/clients?limit=50");
      const data = await response.json();

      if (data.success) {
        console.log(
          "✅ Successfully fetched clients:",
          data.clients?.length || 0
        );
        setClients(data.clients || []);
        setFilteredClients(data.clients?.slice(0, 5) || []);
      } else {
        console.error("❌ Failed to fetch clients:", data.error);
      }
    } catch (error) {
      console.error("❌ Error fetching clients:", error);
    }
  };

  const fetchItems = async () => {
    console.log("📞 Fetching items from API...");
    try {
      const response = await fetch("/api/items?limit=50&activeOnly=true");
      const data = await response.json();

      if (data.success) {
        console.log("✅ Successfully fetched items:", data.items?.length || 0);
        setItems(data.items || []);
      } else {
        console.error("❌ Failed to fetch items:", data.error);
      }
    } catch (error) {
      console.error("❌ Error fetching items:", error);
    }
  };

  // Calculate totals whenever form data changes
  useEffect(() => {
    function handleClickOutside(event) {
      if (clientRef.current && !clientRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleClickOutsideItems(event) {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        setShowItemDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutsideItems);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideItems);
    };
  }, []);

  useEffect(() => {
    console.log("🧮 Calculating totals...");
    calculateTotals();
  }, [
    formData.items,
    formData.additionalCharges,
    formData.discounts,
    formData.vatPercentage,
  ]);

  const calculateTotals = () => {
    console.log("🧮 Starting calculations...");

    const itemsTotal = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + itemTotal;
    }, 0);

    const chargesTotal = formData.additionalCharges.reduce((sum, charge) => {
      return sum + (parseFloat(charge.amount) || 0);
    }, 0);

    const discountsTotal = formData.discounts.reduce((sum, discount) => {
      let discountAmount = discount.amount;
      if (discount.type === "percentage") {
        discountAmount = (itemsTotal * discount.amount) / 100;
      }
      return sum + discountAmount;
    }, 0);

    const taxableAmount = itemsTotal + chargesTotal - discountsTotal;
    const vatAmount = taxableAmount * (formData.vatPercentage / 100);
    const grandTotal = taxableAmount + vatAmount;

    setFormData((prev) => ({ ...prev, vatAmount }));

    setCalculations({
      subtotal: itemsTotal,
      totalAdditionalCharges: chargesTotal,
      totalDiscount: discountsTotal,
      taxableAmount,
      vatAmount,
      grandTotal,
    });

    console.log("✅ Calculations complete");
  };

  const handleClientSelect = (client) => {
    console.log("👤 Client selected:", client);
    setFormData({
      ...formData,
      client: client._id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
    });
    setSearchClient(client.name);
    setShowClientDropdown(false);
  };

  const handleAddItem = (item) => {
    console.log("➕ Adding item:", item);

    const newItem = {
      itemId: item._id,
      name: item.name,
      quantity: 1,
      unitPrice: item.basePrice || 0,
      totalPrice: item.basePrice || 0,
      unit: item.unit,
      notes: "",
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    setSearchItem("");
    setShowItemDropdown(false);
    console.log("✅ Item added. Total items:", formData.items.length + 1);
  };

  const handleUpdateItem = (index, field, value) => {
    console.log(`✏️ Updating item ${index}, field: ${field}, value:`, value);

    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === "quantity" || field === "unitPrice") {
      const newTotal =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
      updatedItems[index].totalPrice = newTotal;
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  const handleRemoveItem = (index) => {
    console.log("🗑️ Removing item at index:", index);
    if (window.confirm("Are you sure you want to remove this item?")) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: updatedItems,
      });
    }
  };

  const handleAddCharge = () => {
    console.log("➕ Adding new charge");

    const newCharge = {
      id: Date.now().toString(),
      description: "",
      amount: "",
      type: "other",
    };

    setFormData({
      ...formData,
      additionalCharges: [...formData.additionalCharges, newCharge],
    });
    setExpandedSections({ ...expandedSections, charges: true });
  };

  const handleUpdateCharge = (index, field, value) => {
    console.log(`✏️ Updating charge ${index}, field: ${field}, value:`, value);

    const updatedCharges = [...formData.additionalCharges];
    updatedCharges[index][field] = value;
    setFormData({
      ...formData,
      additionalCharges: updatedCharges,
    });
  };

  const handleRemoveCharge = (id) => {
    console.log("🗑️ Removing charge with id:", id);
    if (window.confirm("Are you sure you want to remove this charge?")) {
      const updatedCharges = formData.additionalCharges.filter(
        (charge) => charge.id !== id
      );
      setFormData({
        ...formData,
        additionalCharges: updatedCharges,
      });
    }
  };

  const handleAddDiscount = () => {
    console.log("➕ Adding new discount");

    const newDiscount = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
      type: "fixed",
    };

    setFormData({
      ...formData,
      discounts: [...formData.discounts, newDiscount],
    });
    setExpandedSections({ ...expandedSections, discounts: true });
  };

  const handleUpdateDiscount = (index, field, value) => {
    console.log(
      `✏️ Updating discount ${index}, field: ${field}, value:`,
      value
    );

    const updatedDiscounts = [...formData.discounts];
    updatedDiscounts[index][field] = value;
    setFormData({
      ...formData,
      discounts: updatedDiscounts,
    });
  };

  const handleRemoveDiscount = (id) => {
    console.log("🗑️ Removing discount with id:", id);
    if (window.confirm("Are you sure you want to remove this discount?")) {
      const updatedDiscounts = formData.discounts.filter(
        (discount) => discount.id !== id
      );
      setFormData({
        ...formData,
        discounts: updatedDiscounts,
      });
    }
  };

  const handleVATChange = (value) => {
    console.log("🏷️ VAT percentage changed to:", value);
    const vatPercentage = parseFloat(value) || 0;
    setFormData({
      ...formData,
      vatPercentage,
    });
  };

  const validateForm = () => {
    console.log("🔍 Validating form...");

    if (!formData.client) {
      alert("Please select a client");
      return false;
    }

    if (formData.items.length === 0) {
      alert("Please add at least one item to the quote");
      return false;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.quantity || item.quantity <= 0) {
        alert(`Item ${i + 1}: Please enter a valid quantity`);
        return false;
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        alert(`Item ${i + 1}: Please enter a valid unit price`);
        return false;
      }
    }

    console.log("✅ Form validation passed");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Form submission started");

    if (!validateForm()) return;

    setSaving(true);

    try {
      const formattedItems = formData.items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        notes: item.notes || "",
      }));

      const submitData = {
        client: formData.client,
        items: formattedItems,
        additionalCharges: formData.additionalCharges.map((charge) => ({
          description: charge.description,
          amount: charge.amount,
          type: charge.type,
        })),
        discounts: formData.discounts.map((discount) => ({
          description: discount.description,
          amount: discount.amount,
          type: discount.type,
        })),
        vatPercentage: formData.vatPercentage,
        vatAmount: formData.vatAmount,
        validityDays: formData.validityDays,
        notes: formData.notes || "",
        termsConditions: formData.termsConditions,
      };

      console.log("📤 Submitting quote update to API");

      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quote");
      }

      console.log("✅ Quote updated successfully");
      alert("Quote updated successfully!");
      router.push("/admin/quotes");
    } catch (error) {
      console.error("❌ Error updating quote:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
        <p className="text-gray-500 mt-1">Update quote details and information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Client Information
              </h2>
              <p className="text-sm text-gray-500">Select or search for a client</p>
            </div>
          </div>

          <div className="space-y-4">
            <div ref={clientRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchClient}
                  onChange={(e) => {
                    setSearchClient(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <button
                      key={client._id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.phone} • {client.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {formData.clientName && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900">
                    {formData.clientName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900">
                    {formData.clientPhone}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900">
                    {formData.clientEmail}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("items")}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiFileText className="text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                <p className="text-sm text-gray-500">
                  {formData.items.length} item
                  {formData.items.length !== 1 ? "s" : ""} added
                </p>
              </div>
            </div>

            {expandedSections.items ? (
              <FiChevronUp className="text-gray-400" />
            ) : (
              <FiChevronDown className="text-gray-400" />
            )}
          </button>

          {expandedSections.items && (
            <div className="px-6 pb-6 space-y-4">
              {/* Add Item Button */}
              <div ref={itemRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Item
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for an item..."
                    value={searchItem}
                    onChange={(e) => {
                      setSearchItem(e.target.value);
                      setShowItemDropdown(true);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {showItemDropdown && filteredItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredItems.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleAddItem(item)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.basePrice)} • {item.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {formData.items.length === 0 ? (
                <p className="text-sm text-gray-500">No items added yet.</p>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:border-blue-300 transition bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 p-1 flex-shrink-0"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Qty *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItem(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="px-2 py-1.5 bg-gray-50 rounded-md text-sm font-semibold text-gray-900">
                            {formatCurrency(item.totalPrice).replace("$", "")}
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

        {/* Discounts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("discounts")}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiPercent className="text-red-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">Discounts</h2>
                <p className="text-sm text-gray-500">
                  {formData.discounts.length} discount
                  {formData.discounts.length !== 1 ? "s" : ""} added
                </p>
              </div>
            </div>

            {expandedSections.discounts ? (
              <FiChevronUp className="text-gray-400" />
            ) : (
              <FiChevronDown className="text-gray-400" />
            )}
          </button>

          {expandedSections.discounts && (
            <div className="px-6 pb-6 space-y-4">
              <button
                type="button"
                onClick={handleAddDiscount}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <FiPlus size={16} />
                Add Discount
              </button>

              {formData.discounts.length === 0 && (
                <p className="text-sm text-gray-500">No discounts added.</p>
              )}

              {formData.discounts.map((discount, index) => (
                <div key={discount.id} className="border rounded-lg p-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">
                      Discount #{index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveDiscount(discount.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={discount.description}
                      onChange={(e) =>
                        handleUpdateDiscount(index, "description", e.target.value)
                      }
                      placeholder="e.g. Early bird discount"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <select
                      value={discount.type}
                      onChange={(e) =>
                        handleUpdateDiscount(index, "type", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={discount.amount}
                      onChange={(e) =>
                        handleUpdateDiscount(
                          index,
                          "amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Amount"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tax & VAT Section */}
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
                <h2 className="text-lg font-semibold text-gray-900">Tax & VAT</h2>
                <p className="text-sm text-gray-500">
                  VAT: {formData.vatPercentage}% ={" "}
                  {formatCurrency(formData.vatAmount)}
                </p>
              </div>
            </div>
            {expandedSections.settings ? (
              <FiChevronUp className="text-gray-400" />
            ) : (
              <FiChevronDown className="text-gray-400" />
            )}
          </button>

          {expandedSections.settings && (
            <div className="px-6 pb-6 ">
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
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
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
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Quote Summary
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Items Subtotal</span>
              <span className="font-medium">
                {formatCurrency(calculations.subtotal)}
              </span>
            </div>

            {calculations.totalDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discounts</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(calculations.totalDiscount)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Taxable Amount</span>
                <span className="font-medium">
                  {formatCurrency(calculations.taxableAmount)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-600">VAT ({formData.vatPercentage}%)</span>
                <p className="text-xs text-gray-500">Value Added Tax</p>
              </div>
              <span className="font-bold text-gray-900">
                {formatCurrency(formData.vatAmount)}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">
                  Grand Total
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculations.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 cursor-pointer text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              disabled={saving}
            >
              <FiX />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition flex items-center justify-center gap-2"
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
