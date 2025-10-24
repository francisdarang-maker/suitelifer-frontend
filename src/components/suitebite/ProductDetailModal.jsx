import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  HeartIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import useCategoryStore from "../../store/stores/categoryStore";
import ProductImageCarousel from "./ProductImageCarousel";
import { toast } from "react-hot-toast";
/**
 * ProductDetailModal Component - Enhanced Product Detail View
 *
 * Shows detailed product information with variation selection, quantity, and purchase options.
 * Features include:
 * - Large product image display
 * - Detailed product information
 * - Variation selection (size, color, etc.)
 * - Quantity selection with price calculation
 * - Add to cart and buy now functionality
 * - Responsive design
 *
 * @param {Object} product - Product data object with variations
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onAddToCart - Callback when product is added to cart
 * @param {Function} onBuyNow - Callback when buy now is triggered
 * @param {number} userHeartbits - User's current heartbits balance
 * @param {string} mode - Modal mode: 'buy-now' or 'add-to-cart'
 * @param {number} initialQuantity - Initial quantity (default: 1)
 * @param {Object} initialSelectedOptions - Initial selected options
 */
const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  userHeartbits,
  mode = "buy-now",
  initialQuantity = 1,
  initialSelectedOptions,
}) => {
  // Local state for cart interaction
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity);

  // Variation selection state
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState(
    initialSelectedOptions || {}
  );
  const [availableVariations, setAvailableVariations] = useState([]);
  const [variationTypes, setVariationTypes] = useState([]);

  // Add state for in-modal error message
  const [modalError, setModalError] = useState("");
  // Ref for focus trap
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);

  // Get category color information from store
  const { getCategoryColor, getCategoryBgColor } = useCategoryStore();

  // Load product variations when component mounts
  useEffect(() => {
    if (product.variations && product.variations.length > 0) {
      setAvailableVariations(product.variations);

      // Extract unique variation types from the product's variations
      const types = new Set();
      product.variations.forEach((variation) => {
        variation.options?.forEach((option) => {
          types.add(option.type_name);
        });
      });
      setVariationTypes(Array.from(types));
    }
  }, [product]);

  // Update quantity when initialQuantity prop changes (but not when quantity changes locally)
  useEffect(() => {
    setQuantity(initialQuantity || 1);
  }, [initialQuantity]);

  // Update selected options when initialSelectedOptions prop changes
  useEffect(() => {
    if (initialSelectedOptions) {
      setSelectedOptions(initialSelectedOptions);
    }
  }, [initialSelectedOptions]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 1);
      setSelectedOptions(initialSelectedOptions || {});
      setIsAddingToCart(false);
      setIsBuying(false);
      setModalError(""); // Clear error on modal open
    }
  }, [isOpen, initialQuantity, initialSelectedOptions, mode]);

  // Update selected variation when options change
  useEffect(() => {
    if (
      availableVariations.length > 0 &&
      Object.keys(selectedOptions).length > 0
    ) {
      const matchingVariation = availableVariations.find((variation) => {
        return variation.options?.every(
          (option) => selectedOptions[option.type_name] === option.option_id
        );
      });
      setSelectedVariation(matchingVariation || null);
    }
  }, [selectedOptions, availableVariations]);

  // Focus trap and ESC to close
  useEffect(() => {
    if (isOpen) {
      // Focus the first button (e.g., first option or close button)
      setTimeout(() => {
        if (firstButtonRef.current) {
          firstButtonRef.current.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);
      // Add keydown listener for ESC and tab trap
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
        }
        // Focus trap
        if (e.key === "Tab" && modalRef.current) {
          const focusableEls = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstEl = focusableEls[0];
          const lastEl = focusableEls[focusableEls.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  /**
   * Handles variation option selection
   */
  const handleOptionSelect = (typeName, optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [typeName]: optionId,
    }));

    console.log("Option Id", optionId);
    console.log("Type Name", typeName);
  };

  /**
   * Gets available options for a specific variation type
   */
  const getAvailableOptions = (typeName) => {
    const options = new Set();
    availableVariations.forEach((variation) => {
      variation.options?.forEach((option) => {
        if (option.type_name === typeName) {
          options.add(
            JSON.stringify({
              id: option.option_id,
              value: option.option_value,
              label: option.option_label,
              hexColor: option.hex_color,
            })
          );
        }
      });
    });
    return Array.from(options).map((opt) => JSON.parse(opt));
  };

  /**
   * Calculates the final price including variation adjustments
   */
  const getFinalPrice = () => {
    const basePrice = product.price_points || product.price || 0;
    const adjustment = selectedVariation?.price_adjustment || 0;
    return basePrice + adjustment;
  };

  /**
   * Handles confirming the order with selected quantity and variation
   */
  // const handleAddToCartFromModal = async () => {
  //   if (isAddingToCart) return;
  //   setModalError("");
  //   // Ensure variation selection if required
  //   if (availableVariations.length > 0 && variationTypes.length > 0) {
  //     const allTypesSelected = variationTypes.every(
  //       (type) => selectedOptions[type]
  //     );
  //     if (!allTypesSelected) {
  //       setModalError(
  //         "Please select all product options before adding to cart."
  //       );
  //       return;
  //     }
  //   }

  //   try {
  //     setIsAddingToCart(true);

  //     // Prepare variation data in the new format
  //     const variations = Object.entries(selectedOptions)
  //       .map(([typeName, optionId]) => {
  //         const option = availableVariations
  //           .flatMap((v) => v.options || [])
  //           .find(
  //             (opt) => opt.option_id === optionId && opt.type_name === typeName
  //           );

  //         const variation = {
  //           variation_type_id: option?.variation_type_id,
  //           option_id: optionId,
  //         };

  //         return variation;
  //       })
  //       .filter((v) => v.variation_type_id && v.option_id);

  //     await onAddToCart(product.product_id, quantity, null, variations);
  //     onClose(); // Close modal after adding to cart
  //   } catch (error) {
  //     setModalError("Failed to add to cart.");
  //   } finally {
  //     setIsAddingToCart(false);
  //   }
  // };
  const handleAddToCartFromModal = async () => {
    if (isAddingToCart) return;

    // Clear any previous error
    setModalError("");

    // Ensure variation selection if required
    if (availableVariations.length > 0 && variationTypes.length > 0) {
      const allTypesSelected = variationTypes.every(
        (type) => selectedOptions[type]
      );
      if (!allTypesSelected) {
        toast.error(
          "Please select all product options before adding to cart.",
          {
            position: "top-center",
            style: {
              fontSize: "0.875rem",
              padding: "0.75rem 1rem",
              maxWidth: "90vw",
            },
          }
        );
        return;
      }
    }

    try {
      setIsAddingToCart(true);

      const variations = Object.entries(selectedOptions)
        .map(([typeName, optionId]) => {
          const option = availableVariations
            .flatMap((v) => v.options || [])
            .find(
              (opt) => opt.option_id === optionId && opt.type_name === typeName
            );

          return {
            variation_type_id: option?.variation_type_id,
            option_id: optionId,
          };
        })
        .filter((v) => v.variation_type_id && v.option_id);

      await onAddToCart(product.product_id, quantity, null, variations);
      onClose(); // Close modal after adding to cart
    } catch (error) {
      toast.error("Failed to add to cart.", {
        position: "top-center",
        style: {
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
          maxWidth: "90vw",
        },
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  /**
   * Handles direct purchase (buy now) from modal
   */
  const handleBuyNowFromModal = async () => {
    if (isBuying) return;
    setModalError("");
    // Ensure variation selection if required
    if (availableVariations.length > 0 && variationTypes.length > 0) {
      const allTypesSelected = variationTypes.every(
        (type) => selectedOptions[type]
      );
      if (!allTypesSelected) {
        setModalError(
          "Please select all product options before confirming order."
        );
        return;
      }
    }

    try {
      setIsBuying(true);

      // Prepare variation data in the new format
      const variations = Object.entries(selectedOptions)
        .map(([typeName, optionId]) => {
          const option = availableVariations
            .flatMap((v) => v.options || [])
            .find(
              (opt) => opt.option_id === optionId && opt.type_name === typeName
            );

          return {
            variation_type_id: option?.variation_type_id,
            option_id: optionId,
          };
        })
        .filter((v) => v.variation_type_id && v.option_id);

      await onBuyNow(product.product_id, quantity, null, variations);
      onClose(); // Close modal after purchase
    } catch (error) {
      setModalError("Failed to process buy now.");
    } finally {
      setIsBuying(false);
    }
  };

  // Remove all price adjustment and is_active logic
  // Always use product.price_points or product.price for price display and calculations
  // Remove any strikethrough or price adjustment UI
  // Remove any checks or disables based on isActive

  // Calculate product affordability
  const finalPrice = product.price_points || product.price || 0;
  const totalCost = finalPrice * quantity;
  const canAfford = userHeartbits >= totalCost;

  // Get category colors
  const categoryColor = getCategoryColor(product.category);
  const categoryBgColor = getCategoryBgColor(product.category);

  // Helper to format labels
  const formatLabel = (label) =>
    label
      ? label
          .replace(/_/g, " ")
          .replace(
            /\w\S*/g,
            (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          )
      : "";

  if (!isOpen) return null;

  return (
    <div
  className="fixed inset-0 bg-black/40 backdrop-blur z-50 flex items-center justify-center p-2 sm:p-4"
  role="dialog"
  aria-modal="true"
>
  <div
    className="bg-white rounded-xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto outline-none"
    ref={modalRef}
    tabIndex={-1}
  >
    {/* Header */}
    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Product Details</h2>
        {mode === "edit" && (
          <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
            Editing Cart Item
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        ref={firstButtonRef}
        aria-label="Close modal"
      >
        <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
      </button>
    </div>

    {/* Content */}
    <div className="p-4 sm:p-6">
      {modalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300" role="alert">
          {modalError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Image Section */}
        <div className="product-image-section">
          <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
            {(() => {
              const imagesToPass =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images
                  : Array.isArray(product.product_images) && product.product_images.length > 0
                  ? product.product_images
                  : product.image_url
                  ? [{ image_url: product.image_url, alt_text: product.name }]
                  : [];
              return (
                <ProductImageCarousel
                  images={imagesToPass}
                  productName={product.name}
                  className="w-full h-full"
                />
              );
            })()}

            {product.category && (
              <div className="absolute top-3 left-3 z-10">
                <span
                  className="px-2 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-white border-opacity-20"
                  style={{
                    backgroundColor: categoryColor,
                    color: "white",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {product.category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="product-info-section">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {product.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
            {product.description || "Premium quality product curated for your needs."}
          </p>

          {/* Price */}
          <div className="mb-4 sm:mb-6">
            <span className="text-2xl sm:text-4xl font-bold text-[#0097b2] flex items-center gap-2">
              {finalPrice}
              <HeartIcon className="h-5 w-5 sm:h-8 sm:w-8 text-red-500" />
            </span>
          </div>

          {/* Quantity */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity:
            </label>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold hover:bg-gray-300 transition-colors"
              >
                -
              </button>
              <span className="text-lg sm:text-2xl font-semibold text-gray-900 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-lg text-gray-600">Total for {quantity}:</span>
              <span className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                {totalCost}
                <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </span>
            </div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              Your balance: {userHeartbits} heartbits
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={handleBuyNowFromModal}
              disabled={!canAfford || isBuying || isAddingToCart}
              className="w-full bg-[#0097b2] text-white py-3 sm:py-4 px-4 rounded-lg font-semibold hover:bg-[#007a8e] transition-all flex items-center justify-center gap-2 text-sm sm:text-lg disabled:opacity-50"
            >
              {isBuying ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : !canAfford ? (
                <>
                  <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Need {totalCost - userHeartbits} more</span>
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Confirm Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default ProductDetailModal;
