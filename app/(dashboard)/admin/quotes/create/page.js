"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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

export default function CreateQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    vatAmount: 0, // Separate VAT amount field
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
    taxableAmount: 0, // Amount subject to VAT
    vatAmount: 0,
    grandTotal: 0,
  });

  // Fetch clients and items
  useEffect(() => {
    console.log("🔄 Component mounted, fetching clients and items...");
    fetchClients();
    fetchItems();
  }, []);

  // Filter clients based on search
  useEffect(() => {
    console.log(
      "🔍 Filtering clients. Search term:",
      searchClient,
      "Total clients:",
      clients.length,
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
          client.email?.toLowerCase().includes(searchClient.toLowerCase()),
      )
      .slice(0, 5);

    console.log("🔍 Filtered clients:", filtered.length, "Results:", filtered);
    setFilteredClients(filtered);
  }, [searchClient, clients]);
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

  // Filter items based on search
useEffect(() => {
  console.log(
    "🔍 Filtering items. Search term:",
    searchItem,
    "Total items:",
    items.length,
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
        item.description?.toLowerCase().includes(searchItem.toLowerCase()),
    )
    .slice(0, 5);

  console.log("🔍 Filtered items:", filtered.length, "Results:", filtered);
  setFilteredItems(filtered);
}, [searchItem, items]);

  const fetchClients = async () => {
    console.log("📞 Fetching clients from API...");
    try {
      const response = await fetch("/api/clients?limit=50");
      console.log("📊 Clients API response status:", response.status);

      const data = await response.json();
      console.log("📊 Clients API response data:", data);

      if (data.success) {
        console.log(
          "✅ Successfully fetched clients:",
          data.clients?.length || 0,
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
      console.log("📊 Items API response status:", response.status);

      const data = await response.json();
      console.log("📊 Items API response data:", data);

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
    console.log("🧮 Calculating totals...");
    console.log("📦 Items:", formData.items.length);
    console.log("💰 Additional charges:", formData.additionalCharges.length);
    console.log("💲 Discounts:", formData.discounts.length);
    console.log("📊 VAT percentage:", formData.vatPercentage);

    calculateTotals();
  }, [
    formData.items,
    formData.additionalCharges,
    formData.discounts,
    formData.vatPercentage,
  ]);

  const calculateTotals = () => {
    console.log("🧮 Starting calculations...");

    // Calculate items total
    const itemsTotal = formData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      console.log(
        `  Item: ${item.name} (${item.quantity} × $${item.unitPrice}) = $${itemTotal}`,
      );
      return sum + itemTotal;
    }, 0);
    console.log("📦 Items total:", itemsTotal);

    // Calculate additional charges total
    const chargesTotal = formData.additionalCharges.reduce((sum, charge) => {
  return sum + (parseFloat(charge.amount) || 0);
}, 0);

    console.log("💰 Charges total:", chargesTotal);

    // Calculate discounts total
    const discountsTotal = formData.discounts.reduce((sum, discount) => {
      let discountAmount = discount.amount;
      if (discount.type === "percentage") {
        discountAmount = (itemsTotal * discount.amount) / 100;
        console.log(
          `  Discount: ${discount.description} (${discount.amount}%) = $${discountAmount}`,
        );
      } else {
        console.log(`  Discount: ${discount.description} = $${discountAmount}`);
      }
      return sum + discountAmount;
    }, 0);
    console.log("💲 Discounts total:", discountsTotal);

    // Calculate taxable amount
    const taxableAmount = itemsTotal + chargesTotal - discountsTotal;
    console.log(
      "📊 Taxable amount:",
      taxableAmount,
      "(Items + Charges - Discounts)",
    );

    // Calculate VAT amount
    const vatAmount = taxableAmount * (formData.vatPercentage / 100);
    console.log(
      "🏷️ VAT amount:",
      vatAmount,
      `(${formData.vatPercentage}% of ${taxableAmount})`,
    );

    // Calculate grand total
    const grandTotal = taxableAmount + vatAmount;
    console.log(
      "💰 Grand total:",
      grandTotal,
      `(${taxableAmount} + ${vatAmount})`,
    );

    // Update VAT amount in form data
    setFormData((prev) => ({ ...prev, vatAmount }));

    setCalculations({
      subtotal: itemsTotal,
      totalAdditionalCharges: chargesTotal,
      totalDiscount: discountsTotal,
      taxableAmount,
      vatAmount,
      grandTotal,
    });

    console.log("✅ Calculations complete:", calculations);
  };

  const handleClientSelect = (client) => {
    console.log("👤 Client selected:", client);
    console.log("📝 Setting form data with client:", {
      _id: client._id,
      name: client.name,
      phone: client.phone,
      email: client.email || "",
    });

    setFormData({
      ...formData,
      client: client._id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || "",
    });
    setSearchClient("");
    setShowClientDropdown(false);

    console.log("✅ Client set successfully");
  };

  const handleAddItem = (item) => {
    console.log("➕ Adding item to quote:", item);

    const newItem = {
      itemId: item._id,
      name: item.name,
      quantity: 1,
      unit: item.unit,
      unitPrice: item.basePrice,
      totalPrice: item.basePrice,
      notes: "",
    };

    console.log("📝 New item data:", newItem);

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
      console.log(`  Recalculated total price: $${newTotal}`);
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });

    console.log("✅ Item updated");
  };

  const handleRemoveItem = (index) => {
    console.log("🗑️ Removing item at index:", index);
    if (window.confirm("Are you sure you want to remove this item?")) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: updatedItems,
      });
      console.log("✅ Item removed. Remaining items:", updatedItems.length);
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

    console.log(
      "✅ Charge added. Total charges:",
      formData.additionalCharges.length + 1,
    );
  };

  const handleUpdateCharge = (index, field, value) => {
    console.log(`✏️ Updating charge ${index}, field: ${field}, value:`, value);

    const updatedCharges = [...formData.additionalCharges];
    updatedCharges[index][field] = value;
    setFormData({
      ...formData,
      additionalCharges: updatedCharges,
    });

    console.log("✅ Charge updated");
  };

  const handleRemoveCharge = (id) => {
    console.log("🗑️ Removing charge with id:", id);
    if (window.confirm("Are you sure you want to remove this charge?")) {
      const updatedCharges = formData.additionalCharges.filter(
        (charge) => charge.id !== id,
      );
      setFormData({
        ...formData,
        additionalCharges: updatedCharges,
      });
      console.log(
        "✅ Charge removed. Remaining charges:",
        updatedCharges.length,
      );
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

    console.log(
      "✅ Discount added. Total discounts:",
      formData.discounts.length + 1,
    );
  };

  const handleUpdateDiscount = (index, field, value) => {
    console.log(
      `✏️ Updating discount ${index}, field: ${field}, value:`,
      value,
    );

    const updatedDiscounts = [...formData.discounts];
    updatedDiscounts[index][field] = value;
    setFormData({
      ...formData,
      discounts: updatedDiscounts,
    });

    console.log("✅ Discount updated");
  };

  const handleRemoveDiscount = (id) => {
    console.log("🗑️ Removing discount with id:", id);
    if (window.confirm("Are you sure you want to remove this discount?")) {
      const updatedDiscounts = formData.discounts.filter(
        (discount) => discount.id !== id,
      );
      setFormData({
        ...formData,
        discounts: updatedDiscounts,
      });
      console.log(
        "✅ Discount removed. Remaining discounts:",
        updatedDiscounts.length,
      );
    }
  };

  const handleVATChange = (value) => {
    console.log("🏷️ VAT percentage changed to:", value);
    const vatPercentage = parseFloat(value) || 0;
    setFormData({
      ...formData,
      vatPercentage,
    });

    // Recalculate VAT amount
    const taxableAmount = calculations.taxableAmount;
    const vatAmount = taxableAmount * (vatPercentage / 100);
    setFormData((prev) => ({ ...prev, vatAmount }));

    console.log("✅ VAT updated. New VAT amount:", vatAmount);
  };

  const validateForm = () => {
    console.log("🔍 Validating form...");

    if (!formData.client) {
      console.error("❌ Validation failed: No client selected");
      alert("Please select a client");
      return false;
    }

    if (formData.items.length === 0) {
      console.error("❌ Validation failed: No items added");
      alert("Please add at least one item to the quote");
      return false;
    }

    // Validate items
    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.quantity || item.quantity <= 0) {
        console.error(
          `❌ Validation failed: Item ${i + 1} has invalid quantity`,
        );
        alert(`Item ${i + 1}: Please enter a valid quantity`);
        return false;
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        console.error(
          `❌ Validation failed: Item ${i + 1} has invalid unit price`,
        );
        alert(`Item ${i + 1}: Please enter a valid unit price`);
        return false;
      }
    }

    console.log("✅ Form validation passed");
    return true;
  };

  const handleSubmit = async (e, status = "draft") => {
    e.preventDefault();
    console.log("🚀 Form submission started. Status:", status);

    if (!validateForm()) return;

    setLoading(true);
    console.log("⏳ Loading started");

    try {
      // Prepare items with totalPrice
      const formattedItems = formData.items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice, // Add totalPrice
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
        vatAmount: formData.vatAmount, // Send VAT amount too
        validityDays: formData.validityDays,
        status: status,
        notes: formData.notes || "",
        termsConditions: formData.termsConditions,
      };

      console.log(
        "📤 Submitting quote data to API:",
        JSON.stringify(submitData, null, 2),
      );

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      console.log("📥 API Response data:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.validationErrors?.join(", ") ||
            "Failed to create quote",
        );
      }

      console.log("✅ Quote created successfully:", data.quote?._id);
      console.log("💰 Quote totals:", {
        subtotal: data.quote?.subtotal,
        vatAmount: data.quote?.vatAmount,
        grandTotal: data.quote?.grandTotal,
      });

      alert(
        `Quote ${status === "draft" ? "saved as draft" : "created"} successfully!`,
      );
      router.push("/admin/quotes");
    } catch (error) {
      console.error("❌ Error creating quote:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      console.log("🏁 Loading finished");
    }
  };

  const toggleSection = (section) => {
    console.log(
      `📂 Toggling section: ${section}, currently expanded:`,
      expandedSections[section],
    );
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
    console.log(
      `✅ Section ${section} ${!expandedSections[section] ? "expanded" : "collapsed"}`,
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const clearClient = () => {
    console.log("🗑️ Clearing selected client");
    setFormData({
      ...formData,
      client: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
    });
    setSearchClient("");
    console.log("✅ Client cleared");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Quote
            </h1>
            <p className="text-gray-600 mt-2">
              Create a detailed quote for your client
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/admin/clients"
              className="px-4 py-2 bg-primary text-white font-semibold rounded hover:bg-secondary transition"
            >
              Add New Client
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, "sent")} className="space-y-6">
        {/* Client Selection - Improved */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Client Information *
            </h2>
            {formData.client && (
              <button
                type="button"
                onClick={clearClient}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <FiX size={14} />
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
                    <h3 className="font-semibold text-gray-900">
                      {formData.clientName}
                    </h3>
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
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <FiCheck size={12} />
                  Selected
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 " ref={clientRef}>
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
                <div className="absolute z-10 mt-1 w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client._id}
                        onClick={() => handleClientSelect(client)}
                        className="p-3 hover:bg-blue-50 cursor-pointer transition rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-gray-600" size={14} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {client.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{client.phone}</span>
                              {client.email && <span>• {client.email}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.totalDeliveries || 0} deliveries
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredClients.length === 5 && searchClient && (
                    <div className="p-2 border-t text-sm text-gray-500 text-center">
                      Showing top 5 results. Refine your search for more.
                    </div>
                  )}
                </div>
              )}

              {!searchClient && !showClientDropdown && (
                <div className="text-center py-8">
                  <FiUser className="mx-auto text-gray-300 text-4xl mb-3" />
                  <p className="text-gray-500">
                    Start typing to search for clients
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items Selection - Collapsible */}
        {/* Items Selection - Collapsible */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Items & Services *
                </h2>
                <p className="text-sm text-gray-500">
                  {formData.items.length} item
                  {formData.items.length !== 1 ? "s" : ""} selected
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
            <div className="px-6 pb-6">
              {/* Search Bar with Dropdown - Same as Client */}
              <div className="relative mb-4" ref={itemRef}>
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items by name, category, or description..."
                  value={searchItem}
                  onChange={(e) => {
                    setSearchItem(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />

                {showItemDropdown && filteredItems.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {filteredItems.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleAddItem(item)}
                          className="p-3 hover:bg-blue-50 cursor-pointer transition rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FiFileText className="text-gray-600" size={14} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{item.category}</span>
                                <span>•</span>
                                <span>{item.unit}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {formatCurrency(item.basePrice)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredItems.length === 5 && searchItem && (
                      <div className="p-2 border-t text-sm text-gray-500 text-center">
                        Showing top 5 results. Refine your search for more.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Items - Grid Layout for Compact Cards */}
              {formData.items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FiFileText className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500 mb-2">No items selected</p>
                  <p className="text-sm text-gray-400">
                    Search and add items above to build your quote
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:border-blue-300 transition bg-white"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Unit: {item.unit}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 p-1 flex-shrink-0"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      {/* Quantity & Price in Row */}
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
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price *
                          </label>
                          <div className="relative">
                            {/* <span className="absolute left-2 top-1/2 transform p-4 -translate-y-1/2 text-gray-500 text-xs">
                      $
                    </span> */}
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
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

                      {/* Notes - Compact */}
                      {/* <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={item.notes || ""}
                  onChange={(e) =>
                    handleUpdateItem(index, "notes", e.target.value)
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Add notes..."
                />
              </div> */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tax & VAT Section - Collapsible */}
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Tax & VAT
                </h2>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Applied to taxable amount:{" "}
                    {formatCurrency(calculations.taxableAmount)}
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
                    Auto-calculated based on taxable amount
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Charges Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("charges")}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-green-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-900">
                  Additional Charges
                </h2>
                <p className="text-sm text-gray-500">
                  {formData.additionalCharges.length} charge
                  {formData.additionalCharges.length !== 1 ? "s" : ""} added
                </p>
              </div>
            </div>

            {expandedSections.charges ? (
              <FiChevronUp className="text-gray-400" />
            ) : (
              <FiChevronDown className="text-gray-400" />
            )}
          </button>

          {expandedSections.charges && (
            <div className="px-6 pb-6 space-y-4">
              {/* Add Charge Button */}
              <button
                type="button"
                onClick={handleAddCharge}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <FiPlus size={16} />
                Add Charge
              </button>

              {formData.additionalCharges.length === 0 && (
                <p className="text-sm text-gray-500">
                  No additional charges added.
                </p>
              )}

              {formData.additionalCharges.map((charge, index) => (
                <div
                  key={charge.id}
                  className="border rounded-lg p-2 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">
                      Charge #{index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveCharge(charge.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={charge.description}
                      onChange={(e) =>
                        handleUpdateCharge(index, "description", e.target.value)
                      }
                      placeholder="e.g. Delivery charges, Packing charges..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute p-2 left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        // step="0.01"
                        value={charge.amount}
                        onFocus={(e) => {
                          if (charge.amount === 0) {
                            handleUpdateCharge(index, "amount", "");
                          }
                        }}
                        onChange={(e) =>
                          handleUpdateCharge(
                            index,
                            "amount",
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                          )
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Section - Always Visible */}
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

            {calculations.totalAdditionalCharges > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Additional Charges</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(calculations.totalAdditionalCharges)}
                </span>
              </div>
            )}

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
                <span className="text-gray-600">
                  VAT ({formData.vatPercentage}%)
                </span>
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
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculations.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6  border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                console.log("❌ Cancelling quote creation");
                router.back();
              }}
              className="px-6 py-3 border border-gray-300  cursor-pointer text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FiX />
              Cancel
            </button>

            <button
              type="button"
              onClick={(e) => {
                console.log("💾 Saving quote as draft");
                handleSubmit(e, "draft");
              }}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 cursor-pointer text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FiSave />
              {loading ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="submit"
              disabled={loading}
              onClick={() => console.log("📤 Creating and sending quote")}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary cursor-pointer  transition flex items-center justify-center gap-2"
            >
              <FiSend />
              {loading ? "Creating..." : "Create & Send Quote"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
