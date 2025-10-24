import { useState, useEffect } from "react";
import { suitebiteAPI } from "../../utils/suitebiteAPI";
import {
  XMarkIcon,
  TrashIcon,
  CheckIcon,
  HeartIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import useIsMobile from "../../utils/useIsMobile";
import ProductDetailModal from "./ProductDetailModal";

/**
 * ShoppingCart Component - Enhanced with Real-Time Updates
 *
 * Advanced shopping cart with real-time heartbit updates and improved UX.
 * Features include:
 * - Real-time heartbits balance updates
 * - Optimistic UI updates for better performance
 * - Loading states and error handling
 * - Enhanced item selection and checkout flow
 * - Better visual feedback and animations
 * - Improved quantity management
 * - Integrated design for better UX
 */
const ShoppingCart = ({
  cart,
  userHeartbits,
  onCheckout,
  onClose,
  onUpdateCart,
  onUpdateQuantity,
  onRemoveItem,
  onAddToCart,
  isVisible = false,
  variationOptions = [],
  variationTypes = [],
}) => {
  // Mobile detection
  const isMobile = useIsMobile();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [itemLoadingStates, setItemLoadingStates] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [realTimeHeartbits, setRealTimeHeartbits] = useState(userHeartbits);
  const [cartItemToEdit, setCartItemToEdit] = useState(null);
  const [productModalData, setProductModalData] = useState(null);
  const [modalInitialOptions, setModalInitialOptions] = useState({});
  const [modalInitialQuantity, setModalInitialQuantity] = useState(1);

  // Inline editing state
  const [inlineEditingItem, setInlineEditingItem] = useState(null);
  const [inlineEditData, setInlineEditData] = useState({
    selectedOptions: {},
    availableVariations: [],
    variationTypes: [],
  });

  // Clear cart confirmation modal state
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

  // Filter out duplicate cart items by cart_item_id - MOVED UP to avoid circular dependency
  const uniqueCart = [];
  const seenIds = new Set();
  for (const item of cart) {
    if (!seenIds.has(item.cart_item_id)) {
      uniqueCart.push(item);
      seenIds.add(item.cart_item_id);
    } else {
      // Log duplicate for debugging
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          "Duplicate cart_item_id in cart:",
          item.cart_item_id,
          item
        );
      }
    }
  }

  // Update real-time heartbits when prop changes
  useEffect(() => {
    setRealTimeHeartbits(userHeartbits);
  }, [userHeartbits]);

  // Clean up inline editing when cart is closed or cart changes
  useEffect(() => {
    if (!isVisible) {
      cancelInlineEdit();
    }
  }, [isVisible]);

  // Cancel inline editing if the item being edited is no longer in the cart
  useEffect(() => {
    if (
      inlineEditingItem &&
      !uniqueCart.find((item) => item.cart_item_id === inlineEditingItem)
    ) {
      cancelInlineEdit();
    }
  }, [uniqueCart, inlineEditingItem]);

  // Only auto-select all items if cart is non-empty and nothing is selected yet (and not on every cart change)
  useEffect(() => {
    if (cart.length > 0 && selectedItems.size === 0) {
      setSelectedItems(new Set(cart.map((item) => item.cart_item_id)));
    }
    if (cart.length === 0 && selectedItems.size > 0) {
      setSelectedItems(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  const total = uniqueCart.reduce(
    (sum, item) =>
      sum +
      (item.price_points || item.points_cost || item.price) * item.quantity,
    0
  );
  const itemCount = uniqueCart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate selected items totals
  const selectedItemsTotal = uniqueCart.reduce((sum, item) => {
    if (selectedItems.has(item.cart_item_id)) {
      return (
        sum +
        (item.price_points || item.points_cost || item.price) * item.quantity
      );
    }
    return sum;
  }, 0);

  const selectedItemsCount = uniqueCart.reduce((sum, item) => {
    if (selectedItems.has(item.cart_item_id)) {
      return sum + item.quantity;
    }
    return sum;
  }, 0);

  const canCheckout = () => {
    return selectedItems.size > 0 && realTimeHeartbits >= selectedItemsTotal;
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      3000
    );
  };

  const setItemLoadingState = (itemId, state) => {
    setItemLoadingStates((prev) => ({ ...prev, [itemId]: state }));
  };

  const handleSelectAll = () => {
    if (selectedItems.size === uniqueCart.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(uniqueCart.map((item) => item.cart_item_id)));
    }
  };

  const handleClearAll = () => {
    setSelectedItems(new Set());
  };

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // const handleCheckout = async () => {
  //   if (!canCheckout() || isCheckingOut) return;

  //   try {
  //     setIsCheckingOut(true);

  //     // Update real-time heartbits optimistically
  //     setRealTimeHeartbits((prev) => Math.max(0, prev - selectedItemsTotal));

  //     // Filter cart to only selected items
  //     const selectedCartItems = uniqueCart.filter((item) =>
  //       selectedItems.has(item.cart_item_id)
  //     );
  //     await onCheckout(selectedCartItems);

  //     // Clear selected items after successful checkout
  //     setSelectedItems(new Set());
  //     showNotification(
  //       "success",
  //       "Order placed successfully! Awaiting admin approval. 🎉"
  //     );
  //   } catch (error) {
  //     // Revert optimistic update on error
  //     setRealTimeHeartbits(userHeartbits);
  //     showNotification("error", "Checkout failed. Please try again.");
  //   } finally {
  //     setIsCheckingOut(false);
  //   }
  // };
  const handleCheckout = async () => {
    if (!canCheckout() || isCheckingOut) return;

    try {
      setIsCheckingOut(true);

      // Optimistic heartbits update
      setRealTimeHeartbits((prev) => Math.max(0, prev - selectedItemsTotal));

      const selectedCartItems = uniqueCart.filter((item) =>
        selectedItems.has(item.cart_item_id)
      );

      await onCheckout(selectedCartItems);

      setSelectedItems(new Set());

      toast.success("Order placed successfully! Awaiting admin approval 🎉", {
        // style: {
        //   fontSize: "0.875rem", // text-sm
        //   padding: "0.75rem 1rem", // tighter spacing
        //   maxWidth: "90vw",
        // },
      });
    } catch (error) {
      setRealTimeHeartbits(userHeartbits);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const currentItem = uniqueCart.find((item) => item.cart_item_id === itemId);
    if (!currentItem) return;

    try {
      setItemLoadingState(itemId, "updating");

      const response = await suitebiteAPI.updateCartItem(itemId, {
        quantity: newQuantity,
      });

      if (response.success) {
        onUpdateCart();
        showNotification("success", "Quantity updated");
      } else {
        showNotification("error", "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      showNotification("error", "Failed to update quantity");
    } finally {
      setItemLoadingState(itemId, null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setItemLoadingState(itemId, "removing");

      // Cancel inline editing if this item is being edited
      if (inlineEditingItem === itemId) {
        cancelInlineEdit();
      }

      // Remove from selected items optimistically
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);

      const response = await suitebiteAPI.removeFromCart(itemId);

      if (response.success) {
        onUpdateCart();
        showNotification("success", "Item removed from cart");
      } else {
        showNotification("error", "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      showNotification("error", "Failed to remove item");
    } finally {
      setItemLoadingState(itemId, null);
    }
  };

  const handleClearCart = () => {
    setShowClearCartConfirm(true);
  };

  const confirmClearCart = async () => {
    try {
      setIsUpdating(true);
      const response = await suitebiteAPI.clearCart();
      if (response.success) {
        onUpdateCart();
        setSelectedItems(new Set());
        showNotification("success", "Cart cleared");
      } else {
        showNotification("error", "Failed to clear cart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      showNotification("error", "Failed to clear cart");
    } finally {
      setIsUpdating(false);
      setShowClearCartConfirm(false);
    }
  };

  // Open product detail modal to edit a cart item
  // Inline editing functions
  const startInlineEdit = async (item) => {
    try {
      setItemLoadingState(item.cart_item_id, "loading");

      const [prodRes, varRes] = await Promise.all([
        suitebiteAPI.getProductById(item.product_id),
        suitebiteAPI.getProductVariations(item.product_id),
      ]);

      if (prodRes.success && varRes.success) {
        // Build current selected options from cart item variations
        let currentOptions = {};
        if (item.variations && Array.isArray(item.variations)) {
          item.variations.forEach((variation) => {
            if (variation.type_name && variation.option_id) {
              currentOptions[variation.type_name] = variation.option_id;
            }
          });
        }

        // Extract variation types
        const types = new Set();
        varRes.variations.forEach((variation) => {
          variation.options?.forEach((option) => {
            types.add(option.type_name);
          });
        });

        setInlineEditData({
          selectedOptions: currentOptions,
          availableVariations: varRes.variations,
          variationTypes: Array.from(types),
        });

        setInlineEditingItem(item.cart_item_id);
      }
    } catch (error) {
      console.error("Error starting inline edit:", error);
      showNotification("error", "Failed to load product variations");
    } finally {
      setItemLoadingState(item.cart_item_id, null);
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditingItem(null);
    setInlineEditData({
      selectedOptions: {},
      availableVariations: [],
      variationTypes: [],
    });
  };

  const saveInlineEdit = async (item) => {
    try {
      setItemLoadingState(item.cart_item_id, "updating");

      // Convert selected options to variations array format
      const variationsArray = [];
      Object.entries(inlineEditData.selectedOptions).forEach(
        ([typeName, optionId]) => {
          // Find the variation type id from available variations
          let variationTypeId = null;
          for (const variation of inlineEditData.availableVariations) {
            const option = variation.options?.find(
              (opt) => opt.type_name === typeName && opt.option_id === optionId
            );
            if (option) {
              variationTypeId = option.variation_type_id;
              break;
            }
          }

          if (variationTypeId) {
            variationsArray.push({
              variation_type_id: variationTypeId,
              option_id: optionId,
            });
          }
        }
      );

      const updateData = {
        quantity: item.quantity,
        variations: variationsArray,
      };

      const res = await suitebiteAPI.updateCartItem(
        item.cart_item_id,
        updateData
      );
      if (res.success) {
        onUpdateCart();
        showNotification("success", "Variations updated successfully");
        cancelInlineEdit();
      } else {
        showNotification("error", "Failed to update variations");
      }
    } catch (error) {
      console.error("Error saving inline edit:", error);
      showNotification("error", "Failed to update variations");
    } finally {
      setItemLoadingState(item.cart_item_id, null);
    }
  };

  const handleInlineOptionChange = (typeName, optionId) => {
    setInlineEditData((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [typeName]: optionId,
      },
    }));
  };

  const getAvailableOptionsForType = (typeName) => {
    const options = new Set();
    inlineEditData.availableVariations.forEach((variation) => {
      variation.options?.forEach((option) => {
        if (option.type_name === typeName) {
          options.add(
            JSON.stringify({
              id: option.option_id,
              value: option.option_value,
              label: option.option_label,
            })
          );
        }
      });
    });

    return Array.from(options).map((optStr) => JSON.parse(optStr));
  };

  // Enhanced function to handle both adding new items and updating existing ones
  const handleSaveCartEdit = async (
    productId,
    quantity,
    variationId,
    variations = []
  ) => {
    try {
      console.log("🛒 ShoppingCart - handleSaveCartEdit called with:", {
        productId,
        quantity,
        variationId,
        variations,
        cartItemToEdit: cartItemToEdit?.cart_item_id,
        isAddingNew: !cartItemToEdit,
        hasExternalOnAddToCart: !!onAddToCart,
      });

      // Case 1: Adding a new item to cart (no cartItemToEdit)
      if (!cartItemToEdit) {
        // If we have an external onAddToCart function, use it instead of internal logic
        if (onAddToCart) {
          console.log("🔄 Using external onAddToCart function");
          await onAddToCart({
            product_id: productId,
            quantity,
            variation_id: variationId,
            variations,
          });
          // Clear modal states after external function handles the addition
          setCartItemToEdit(null);
          setProductModalData(null);
          setModalInitialOptions({});
          setModalInitialQuantity(1);
          return;
        }
        // Fallback to internal logic if no external function
        const cartData = {
          product_id: productId,
          quantity,
          variations,
          variation_id: variationId, // Legacy support
        };
        console.log("🆕 Adding new item to cart (internal):", cartData);
        const response = await suitebiteAPI.addToCart(cartData);
        if (response.success) {
          onUpdateCart();
          showNotification("success", "Item added to cart! 🛒");
        } else {
          showNotification("error", "Failed to add item to cart");
        }
        return;
      }

      // Case 2: Updating existing cart item
      const updateData = { quantity };

      // If variations are provided (new format), use them
      if (variations && variations.length > 0) {
        updateData.variations = variations;
      }
      // Legacy support: convert variationId to new format if provided
      else if (variationId && productModalData.variations) {
        const variation = productModalData.variations.find(
          (v) => v.variation_id === variationId
        );
        if (variation && variation.options) {
          updateData.variations = variation.options.map((option) => ({
            variation_type_id: option.variation_type_id,
            option_id: option.option_id,
          }));
        }
      }

      console.log("✏️ Updating existing cart item:", {
        cartItemId: cartItemToEdit.cart_item_id,
        updateData,
      });

      const res = await suitebiteAPI.updateCartItem(
        cartItemToEdit.cart_item_id,
        updateData
      );
      if (res.success) {
        onUpdateCart();
        showNotification("success", "Cart item updated successfully");
      } else {
        showNotification("error", "Failed to update cart item");
      }
    } catch (err) {
      console.error("Error in handleSaveCartEdit:", err);
      const action = cartItemToEdit ? "update" : "add";
      showNotification("error", `Failed to ${action} cart item`);
    } finally {
      // Always clear modal states when the function completes
      setCartItemToEdit(null);
      setProductModalData(null);
      setModalInitialOptions({});
      setModalInitialQuantity(1);
    }
  };

  // Helper to format labels
  const formatLabel = (label) => {
    if (typeof label !== "string") return String(label ?? "");
    return label
      .replace(/_/g, " ")
      .replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      );
  };

  // Helper to get label by id, with fallback
  const getOptionLabel = (optionId, fallbackLabel) => {
    const found = variationOptions.find((opt) => opt.option_id === optionId);
    if (found && found.option_label) return formatLabel(found.option_label);
    if (fallbackLabel) return formatLabel(fallbackLabel);
    return formatLabel(optionId);
  };
  const getTypeLabel = (typeId) => {
    const found = variationTypes.find((type) => type.type_id === typeId);
    return found ? formatLabel(found.type_label) : formatLabel(typeId);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="shopping-cart-container bg-white h-full flex flex-col">
        {/* Cart Header */}
        <div className="cart-header flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#0097b2] hidden sm:flex" />
            <span className="font-bold text-lg sm:text-xl text-gray-900 ">
              Shopping Cart
            </span>
            <span className="ml-1 sm:ml-2 text-sm sm:text-base font-medium text-gray-500">
              ({itemCount} items)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="cart-content flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin">
          {uniqueCart.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ShoppingBagIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Add some items to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Selection Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === uniqueCart.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#0097b2] focus:ring-[#0097b2]"
                  />
                  <span className="text-sm sm:text-base font-medium text-gray-700">
                    Select All ({uniqueCart.length})
                  </span>
                </div>
                <button
                  onClick={handleClearAll}
                  className="text-sm sm:text-base text-gray-500 hover:text-gray-700 self-start sm:self-auto"
                >
                  Clear All
                </button>
              </div>

              {/* Cart Items */}
              {uniqueCart.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="cart-item bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Selection + Image */}
                    <div className="flex items-start gap-3 w-full sm:w-auto">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.cart_item_id)}
                        onChange={() => handleItemSelect(item.cart_item_id)}
                        className="mt-1 rounded border-gray-300 text-[#0097b2] focus:ring-[#0097b2]"
                      />

                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                        {(() => {
                          let imageUrl = null;

                          if (item.product_images?.length > 0) {
                            const primaryImage =
                              item.product_images.find(
                                (img) => img.is_primary
                              ) || item.product_images[0];
                            imageUrl =
                              primaryImage.thumbnail_url ||
                              primaryImage.image_url;
                          } else if (item.images?.length > 0) {
                            const primaryImage =
                              item.images.find((img) => img.is_primary) ||
                              item.images[0];
                            imageUrl =
                              primaryImage.thumbnail_url ||
                              primaryImage.image_url ||
                              primaryImage.url;
                          } else if (item.image_url) {
                            imageUrl = item.image_url;
                          }

                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product_name}
                              className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                            />
                          ) : (
                            <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                          );
                        })()}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 w-full space-y-2">
                      {/* Product Name */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                          {item.product_name}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          disabled={
                            itemLoadingStates[item.cart_item_id] === "removing"
                          }
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                          title="Remove item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Price + Quantity */}
                      <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                        <span className="font-medium text-[#0097b2]">
                          {item.price_points || item.points_cost || item.price}{" "}
                          pts each
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.cart_item_id,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              itemLoadingStates[item.cart_item_id] ===
                              "updating"
                            }
                            className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center font-bold hover:bg-gray-200 transition disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.cart_item_id,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              itemLoadingStates[item.cart_item_id] ===
                              "updating"
                            }
                            className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center font-bold hover:bg-gray-200 transition disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Variations */}
                      <div className="flex flex-wrap gap-2">
                        {item.variations?.length > 0 ? (
                          item.variations.map((v, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                            >
                              {v.type_name ? `${v.type_name}: ` : ""}
                              {v.option_label || v.option_value}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-200">
                            Standard
                          </span>
                        )}
                      </div>

                      {/* Subtotal */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                        <span className="flex items-center gap-1 text-gray-600 text-sm">
                          <HeartIcon className="h-4 w-4 text-red-500" />
                          <span>
                            Subtotal:{" "}
                            <span className="font-semibold text-[#0097b2]">
                              {(item.price_points ||
                                item.points_cost ||
                                item.price) * item.quantity}{" "}
                              heartbits
                            </span>
                          </span>
                        </span>

                        {itemLoadingStates[item.cart_item_id] && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#0097b2]"></div>
                            {itemLoadingStates[item.cart_item_id] === "updating"
                              ? "Updating..."
                              : "Updated"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {uniqueCart.length > 0 && (
          <div className="cart-footer border-t border-gray-200 p-3 sm:p-4 pb-6 sm:pb-8 mb-10">
            {/* Selected Items Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  {selectedItemsCount} item{selectedItemsCount !== 1 ? "s" : ""}{" "}
                  selected
                </span>
              </div>
              <span className="text-sm sm:text-base text-gray-500">
                Total: {selectedItemsTotal} heartbits
              </span>
            </div>

            {/* Heartbits Balance */}
            {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <HeartIcon className="h-4 w-4 text-red-500" />
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  Your Balance:
                </span>
              </div>
              <span
                className={`text-sm sm:text-base font-semibold ${
                  realTimeHeartbits >= selectedItemsTotal
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {realTimeHeartbits} heartbits
              </span>
            </div> */}

            {/* Affordability Indicator */}
            {realTimeHeartbits < selectedItemsTotal && (
              <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <span className="text-sm sm:text-base font-medium">
                    Insufficient Balance
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-red-600 mt-1">
                  You need {selectedItemsTotal - realTimeHeartbits} more
                  heartbits to complete this purchase.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="fixed bottom-0 left-0 w-full bg-white px-10 py-3 shadow-md z-50 lg:px-0 lg:py-3  lg:bottom-10 lg:left-65 lg:w-[40%] lg:bg-transparent lg:shadow-none xl:w-[55%] xl:left-70 2xl:static 2xl:left-0 2xl:w-full">
              <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleClearCart}
                  disabled={isUpdating}
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:mb-5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {isUpdating ? "Clearing..." : "Clear Cart"}
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout() || isCheckingOut}
                  // className="w-full sm:flex-1 px-3 sm:px-4 py-2 mb-5 bg-[#0097b2] text-white rounded-lg hover:bg-[#007a8e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-[#0097b2] text-white rounded-lg hover:bg-[#007a8e] transition"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Checkout ({selectedItemsCount})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        )}
      </div>
      {/* Modal should only render when we don't have an external onAddToCart handler */}
      {!onAddToCart &&
        (cartItemToEdit || productModalData) &&
        productModalData && (
          <ProductDetailModal
            product={productModalData}
            isOpen={true}
            onClose={() => {
              setCartItemToEdit(null);
              setProductModalData(null);
            }}
            onAddToCart={handleSaveCartEdit}
            userHeartbits={realTimeHeartbits}
            initialQuantity={modalInitialQuantity}
            initialSelectedOptions={modalInitialOptions}
            mode={cartItemToEdit ? "edit" : "add-to-cart"}
          />
        )}

      {/* Clear Cart Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearCartConfirm}
        onClose={() => setShowClearCartConfirm(false)}
        onConfirm={confirmClearCart}
        title="Clear Cart"
        message="Are you sure you want to clear your entire cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Cancel"
        confirmColor="red"
      />
    </>
  );
};

// ConfirmationModal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = "red",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                confirmColor === "red"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
