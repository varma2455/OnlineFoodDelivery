import React from "react";
import { FaCheck, FaPlus } from "react-icons/fa";

export default function CheckboxOption({
    name,
    description,
    price = 0,
    isSelected = false,
    onToggle
}) {
    const formatPriceBadge = () => {
        if (price === 0) return "Free";
        return `+₹${price}`;
    };

    return (
        <button
            type="button"
            className={`custom-checkbox-card ${isSelected ? "selected" : ""}`}
            onClick={onToggle}
            aria-pressed={isSelected}
        >
            <div className={`checkbox-glyph ${isSelected ? "active" : ""}`}>
                {isSelected ? <FaCheck /> : <FaPlus />}
            </div>

            <div className="checkbox-content">
                <strong className="checkbox-title">{name}</strong>
                {description && <small className="checkbox-desc">{description}</small>}
            </div>

            <div className={`price-pill ${price > 0 ? "extra-charge" : "free-included"}`}>
                {formatPriceBadge()}
            </div>
        </button>
    );
}
