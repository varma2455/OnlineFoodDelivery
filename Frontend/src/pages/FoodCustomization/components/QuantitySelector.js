import React from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export default function QuantitySelector({
    quantity = 1,
    onChange,
    min = 1,
    max = 20,
    disabled = false
}) {
    const handleDecrease = () => {
        if (disabled) return;
        const next = Math.max(min, Number(quantity) - 1);
        onChange(next);
    };

    const handleIncrease = () => {
        if (disabled) return;
        const next = Math.min(max, Number(quantity) + 1);
        onChange(next);
    };

    return (
        <div className="customization-quantity-row">
            <div className="quantity-label-box">
                <h3>Quantity</h3>
                <span>Select number of servings</span>
            </div>

            <div className="quantity-stepper">
                <button
                    type="button"
                    className="stepper-btn minus"
                    onClick={handleDecrease}
                    disabled={disabled || quantity <= min}
                    aria-label="Decrease quantity"
                >
                    <FaMinus />
                </button>

                <span className="stepper-value">{quantity}</span>

                <button
                    type="button"
                    className="stepper-btn plus"
                    onClick={handleIncrease}
                    disabled={disabled || quantity >= max}
                    aria-label="Increase quantity"
                >
                    <FaPlus />
                </button>
            </div>
        </div>
    );
}
