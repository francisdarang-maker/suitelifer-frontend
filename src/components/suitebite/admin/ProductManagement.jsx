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
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import useCategoryStore from "../../../store/stores/categoryStore";
import AddProductForm from "./AddProductForm";
import Loading from "../../loader/Loading";
import toast from "react-hot-toast";

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
  const [isCollapsed, setIsCollapsed] = useState(true);

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
      toast.error("Failed to load products");
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

  // const showNotification = (type, message) => {
  //   setNotification({ show: true, type, message });
  //   setTimeout(
  //     () => setNotification({ show: false, type: "", message: "" }),
  //     4000
  //   );
  // };

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
      toast.error("Please fill in all required fields");
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
        toast.success(
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
        toast.error(response.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
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
        toast.success("Product deleted successfully!");
        setShowDeleteConfirm(false);
        setPendingDeleteProduct(null);
        await loadProducts();
      } else {
        toast.error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
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
          toast.success("Category added successfully!");
          await loadProducts(); // Refresh to sync categories
        } else {
          toast.error(response.message || "Failed to add category");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        toast.error("Failed to add category");
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
    <div className="product-management-container bg-white rounded-lg">
      {/* Toast Notification - Enhanced */}
      {notification.show && (
        <div
          className={`notification-toast fixed top-20 right-4 z-50 p-4 rounded-2xl shadow-2xl border-2 text-base font-semibold max-w-sm backdrop-blur-sm transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-50/90 text-green-800 border-green-300"
              : notification.type === "error"
              ? "bg-red-50/90 text-red-800 border-red-300"
              : "bg-blue-50/90 text-blue-800 border-blue-300"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Filters and Search - Modernized */}
      <div className="filters-section sticky top-0 z-10 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 pb-4 px-6 pt-5 mb-4">
        {/* Header Row with Search + Chevron (mobile) */}
        <div className="flex items-center justify-between gap-3 mb-4 md:mb-0">
          {/* Search - Always visible */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-[#0097b2] transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-2xl text-sm font-medium
              placeholder:text-gray-400 placeholder:font-normal
              focus:outline-none focus:ring-4 focus:ring-[#0097b2]/20 focus:border-[#0097b2] focus:bg-white 
              hover:border-gray-300 hover:shadow-lg
              transition-all duration-300"
              />
            </div>
          </div>

          {/* Chevron Toggle (mobile only) */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="ml-2 flex items-center justify-center p-2 rounded-xl border border-gray-200 bg-white/70 shadow-sm hover:bg-white md:hidden transition-all duration-300"
          >
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                !isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Collapsible Filters */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[600px] opacity-100"
          } md:max-h-none md:opacity-100`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4  md:gap-7 lg:grid-cols-2 lg:gap-4 gap-4  items-end mt-2">
            {/* Category Filter */}
            <div className="category-filter">
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none px-4 pr-10 py-2.5 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl 
                focus:ring-4 focus:outline-none focus:ring-[#0097b2]/20 focus:border-[#0097b2] focus:bg-white
                text-sm font-semibold text-gray-700 cursor-pointer
                hover:border-gray-300 hover:shadow-lg
                transition-all duration-300"
                >
                  {categories.map(renderCategoryOption)}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-[#0097b2] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="sort-field">
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none px-4 pr-10 py-2.5 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl 
                focus:ring-4 focus:outline-none focus:ring-[#0097b2]/20 focus:border-[#0097b2] focus:bg-white
                text-sm font-semibold text-gray-700 cursor-pointer
                hover:border-gray-300 hover:shadow-lg
                transition-all duration-300"
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
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-[#0097b2] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort Order */}
            <div className="sort-order">
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="group w-full px-4 py-2.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl 
              text-sm font-semibold text-gray-700 
              hover:from-[#0097b2]/5 hover:to-[#0097b2]/10 hover:border-[#0097b2]/50 hover:shadow-lg hover:shadow-[#0097b2]/10
              transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0097b2]/20 
              active:scale-95"
                title={`Sort ${
                  sortOrder === "asc" ? "Descending" : "Ascending"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="group-hover:text-[#0097b2] transition-colors">
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </span>
                  {sortOrder === "desc" ? (
                    <ArrowDownIcon className="w-5 h-5 text-gray-500 group-hover:text-[#0097b2] transition-all duration-300 group-hover:translate-y-0.5" />
                  ) : (
                    <ArrowUpIcon className="w-5 h-5 text-gray-500 group-hover:text-[#0097b2] transition-all duration-300 group-hover:-translate-y-0.5" />
                  )}
                </div>
              </button>
            </div>

            {/* Add Product Button */}
            <div>
              <button
                onClick={handleAddProduct}
                className="group flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl 
              bg-gradient-to-br from-[#0097b2] to-[#0097b2]/80 text-white font-bold text-sm
              hover:from-[#007a8e] hover:to-[#007a8e]/80 hover:shadow-xl hover:shadow-[#0097b2]/30
              transition-all duration-300 active:scale-95
              focus:outline-none focus:ring-4 focus:ring-[#0097b2]/20"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20">
                  <PlusIcon className="h-4 w-4" />
                </div>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container max-h-[80vh] overflow-hidden rounded-lg mx-6 ">
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* Header Container */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 via-gray-50 to-blue-50/30 rounded-2xl">
                    {/* Image column – hidden on small screens */}
                    <th className="hidden sm:w-2 sm:max-w-500px md:table-cell md:w-20 md:pr-9 lg:hidden xl:w-24 2xl:w-28 relative text-left pl-4 py-4 font-bold text-gray-700 text-sm uppercase tracking-wide after:absolute after:top-3 after:bottom-3 after:right-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-gray-300 after:to-transparent">
                      Image
                    </th>
                    {/* Name column */}
                    <th className="w-30 sm:pr-100 md:w-60 lg:w-30 md:pr-1 xl:w-[580px] 2xl:w-[600px] relative text-left pl-4 py-4 font-bold text-gray-700 text-sm uppercase tracking-wide after:absolute after:top-3 after:bottom-3 after:right-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-gray-300 after:to-transparent">
                      Name
                    </th>
                    {/* Category column – hidden on small screens */}
                    <th className="hidden md:table-cell md:w-32 xl:w-[172px] relative text-left pl-4 py-4 font-bold text-gray-700 text-sm uppercase tracking-wide after:absolute after:top-3 after:bottom-3 after:right-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-gray-300 after:to-transparent">
                      Category
                    </th>
                    {/* Price column */}
                    <th className="hidden w-20 md:w-24 md:inline-block xl:w-[140px] relative text-left pl-4 py-4 font-bold text-gray-700 text-sm uppercase tracking-wide after:absolute after:top-3 after:bottom-3 after:right-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-gray-300 after:to-transparent">
                      Price
                    </th>
                    {/* Actions column */}
                    <th className="w-20 md:w-24 xl:w-[140px] relative text-left pl-4 py-4 font-bold text-gray-700 text-sm uppercase tracking-wide">
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
                  className="group flex items-center justify-between border border-gray-300 rounded-xl p-4 lg:px-2 lg:py-6 bg-gray-50 hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0097b2]"
                >
                  {/* Image */}
                  {product.image_url && (
                    // <div className="hidden md:flex w-15 h-15 bg-gray-100 rounded-lg items-center justify-center mr-4 shrink-0  hover:h-20 hover:w-20 group-hover:scale-105">
                    <div className="hidden md:flex lg:hidden xl:flex w-16 h-16 bg-white rounded-lg items-center justify-center mr-4 shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-md ring-1 ring-gray-200">
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
                    <p className="text-sm text-gray-600 truncate mt-1 max-w-[200px] lg:hidden flex xl:flex">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden md:flex md:pr-7  items-center lg:pr-4 lg:ml-4 ">
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
                toast.success(
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
