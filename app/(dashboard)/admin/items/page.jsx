"use client";

import { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiPlus, FiDownload, 
  FiPackage, FiGrid, FiList, FiRefreshCw,
  FiTrendingUp, FiBarChart2, FiShoppingBag
} from 'react-icons/fi';
import ItemCard from '@/app/components/items/ItemCard';
import ItemForm from '@/app/components/items/ItemForm';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeOnly, setActiveOnly] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Form loading state
  const [formLoading, setFormLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        search: search,
        category: categoryFilter !== 'all' ? categoryFilter : '',
        sortBy,
        sortOrder,
        activeOnly: activeOnly.toString()
      });

      const response = await fetch(`/api/items?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      
      if (data.success) {
        setItems(data.items || []);
        setCategories(data.filters?.categories || []);
      } else {
        throw new Error(data.error || 'Failed to fetch items');
      }
      
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(error.message);
      setItems([]);
      
    } finally {
      setLoading(false);
    }
  };

  // Fetch items when filters change
  useEffect(() => {
    fetchItems();
  }, [categoryFilter, sortBy, sortOrder, activeOnly]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Handle create item
  const handleCreateItem = async (formData) => {
    setFormLoading(true);
    
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item');
      }

      await fetchItems();
      setShowFormModal(false);
      alert(`Item "${formData.name}" created successfully!`);
      
    } catch (error) {
      console.error('Error creating item:', error);
      alert(`Error: ${error.message}`);
      throw error;
      
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update item
  const handleUpdateItem = async (formData) => {
    if (!editingItem) return;
    
    setFormLoading(true);
    
    try {
      const response = await fetch(`/api/items/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item');
      }

      await fetchItems();
      setEditingItem(null);
      setShowFormModal(false);
      alert(`Item "${formData.name}" updated successfully!`);
      
    } catch (error) {
      console.error('Error updating item:', error);
      alert(`Error: ${error.message}`);
      throw error;
      
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete item');
      }

      await fetchItems();
      alert(`Item "${item.name}" deleted successfully!`);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const activeItems = items.filter(item => item.isActive);
    const totalValue = activeItems.reduce((sum, item) => sum + item.basePrice, 0);
    const avgPrice = activeItems.length > 0 ? totalValue / activeItems.length : 0;
    
    return {
      totalItems: items.length,
      activeItems: activeItems.length,
      totalValue,
      avgPrice
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Item & Price Management</h1>
          <p className="text-gray-600 mt-2">Manage item catalog and shifting prices</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2">
            <FiDownload />
            Export Catalog
          </button> */}
          <button
            onClick={() => setShowFormModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition flex items-center gap-2"
          >
            <FiPlus />
            Add New Item
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiShoppingBag className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeItems}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiPackage className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${stats.avgPrice.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiTrendingUp className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{categories.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiBarChart2 className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items by name, description, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setSortBy(sortBy);
                setSortOrder(sortOrder);
              }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="basePrice-asc">Price: Low to High</option>
              <option value="basePrice-desc">Price: High to Low</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>

          {/* View Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveOnly(!activeOnly)}
              className={`flex-1 px-4 py-3 border rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                activeOnly
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <FiRefreshCw />
              {activeOnly ? 'Active Only' : 'Show All'}
            </button>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <FiGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <FiList size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || categoryFilter !== 'all' || !activeOnly) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {search && (
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                Search: "{search}"
                <button
                  onClick={() => setSearch('')}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </div>
            )}
            {categoryFilter !== 'all' && (
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                Category: {categoryFilter}
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </div>
            )}
            {!activeOnly && (
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                Showing All Items
                <button
                  onClick={() => setActiveOnly(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Item Form Modal */}
      <ItemForm
        item={editingItem}
        onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
        onCancel={() => {
          setShowFormModal(false);
          setEditingItem(null);
        }}
        isLoading={formLoading}
        isOpen={showFormModal}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 bg-red-50 border border-red-200 rounded-xl">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiPackage className="text-red-500 text-2xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Items</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchItems}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Items Grid/List */}
      {!loading && !error && items.length > 0 && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onEdit={(item) => {
                setEditingItem(item);
                setShowFormModal(true);
              }}
              onDelete={handleDeleteItem}
              onView={setViewingItem}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FiPackage className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {search || categoryFilter !== 'all' || !activeOnly
              ? 'No items match your search criteria. Try adjusting your filters.'
              : "You haven't added any items yet. Start building your catalog!"}
          </p>
          <button
            onClick={() => setShowFormModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <FiPlus />
            Add First Item
          </button>
        </div>
      )}
    </div>
  );
}