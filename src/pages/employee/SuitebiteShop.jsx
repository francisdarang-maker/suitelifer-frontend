import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSuitebiteStore } from "../../store/stores/suitebiteStore";
import useCategoryStore from "../../store/stores/categoryStore";
import { suitebiteAPI } from "../../utils/suitebiteAPI";
import ProductCard from "../../components/suitebite/ProductCard";
import ProductDetailModal from "../../components/suitebite/ProductDetailModal";
import ShoppingCart from "../../components/suitebite/ShoppingCart";
import OrderHistory from "../../components/suitebite/OrderHistory";
// import useRealTimeHeartbits from "../utils/useRealTimeHeartbits";
import useRealTimeHeartbits from "../../utils/useRealTimeHeartbits";

import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Loading from "../../components/loader/Loading";
import toast from "react-hot-toast";

const SuitebiteShop = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Modal state for product details, add to cart, buy now
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view-details");
  const [modalInitialQuantity, setModalInitialQuantity] = useState(1);
  const [modalInitialSelectedOptions, setModalInitialSelectedOptions] =
    useState({});
  const navigate = useNavigate();
  const {
    products,
    cart,
    userHeartbits,
    setProducts,
    setCart,
    setUserHeartbits,
  } = useSuitebiteStore();

  const { syncCategoriesFromProducts } = useCategoryStore();

  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("name-asc");
  const [priceRange, setPriceRange] = useState({ min: 1, max: 10000 });
  const [variationOptions, setVariationOptions] = useState([]);
  const [variationTypes, setVariationTypes] = useState([]);

  useEffect(() => {
    const shouldLoadData =
      products.length === 0 || Date.now() - lastLoadTime > 5 * 60 * 1000;

    if (shouldLoadData) {
      loadShopData();
    }

    const fetchVariationData = async () => {
      try {
        const optionsRes = await suitebiteAPI.getVariationOptions();
        if (optionsRes.success) setVariationOptions(optionsRes.options);
        const typesRes = await suitebiteAPI.getVariationTypes();
        if (typesRes.success) setVariationTypes(typesRes.types);
      } catch (e) {
        console.warn("Could not load variation options/types:", e.message);
      }
    };
    fetchVariationData();
  }, []);

  const loadShopData = async () => {
    try {
      setLoading(true);

      const [productsResponse, cartResponse, heartbitsResponse] =
        await Promise.all([
          suitebiteAPI.getProductsWithVariations("true"),
          suitebiteAPI.getCart(),
          suitebiteAPI.getUserHeartbits(),
        ]);

      if (productsResponse.success) {
        const mappedProducts = productsResponse.products.map((product) => ({
          product_id: product.product_id,
          name: product.name || product.product_name,
          description: product.description || product.product_description,
          price_points: product.price || product.price_points,
          category: product.category || product.category_name,
          is_active: product.is_active,
          image_url: product.image_url,
          images: Array.isArray(product.images) ? product.images : [],
          product_images: Array.isArray(product.product_images)
            ? product.product_images
            : [],
          variations: Array.isArray(product.variations)
            ? product.variations
            : [],
        }));

        setProducts(mappedProducts);
        syncCategoriesFromProducts(mappedProducts);
      } else {
        toast.error("error", "Failed to load products");
        console.error("❌ Products response failed:", productsResponse);
      }

      if (cartResponse.success) {
        const backendCartItems = cartResponse.data?.cartItems || [];

        const mappedCart = backendCartItems.map((item) => {
          return {
            cart_item_id: item.cart_item_id,
            product_id: item.product_id,
            product_name: item.product_name || item.name,
            points_cost: item.price_points || item.points_cost || item.price,
            quantity: item.quantity,
            image_url: item.image_url,
            images: item.images,
            product_images: item.product_images,
            variation_id: item.variation_id,
            variations: item.variations,
            variation_details: item.variation_details,
          };
        });

        setCart(mappedCart);
      } else {
        console.warn("⚠️ Cart response failed:", cartResponse);
        setCart([]);
      }

      if (heartbitsResponse.success) {
        const heartbits =
          heartbitsResponse.heartbits_balance || heartbitsResponse.balance || 0;
        setUserHeartbits(heartbits);
      } else {
        console.error("❌ Heartbits response failed:", heartbitsResponse);
        toast.error("error", "Failed to load heartbits balance");
        setUserHeartbits(0);
      }
    } catch (error) {
      console.error("Error loading shop data:", error);
      toast.error("error", "Failed to load shop data");
      setProducts([]);
      setCart([]);
      setUserHeartbits(0);
    } finally {
      setLoading(false);
      setLastLoadTime(Date.now());
    }
  };

  const updateCartAndHeartbits = async () => {
    try {
      const [cartResponse, heartbitsResponse] = await Promise.all([
        suitebiteAPI.getCart(),
        suitebiteAPI.getUserHeartbits(),
      ]);

      if (cartResponse.success) {
        const backendCartItems = cartResponse.data?.cartItems || [];
        const mappedCart = backendCartItems.map((item) => ({
          cart_item_id: item.cart_item_id,
          product_id: item.product_id,
          product_name: item.product_name || item.name,
          points_cost: item.price_points || item.points_cost || item.price,
          quantity: item.quantity,
          image_url: item.image_url,
          images: item.images,
          product_images: item.product_images,
          variation_id: item.variation_id,
          variations: item.variations,
          variation_details: item.variation_details,
        }));
        setCart(mappedCart);
      }

      if (heartbitsResponse.success) {
        const heartbits =
          heartbitsResponse.heartbits_balance || heartbitsResponse.balance || 0;
        setUserHeartbits(heartbits);
      }
    } catch (error) {
      console.error("Error updating cart and heartbits:", error);
    }
  };

  const refreshShopData = async () => {
    setLastLoadTime(0);
    await loadShopData();
  };

  const updateHeartbitsOnly = async () => {
    try {
      const heartbitsResponse = await suitebiteAPI.getUserHeartbits();
      if (heartbitsResponse.success) {
        const heartbits =
          heartbitsResponse.heartbits_balance || heartbitsResponse.balance || 0;
        setUserHeartbits(heartbits);
      }
    } catch (error) {
      console.error("Error updating heartbits:", error);
    }
  };

  const handleAddToCart = async (
    productId,
    quantity = 1,
    variationId = null,
    variations = []
  ) => {
    try {
      const cartData = {
        product_id: productId,
        quantity: quantity,
        ...(variationId && { variation_id: variationId }),
        ...(variations && variations.length > 0 && { variations: variations }),
      };

      const response = await suitebiteAPI.addToCart(cartData);

      if (response.success) {
        toast.success("success", "Item added to cart! 🛒");
        await updateCartAndHeartbits();
      } else {
        toast.error("error", response.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("error", "Failed to add item to cart");
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await handleRemoveItem(itemId);
        return;
      }

      const response = await suitebiteAPI.updateCartItem(itemId, {
        quantity: newQuantity,
      });

      if (response.success) {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.cart_item_id === itemId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        toast.success("Success", "Quantity updated!");
      } else {
        toast.error("Error", response.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Error", "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await suitebiteAPI.removeFromCart(itemId);

      if (response.success) {
        setCart((prevCart) =>
          prevCart.filter((item) => item.cart_item_id !== itemId)
        );
        toast.success("success", "Item removed from cart");
      } else {
        toast.error("error", response.message || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("error", "Failed to remove item");
    }
  };

  const handleCheckout = async (selectedItems) => {
    try {
      console.log("CHECKOUT PAYLOAD:", selectedItems);
      const response = await suitebiteAPI.checkout({
        items: selectedItems,
      });

      if (response.success) {
        await updateCartAndHeartbits();

        toast.success(
          "Success",
          "Order placed successfully! Awaiting admin approval. 🎉"
        );
      } else {
        toast.error("Error", response.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.data?.message) {
        toast.error("Error", error.response.data.message);
      } else {
        toast.error("Error", "Checkout failed. Please try again.");
      }
    }
  };

  const handleBuyNow = async (
    productId,
    quantity = 1,
    variationId = null,
    variations = []
  ) => {
    console.log("💳 SuitebiteShop - handleBuyNow called with:", {
      productId,
      quantity,
      variationId,
      variations,
      productIdType: typeof productId,
      quantityType: typeof quantity,
    });

    try {
      const res = await suitebiteAPI.getProductById(productId);
      let product =
        res.success && res.product
          ? res.product
          : products.find((p) => p.product_id === productId);

      if (product) {
        product = {
          ...product,
          images:
            Array.isArray(product.images) && product.images.length > 0
              ? product.images
              : product.image_url
              ? [{ image_url: product.image_url, alt_text: product.name }]
              : [],
        };

        console.log("🖼️ Product images for modal:", product.images);

        setModalProduct(product);
        setIsModalOpen(true);
        setModalMode("buy-now");
        setModalInitialQuantity(quantity);

        const initialOptions = {};
        if (variations && variations.length > 0) {
          variations.forEach((variation) => {
            if (variation.type_name && variation.option_id) {
              initialOptions[variation.type_name] = variation.option_id;
            }
          });
        }
        setModalInitialSelectedOptions(initialOptions);
      } else {
        toast.error("error", "Product not found");
      }
    } catch (error) {
      console.error("Error fetching product for modal:", error);
      toast.error("error", "Failed to load product details");
    }
  };

  const getCategories = () => {
    const categories = new Set(
      products.map((product) => product.category).filter(Boolean)
    );
    return Array.from(categories).sort();
  };

  const isAnyFilterActive =
    searchTerm !== "" ||
    selectedCategory !== "all" ||
    priceRange.min !== 1 ||
    priceRange.max !== 10000 ||
    sortOption !== "name-asc";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("name-asc");
    setPriceRange({ min: 1, max: 10000 });
  };

  const filteredAndSortedProducts = products
    .filter((product) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(searchLower);
        const matchesDescription = product.description
          .toLowerCase()
          .includes(searchLower);
        const matchesCategory = product.category
          .toLowerCase()
          .includes(searchLower);
        if (!matchesName && !matchesDescription && !matchesCategory)
          return false;
      }

      if (selectedCategory !== "all" && product.category !== selectedCategory)
        return false;

      if (
        product.price_points < priceRange.min ||
        product.price_points > priceRange.max
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      const aName = a.name ?? "";
      const bName = b.name ?? "";
      const aPrice = a.price_points ?? 0;
      const bPrice = b.price_points ?? 0;
      const aCategory = a.category ?? "";
      const bCategory = b.category ?? "";
      switch (sortOption) {
        case "name-asc":
          return aName.localeCompare(bName);
        case "name-desc":
          return bName.localeCompare(aName);
        case "price-asc":
          return aPrice - bPrice;
        case "price-desc":
          return bPrice - aPrice;
        case "category-asc":
          return aCategory.localeCompare(bCategory);
        case "category-desc":
          return bCategory.localeCompare(aCategory);
        default:
          return 0;
      }
    });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const { data: pointsData, isLoading, error } = useRealTimeHeartbits();
  const currentBalance = pointsData?.data?.currentBalance ?? 0;

  const transformCurrentBalance = (currentBalance) => {
    if (currentBalance == null || isNaN(currentBalance)) return "0.00";

    const num = Number(currentBalance);

    if (num >= 1_000_000)
      return (
        (num / 1_000_000)
          .toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })
          .replace(/\.0$/, "") + "M"
      );

    if (num >= 1_000)
      return (
        (num / 1_000)
          .toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })
          .replace(/\.0$/, "") + "K"
      );

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  //
  return (
    <div className="suitebite-shop-container h-full flex flex-col ">
      {/* Navigation Tabs - Minimal */}

      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <nav className="flex gap-6 items-center">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "products"
                  ? "text-[#0097b2]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShoppingBagIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
              {activeTab === "products" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0097b2]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "cart"
                  ? "text-[#0097b2]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cart.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {cart.length}
                </span>
              )}
              {activeTab === "cart" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0097b2]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "orders"
                  ? "text-[#0097b2]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ClipboardDocumentListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
              {activeTab === "orders" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0097b2]" />
              )}
            </button>

            <div className="flex items-center ml-auto">
              {(activeTab === "products" || activeTab === "cart") && (
                <div
                  className="flex items-center gap-2 px-2 py-4 sm:px-4 sm:py-0 rounded-xl 
                            bg-gradient-to-r from-red-100 to-red-200 
                            border border-red-300 text-red-800 font-semibold 
                            sm:text-xs sm:text-base shadow-sm hover:shadow-md 
                            transition-all duration-300 ease-in-out sm:h-10 sm:w-[100%] h-2"
                >
                  <div className=" inline text-sm">Heartbits</div>

                  <span className="tracking-wide drop-shadow-sm text-sm">
                    {transformCurrentBalance(currentBalance)}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse"
                  >
                    <path
                      d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 
                            25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 
                            8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 
                            5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 
                            2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 
                            9.256a25.175 25.175 0 0 1-4.244 
                            3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 
                            0 0 1-.704 0l-.003-.001Z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide mb-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-white">
          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="products-tab space-y-6">
              {/* Compact Search & Filter Bar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {/* Search - Always Visible */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent outline-none text-sm"
                  />
                </div>

                {/* Expandable Filters */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isExpanded ? "max-h-96 mt-4" : "max-h-0"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent outline-none text-sm"
                      >
                        <option value="all">All</option>
                        {getCategories().map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Price Range
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={priceRange.min || ""}
                          onChange={(e) =>
                            setPriceRange({
                              ...priceRange,
                              min: Number(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent outline-none text-sm"
                          placeholder="Min"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="number"
                          min="1"
                          max="100000"
                          value={priceRange.max || ""}
                          onChange={(e) =>
                            setPriceRange({
                              ...priceRange,
                              max: Number(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent outline-none text-sm"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Sort By
                      </label>
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent outline-none text-sm"
                      >
                        <option value="name-asc">Name: A-Z</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="category-asc">Category: A-Z</option>
                      </select>
                    </div>
                  </div>

                  {/* Reset Button */}
                  {isAnyFilterActive && (
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mt-3 py-2 text-sm font-medium text-[#0097b2] hover:text-[#007a8f] transition-colors flex items-center justify-center gap-1"
                >
                  {isExpanded ? "Less Filters" : "More Filters"}
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Products Grid */}
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <Loading />
                  </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-sm text-gray-600">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3  xl:grid-cols-5  gap-4">
                    {filteredAndSortedProducts.map((product) => {
                      const productWithImages = {
                        ...product,
                        images:
                          Array.isArray(product.product_images) &&
                          product.product_images.length > 0
                            ? product.product_images
                            : Array.isArray(product.images) &&
                              product.images.length > 0
                            ? product.images
                            : product.image_url
                            ? [
                                {
                                  image_url: product.image_url,
                                  alt_text: product.name,
                                },
                              ]
                            : [],
                        product_images: Array.isArray(product.product_images)
                          ? product.product_images
                          : [],
                      };
                      return (
                        <ProductCard
                          key={product.product_id}
                          product={productWithImages}
                          onAddToCart={() => {
                            setModalProduct(productWithImages);
                            setIsModalOpen(true);
                            setModalMode("add-to-cart");
                            setModalInitialQuantity(1);
                            setModalInitialSelectedOptions({});
                          }}
                          onBuyNow={() => {
                            setModalProduct(productWithImages);
                            setIsModalOpen(true);
                            setModalMode("buy-now");
                            setModalInitialQuantity(1);
                            setModalInitialSelectedOptions({});
                          }}
                          userHeartbits={userHeartbits}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === "cart" && (
            <div className="cart-tab">
              <ShoppingCart
                cart={cart}
                userHeartbits={userHeartbits}
                onCheckout={handleCheckout}
                onClose={() => setActiveTab("products")}
                onUpdateCart={loadShopData}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onAddToCart={handleAddToCart}
                isVisible={true}
                variationOptions={variationOptions}
                variationTypes={variationTypes}
              />
            </div>
          )}

          {/* Order History Tab */}
          {activeTab === "orders" && (
            <div className="orders-tab">
              <OrderHistory
                onCartUpdate={loadShopData}
                onHeartbitsUpdate={loadShopData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {isModalOpen && modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={handleAddToCart}
          onBuyNow={async (productId, quantity, variationId, variations) => {
            try {
              const orderData = {
                items: [
                  {
                    product_id: productId,
                    quantity: quantity,
                    ...(variationId && {
                      variation_id: variationId,
                    }),
                    ...(variations &&
                      variations.length > 0 && {
                        variations: variations,
                      }),
                  },
                ],
              };

              const response = await suitebiteAPI.checkout(orderData);

              if (response.success) {
                toast.success("Success", "Order placed successfully!");
                setIsModalOpen(false);
                await updateHeartbitsOnly();
              } else {
                toast.error(
                  "Error",
                  response.message || "Failed to place order"
                );
              }
            } catch (error) {
              console.error("Error with buy now:", error);
              toast.error("Error", "Buy now failed. Please try again.");
            }
          }}
          userHeartbits={userHeartbits}
          mode={modalMode}
          initialQuantity={modalInitialQuantity}
          initialSelectedOptions={modalInitialSelectedOptions}
        />
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-top ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default SuitebiteShop;
