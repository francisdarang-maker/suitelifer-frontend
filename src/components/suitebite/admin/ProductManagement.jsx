import React, { useState, useEffect } from "react";
import { suitebiteAPI } from "../../../utils/suitebiteAPI";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import useCategoryStore from "../../../store/stores/categoryStore";
import AddProductForm from "./AddProductForm";

/**
 * ProductManagement Component - Enhanced with Variations Support
 *
 * Combined product and variation management interface.
 * Features include:
 * - Product CRUD operations with color-coded categories
 * - Variation integration for sizes, colors, styles, etc.
 * - Advanced filtering and search
 * - Image upload functionality
 * - Dynamic category management with color coding
 */
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Enhanced category store with color coding
  const {
    getAllCategories,
    getCategoriesForFilter,
    getCategoryColor,
    getCategoryBgColor,
    getCategoryByName,
    addCategory,
    syncCategoriesFromProducts,
  } = useCategoryStore();

  // Form state for add/edit modal
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_points: "",
    category: "",
    image_url: "",
  });

  // File upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Variation state
  const [variationTypes, setVariationTypes] = useState([]);
  const [variationOptions, setVariationOptions] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState([]);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  useEffect(() => {
    loadProducts();
    loadVariationData();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await suitebiteAPI.getAllProducts(false); // Include inactive products

      if (response.success) {
        setProducts(response.products || []);
        // Sync categories from products
        syncCategoriesFromProducts(response.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      showNotification("error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadVariationData = async () => {
    try {
      const response = await suitebiteAPI.getVariationTypes();
      if (response.success) {
        setVariationTypes(response.variationTypes || []);
      }
    } catch (error) {
      console.error("Error loading variation types:", error);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      4000
    );
  };

  const handleAddProduct = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price_points || !formData.category) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price_points: parseInt(formData.price_points),
        category: formData.category,
        image_url: imagePreview || formData.image_url,
      };

      let response;
      if (modalMode === "add") {
        response = await suitebiteAPI.createProduct(productData);
      } else {
        response = await suitebiteAPI.updateProduct(
          selectedProduct.product_id,
          productData
        );
      }

      if (response.success) {
        showNotification(
          "success",
          `Product ${modalMode === "add" ? "created" : "updated"} successfully!`
        );
        setShowModal(false);
        setFormData({
          name: "",
          description: "",
          price_points: "",
          category: "",
          image_url: "",
        });
        setImageFile(null);
        setImagePreview("");
        await loadProducts();
      } else {
        showNotification("error", response.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showNotification("error", "Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    setPendingDeleteProduct(productId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteProduct) return;

    try {
      setDeletingProduct(true);
      const response = await suitebiteAPI.deleteProduct(pendingDeleteProduct);
      if (response.success) {
        showNotification("success", "Product deleted successfully!");
        setShowDeleteConfirm(false);
        setPendingDeleteProduct(null);
        await loadProducts();
      } else {
        showNotification(
          "error",
          response.message || "Failed to delete product"
        );
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification("error", "Failed to delete product");
    } finally {
      setDeletingProduct(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteProduct(null);
    setDeletingProduct(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    const categoryName = prompt("Enter new category name:");
    if (categoryName && categoryName.trim()) {
      try {
        const response = await addCategory(categoryName.trim());
        if (response.success) {
          showNotification("success", "Category added successfully!");
          await loadProducts(); // Refresh to sync categories
        } else {
          showNotification(
            "error",
            response.message || "Failed to add category"
          );
        }
      } catch (error) {
        console.error("Error adding category:", error);
        showNotification("error", "Failed to add category");
      }
    }
  };

  // Get categories for filtering
  const categories = getCategoriesForFilter();
  const allCategories = getAllCategories();

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price_points") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const renderCategoryBadge = (categoryName) => {
    if (!categoryName) return null;

    const color = getCategoryColor(categoryName);
    const bgColor = getCategoryBgColor(categoryName);

    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: bgColor,
          color: color,
        }}
      >
        {categoryName}
      </span>
    );
  };

  const renderCategoryOption = (category) => {
    if (category === "all") {
      return (
        <option key="all" value="all" className="text-base">
          All Categories
        </option>
      );
    }

    return (
      <option key={category} value={category} className="text-base">
        {category}
      </option>
    );
  };

  const renderCategoryFormSelection = () => {
    return (
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-base"
        >
          <option value="">Select a category</option>
          {allCategories.map((categoryObj) => (
            <option key={categoryObj.name} value={categoryObj.name}>
              {categoryObj.name}
            </option>
          ))}
        </select>

        {/* Category preview */}
        {formData.category && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Preview: </span>
            {renderCategoryBadge(formData.category)}
          </div>
        )}
      </div>
    );
  };

  return (
    // Added Feature
    // Removed Shadow Botton Orig  'shadow-md'
    <div className="product-management-container bg-white rounded-lg ">
      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`notification-toast fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg text-base font-medium max-w-sm ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : notification.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section sticky top-0 z-10 bg-white pb-5 px-6 pt-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          {/* Search */}
          <div className="search-field">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-base"
            >
              {categories.map(renderCategoryOption)}
            </select>
          </div>

          {/* Sort By */}
          <div className="sort-field">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-base"
            >
              <option key="name" value="name">
                Sort by Name
              </option>
              <option key="price_points" value="price_points">
                Sort by Price
              </option>
              <option key="category" value="category">
                Sort by Category
              </option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="sort-order">
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label> */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-base text-gray-700 hover:bg-gray-50 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-transparent"
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              <div className="flex items-center justify-between">
                <span>{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
                {sortOrder === "desc" ? (
                  <ArrowDownIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ArrowUpIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>
          </div>

          {/* Add Product Button - moved here */}
          {/* <div className="flex justify-end md:col-span-1 lg:col-span-1">
            <button
              onClick={handleAddProduct}
              className=" bg-[#0097b2] text-white px-4 py-1.5 rounded-lg hover:bg-[#007a8e] transition-colors duration-200 flex items-center gap-2 w-full md:w-auto text-base"
            >
              <PlusIcon className="h-5 w-5" />
              Add Product
            </button>
          </div> */}

          <div className="hidden md:flex 2xl:hidden">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0097b2] text-white hover:bg-[#007a8e] transition-colors duration-200 text-base">
              <PlusIcon className="h-5 w-5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {/* Added Feature */}
      {/* Orig   border border-gray-300 */}
      <div className="products-table-container max-h-[80vh] overflow-hidden rounded-lg mx-6 ">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 text-base">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Header Container */}
            <div className="overflow-x-auto">
              {/* */}
              <table className="w-full border-collapse ">
                <thead>
                  <tr className="bg-gray-100 rounded-lg">
                    {/* Image column – hidden on small screens */}
                    <th className="hidden sm:w-2 sm:max-w-500px md:table-cell md:w-20 md:pr-9  xl:w-24 2xl:w-28 relative text-left pl-2 py-3 font-medium text-gray-700 text-base after:absolute after:top-2 after:bottom-2 after:right-0 after:w-px after:bg-gray-300">
                      Image
                    </th>
                    {/* Name column */}
                    <th className="w-40 sm:pr-100  md:w-60 md:pr-1 xl:w-[580px] 2xl:w-[600px] relative text-left pl-2 py-3 font-medium text-gray-700 text-base after:absolute after:top-2 after:bottom-2 after:right-0 after:w-px after:bg-gray-300">
                      Name
                    </th>
                    {/* Category column – hidden on small screens */}
                    <th className="hidden md:table-cell md:w-32 xl:w-[172px] relative text-left pl-2 py-3 font-medium text-gray-700 text-base after:absolute after:top-2 after:bottom-2 after:right-0 after:w-px after:bg-gray-300">
                      Category
                    </th>
                    {/* Price column */}
                    <th className="hidden w-20 md:w-24 md:inline-block xl:w-[140px] relative text-left pl-2 py-3 font-medium text-gray-700 text-base after:absolute after:top-2 after:bottom-2 after:right-0 after:w-px after:bg-gray-300">
                      Price
                    </th>
                    {/* Actions column */}
                    <th className="w-20 md:w-24 xl:w-[140px] relative text-left pl-2 py-3 font-medium text-gray-700 text-base">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Body Container */}
            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto mt-3 hover:border-primary">
              {filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  // className="group flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0097b2] hover:bg-gray-50"
                  className="group flex items-center justify-between border border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0097b2]"
                >
                  {/* Image */}
                  {product.image_url && (
                    // <div className="hidden md:flex w-15 h-15 bg-gray-100 rounded-lg items-center justify-center mr-4 shrink-0  hover:h-20 hover:w-20 group-hover:scale-105">
                    <div className="hidden md:flex w-16 h-16 bg-white rounded-lg items-center justify-center mr-4 shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-md ring-1 ring-gray-200">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-sans text-xl text-gray-800 text-base leading-snug">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate mt-1 max-w-[200px]">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden md:flex md:pr-7  items-center lg:pr-5 ">
                      {renderCategoryBadge(product.category)}
                      <span className="font-medium text-[#0097b2] text-sm md:pl-20 lg:pl-10 xl:pr-10 xl:pl-15 2xl:pl-25 2xl:pr-15">
                        {product.price || product.price_points || 0} pts
                      </span>
                    </div>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <PencilIcon className="h-6 w-6 transition-transform duration-200 hover:scale-150" />
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.product_id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <TrashIcon className="h-6 w-6 transition-transform duration-200 hover:scale-150" />
                    </button>
                  </div>
                </div>
                // </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Product Modal (Unified) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <AddProductForm
              onProductAdded={async (product) => {
                showNotification(
                  "success",
                  `Product ${
                    modalMode === "add" ? "created" : "updated"
                  } successfully!`
                );
                setShowModal(false);
                await loadProducts();
              }}
              onCancel={() => setShowModal(false)}
              product={modalMode === "edit" ? selectedProduct : null}
              mode={modalMode}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={deletingProduct}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingProduct}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
