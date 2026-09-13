import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI, getFoodImageUrl } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantInventory.css";
import {
    FaBoxes,
    FaSyncAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaSave
} from "react-icons/fa";

const RestaurantInventory = () => {
    const { showToast } = useContext(StoreContext);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // "all" | "in" | "low" | "out"
    const [stockValues, setStockValues] = useState({});

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await restaurantAPI.getMenu();
            const list = data.foods || [];
            setFoods(list);

            const initialStocks = {};
            list.forEach((f) => {
                initialStocks[f._id] = f.stock !== undefined ? f.stock : 50;
            });
            setStockValues(initialStocks);
        } catch (err) {
            console.error("Failed to load inventory:", err);
            showToast(err.message || "Failed to load inventory", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleStockChange = (id, val) => {
        setStockValues((prev) => ({
            ...prev,
            [id]: Math.max(0, parseInt(val, 10) || 0)
        }));
    };

    const handleSaveStock = async (id, name) => {
        try {
            const newStock = stockValues[id];
            const isAvail = newStock > 0;
            await restaurantAPI.updateFoodStock(id, {
                stock: newStock,
                isAvailable: isAvail
            });

            showToast(`Stock updated for "${name}" (${newStock} units)`, "success");

            setFoods((prev) =>
                prev.map((f) =>
                    f._id === id ? { ...f, stock: newStock, isAvailable: isAvail } : f
                )
            );
        } catch (err) {
            showToast(err.message || "Failed to update stock", "error");
        }
    };

    // Filter list
    const filteredFoods = foods.filter((f) => {
        const stock = stockValues[f._id] !== undefined ? stockValues[f._id] : f.stock;
        if (filter === "out") return stock === 0 || !f.isAvailable;
        if (filter === "low") return stock > 0 && stock <= 5;
        if (filter === "in") return stock > 5 && f.isAvailable;
        return true;
    });

    return (
        <div className="ri-container">
            {/* Header */}
            <div className="ri-header">
                <div>
                    <h1 className="ri-title">
                        <FaBoxes color="#ff5200" /> Kitchen Inventory & Stock
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        Monitor ingredient stocks, update item counts, and prevent customer out-of-stock orders.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchInventory}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Filter Row */}
            <div className="ri-filter-row">
                <button
                    type="button"
                    className={`ri-filter-chip ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                >
                    All Items ({foods.length})
                </button>
                <button
                    type="button"
                    className={`ri-filter-chip ${filter === "in" ? "active" : ""}`}
                    onClick={() => setFilter("in")}
                >
                    🟢 In Stock ({foods.filter((f) => f.stock > 5 && f.isAvailable).length})
                </button>
                <button
                    type="button"
                    className={`ri-filter-chip ${filter === "low" ? "active" : ""}`}
                    onClick={() => setFilter("low")}
                >
                    🟡 Low Stock (≤ 5) ({foods.filter((f) => f.stock > 0 && f.stock <= 5).length})
                </button>
                <button
                    type="button"
                    className={`ri-filter-chip ${filter === "out" ? "active" : ""}`}
                    onClick={() => setFilter("out")}
                >
                    🔴 Out of Stock ({foods.filter((f) => f.stock === 0 || !f.isAvailable).length})
                </button>
            </div>

            {/* Inventory Table */}
            {loading ? (
                <Loader />
            ) : (
                <div className="ri-table-wrapper">
                    <table className="ri-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Status</th>
                                <th>Available Qty</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFoods.map((food) => {
                                const currentQty =
                                    stockValues[food._id] !== undefined
                                        ? stockValues[food._id]
                                        : food.stock;

                                let badgeClass = "in-stock";
                                let badgeText = "In Stock";

                                if (currentQty === 0 || !food.isAvailable) {
                                    badgeClass = "out-of-stock";
                                    badgeText = "Out of Stock";
                                } else if (currentQty <= 5) {
                                    badgeClass = "low-stock";
                                    badgeText = "Low Stock";
                                }

                                return (
                                    <tr key={food._id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <img
                                                    src={getFoodImageUrl(food.image)}
                                                    alt={food.name}
                                                    style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
                                                />
                                                <div>
                                                    <strong>{food.name}</strong>
                                                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                        {food.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{food.category}</td>
                                        <td><strong>₹{food.price}</strong></td>
                                        <td>
                                            <span className={`ri-stock-badge ${badgeClass}`}>
                                                {badgeText}
                                            </span>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                min="0"
                                                className="ri-stock-input"
                                                value={currentQty}
                                                onChange={(e) => handleStockChange(food._id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn-ri-save"
                                                onClick={() => handleSaveStock(food._id, food.name)}
                                            >
                                                <FaSave /> Save
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RestaurantInventory;
