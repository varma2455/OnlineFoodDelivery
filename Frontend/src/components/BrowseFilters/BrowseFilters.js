import { useState } from "react";
import "./BrowseFilters.css";
import {
  FaFilter,
  FaSortAmountDown,
  FaLeaf,
  FaFire,
  FaStar,
  FaShippingFast,
  FaPercent,
} from "react-icons/fa";

const filters = [
  "All",
  "Veg",
  "Non-Veg",
  "Top Rated",
  "Fast Delivery",
  "Offers",
  "₹100 - ₹300",
  "New Arrivals",
];

export default function BrowseFilters() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [sort, setSort] = useState("Popularity");

  return (
    <section className="browseFilters">

      <div className="leftFilters">

        <div
          className={`filterChip ${activeFilter === "All" ? "active" : ""}`}
          onClick={() => setActiveFilter("All")}
        >
          <FaFilter />
          <span>All</span>
        </div>

        <div
          className={`filterChip ${activeFilter === "Veg" ? "active" : ""}`}
          onClick={() => setActiveFilter("Veg")}
        >
          <FaLeaf />
          <span>Veg</span>
        </div>

        <div
          className={`filterChip ${activeFilter === "Non-Veg" ? "active" : ""}`}
          onClick={() => setActiveFilter("Non-Veg")}
        >
          🍗
          <span>Non Veg</span>
        </div>

        <div
          className={`filterChip ${activeFilter === "Top Rated" ? "active" : ""}`}
          onClick={() => setActiveFilter("Top Rated")}
        >
          <FaStar />
          <span>Top Rated</span>
        </div>

        <div
          className={`filterChip ${activeFilter === "Fast Delivery" ? "active" : ""}`}
          onClick={() => setActiveFilter("Fast Delivery")}
        >
          <FaShippingFast />
          <span>Fast Delivery</span>
        </div>

        <div
          className={`filterChip ${activeFilter === "Offers" ? "active" : ""}`}
          onClick={() => setActiveFilter("Offers")}
        >
          <FaPercent />
          <span>Offers</span>
        </div>

        <div
          className={`filterChip ${activeFilter === "₹100 - ₹300" ? "active" : ""}`}
          onClick={() => setActiveFilter("₹100 - ₹300")}
        >
          💰
          <span>₹100 - ₹300</span>
        </div>

        <div
          className={`filterChip ${activeFilter === "New Arrivals" ? "active" : ""}`}
          onClick={() => setActiveFilter("New Arrivals")}
        >
          <FaFire />
          <span>New</span>
        </div>

      </div>

      <div className="sortSection">

        <FaSortAmountDown />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>Popularity</option>
          <option>Rating</option>
          <option>Price Low to High</option>
          <option>Price High to Low</option>
          <option>Newest</option>
        </select>

      </div>

    </section>
  );
}