import React, { useState } from "react";
import "./DashboardFilters.css";
import {
  FaFilter,
  FaRedo,
  FaStar,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";

const CATEGORIES = [
  { id: "Biryani", label: "Biryani" },
  { id: "Pizza", label: "Pizza" },
  { id: "Burgers", label: "Burger" },
  { id: "Noodles & Pasta", label: "Noodles" },
  { id: "Salads", label: "Salads" },
  { id: "Desserts", label: "Desserts" }
];

const DashboardFilters = ({
  selectedCategories = [],
  onToggleCategory,
  maxPrice = 1000,
  onChangeMaxPrice,
  minRating = 0,
  onChangeMinRating,
  dietaryFilter = "all", // "all", "veg", "non-veg"
  onChangeDietary,
  onClearFilters
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const activeCount =
    (selectedCategories.length > 0 ? selectedCategories.length : 0) +
    (maxPrice < 1000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (dietaryFilter !== "all" ? 1 : 0);

  return (
    <div className="dashboard-filters-card">
      {/* Filters Header */}
      <div
        className="filters-card-header"
        onClick={() => setMobileExpanded(!mobileExpanded)}
      >
        <div className="filters-title-wrap">
          <div className="filters-icon-badge">
            <FaFilter />
          </div>
          <div className="filters-title-meta">
            <h3>Filters</h3>
            {activeCount > 0 && (
              <span className="filters-active-badge">{activeCount} active</span>
            )}
          </div>
        </div>

        <div className="filters-header-actions">
          {activeCount > 0 && (
            <button
              type="button"
              className="filters-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onClearFilters) onClearFilters();
              }}
              title="Reset all filters"
            >
              <FaRedo className="clear-icon" /> Clear
            </button>
          )}
          <button
            type="button"
            className="filters-mobile-toggle"
            aria-label="Toggle filters visibility"
          >
            {mobileExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* Filter Body (Collapsible on mobile, always visible on desktop) */}
      <div className={`filters-card-body ${mobileExpanded ? "mobile-open" : ""}`}>
        {/* 1. Dietary Type */}
        <div className="filter-group">
          <label className="filter-group-title">Dietary</label>
          <div className="dietary-pills-row">
            <button
              type="button"
              className={`dietary-chip ${dietaryFilter === "all" ? "active" : ""}`}
              onClick={() => onChangeDietary && onChangeDietary("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`dietary-chip veg ${dietaryFilter === "veg" ? "active" : ""}`}
              onClick={() =>
                onChangeDietary &&
                onChangeDietary(dietaryFilter === "veg" ? "all" : "veg")
              }
            >
              <span className="dot veg">●</span> Veg
            </button>
            <button
              type="button"
              className={`dietary-chip nonveg ${
                dietaryFilter === "non-veg" ? "active" : ""
              }`}
              onClick={() =>
                onChangeDietary &&
                onChangeDietary(dietaryFilter === "non-veg" ? "all" : "non-veg")
              }
            >
              <span className="dot nonveg">▲</span> Non-Veg
            </button>
          </div>
        </div>

        <div className="filter-divider" />

        {/* 2. Categories */}
        <div className="filter-group">
          <label className="filter-group-title">Category</label>
          <div className="filter-options-list">
            {CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              return (
                <label key={cat.id} className="filter-checkbox-row">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleCategory && onToggleCategory(cat.id)}
                  />
                  <span className="custom-checkmark"></span>
                  <span className="filter-option-label">{cat.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="filter-divider" />

        {/* 3. Price Range */}
        <div className="filter-group">
          <div className="filter-price-header">
            <label className="filter-group-title">Price Range</label>
            <span className="price-current-value">Up to ₹{maxPrice}</span>
          </div>
          <div className="price-slider-wrap">
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) =>
                onChangeMaxPrice && onChangeMaxPrice(Number(e.target.value))
              }
              className="price-range-slider"
            />
            <div className="price-range-bounds">
              <span>₹100</span>
              <span>₹1000</span>
            </div>
          </div>
        </div>

        <div className="filter-divider" />

        {/* 4. Rating */}
        <div className="filter-group">
          <label className="filter-group-title">Rating</label>
          <div className="filter-options-list">
            <label className="filter-checkbox-row">
              <input
                type="checkbox"
                checked={minRating === 4.5}
                onChange={() =>
                  onChangeMinRating && onChangeMinRating(minRating === 4.5 ? 0 : 4.5)
                }
              />
              <span className="custom-checkmark"></span>
              <span className="filter-option-label">
                4.5+ <FaStar className="star-icon" /> (Top Rated)
              </span>
            </label>
            <label className="filter-checkbox-row">
              <input
                type="checkbox"
                checked={minRating === 4.0}
                onChange={() =>
                  onChangeMinRating && onChangeMinRating(minRating === 4.0 ? 0 : 4.0)
                }
              />
              <span className="custom-checkmark"></span>
              <span className="filter-option-label">
                4.0+ <FaStar className="star-icon" /> (Very Good)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
