import React from "react";

export default function RadioOption({
    name,
    description,
    price = 0,
    isSelected = false,
    onSelect
}) {
    const formatPriceBadge = () => {
        if (price === 0) return "Included";
        if (price > 0) return `+₹${price}`;
        return `-₹${Math.abs(price)}`;
    };

    return (
        <label
            className={`custom-radio-card ${isSelected ? "selected" : ""}`}
            onClick={onSelect}
        >
            <div className="radio-indicator">
                <div className={`radio-dot ${isSelected ? "active" : ""}`} />
            </div>

            <div className="radio-content">
                <strong className="radio-title">{name}</strong>
                {description && <span className="radio-desc">{description}</span>}
            </div>

            <div className={`price-pill ${price > 0 ? "extra-charge" : "free-included"}`}>
                {formatPriceBadge()}
            </div>
        </label>
    );
}
