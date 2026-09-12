import React from "react";
import { FaShoppingCart, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

export default function PriceSummary({
    basePrice = 0,
    unitPrice = 0,
    quantity = 1,
    totalPrice = 0,
    onAddToCart,
    isSubmitting = false,
    validationError = null,
    addedSuccess = false,
    onViewCart,
    onContinueShopping
}) {
    return (
        <div className="customization-bottom-bar">
            {/* Validation Error Banner */}
            {validationError && (
                <div className="customization-error-banner">
                    <FaExclamationTriangle className="error-icon" />
                    <span>{validationError}</span>
                </div>
            )}

            {/* Success Overlay / Confirmation Banner */}
            {addedSuccess && (
                <div className="customization-success-banner">
                    <div className="success-text">
                        <FaCheckCircle className="success-icon" />
                        <div>
                            <strong>Added to Cart!</strong>
                            <small>Your customized food is ready in your cart.</small>
                        </div>
                    </div>

                    <div className="success-actions">
                        <button
                            type="button"
                            className="btn-continue-shopping"
                            onClick={onContinueShopping}
                        >
                            Browse More
                        </button>
                        <button
                            type="button"
                            className="btn-view-cart-primary"
                            onClick={onViewCart}
                        >
                            View Cart →
                        </button>
                    </div>
                </div>
            )}

            {/* Price & Action Row */}
            <div className="summary-action-flex">
                <div className="total-price-block">
                    <span className="price-tag-label">
                        Total Price {quantity > 1 ? `(${quantity} items × ₹${unitPrice})` : ""}
                    </span>
                    <strong className="final-price-number">₹{totalPrice}</strong>
                </div>

                <button
                    type="button"
                    className="btn-add-to-cart-action"
                    onClick={onAddToCart}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <FaSpinner className="spin-icon" />
                            <span>Adding to Cart...</span>
                        </>
                    ) : (
                        <>
                            <FaShoppingCart />
                            <span>Add to Cart • ₹{totalPrice}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
