import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI, getFoodImageUrl } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantMenu.css";
import {
    FaUtensils,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaTimes,
    FaCheckCircle,
    FaImage
} from "react-icons/fa";

const CATEGORIES = [
    "All",
    "Biryani",
    "Pizza",
    "Burger",
    "North Indian",
    "South Indian",
    "Chinese",
    "Fast Food",
    "Desserts",
    "Beverages",
    "Snacks",
    "Salads",
    "Noodles"
];

const RestaurantMenu = () => {
    const { showToast } = useContext(StoreContext);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Fast Food",
        price: "",
        discountPrice: "",
        isVeg: true,
        preparationTime: 20,
        stock: 50,
        imageFile: null
    });

    const fetchMenu = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await restaurantAPI.getMenu();
            setFoods(data.foods || []);
        } catch (err) {
            console.error("Menu fetch error:", err);
            showToast(err.message || "Failed to load restaurant menu", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const openAddModal = () => {
        setEditingFood(null);
        setFormData({
            name: "",
            description: "",
            category: "Fast Food",
            price: "",
            discountPrice: "",
            isVeg: true,
            preparationTime: 20,
            stock: 50,
            imageFile: null
        });
        setModalOpen(true);
    };

    const openEditModal = (food) => {
        setEditingFood(food);
        setFormData({
            name: food.name,
            description: food.description,
            category: food.category,
            price: food.price,
            discountPrice: food.discountPrice || "",
            isVeg: food.isVeg,
            preparationTime: food.preparationTime || 20,
            stock: food.stock,
            imageFile: null
        });
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.price) {
            showToast("Dish name and price are required", "error");
            return;
        }

        try {
            setFormLoading(true);
            const dataToSend = new FormData();
            dataToSend.append("name", formData.name.trim());
            dataToSend.append("description", formData.description.trim());
            dataToSend.append("category", formData.category);
            dataToSend.append("price", Number(formData.price));
            dataToSend.append("discountPrice", formData.discountPrice ? Number(formData.discountPrice) : 0);
            dataToSend.append("isVeg", formData.isVeg);
            dataToSend.append("preparationTime", Number(formData.preparationTime));
            dataToSend.append("stock", Number(formData.stock));

            if (formData.imageFile) {
                dataToSend.append("image", formData.imageFile);
            }

            if (editingFood) {
                await restaurantAPI.updateFood(editingFood._id, dataToSend);
                showToast(`"${formData.name}" updated successfully!`, "success");
            } else {
                await restaurantAPI.addFood(dataToSend);
                showToast(`"${formData.name}" added to menu! 🎉`, "success");
            }

            setModalOpen(false);
            fetchMenu();
        } catch (err) {
            showToast(err.message || "Failed to save dish", "error");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteFood = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove "${name}" from your menu?`)) return;
        try {
            await restaurantAPI.deleteFood(id);
            showToast(`"${name}" removed from menu.`, "info");
            setFoods((prev) => prev.filter((f) => f._id !== id));
        } catch (err) {
            showToast(err.message || "Failed to delete dish", "error");
        }
    };

    const handleToggleAvailability = async (id, name) => {
        try {
            const { data } = await restaurantAPI.toggleAvailability(id);
            showToast(data.message || `Updated availability for ${name}`, "success");
            setFoods((prev) =>
                prev.map((f) => (f._id === id ? { ...f, isAvailable: !f.isAvailable } : f))
            );
        } catch (err) {
            showToast(err.message || "Failed to toggle availability", "error");
        }
    };

    // Filter dishes
    const filteredFoods = foods.filter((food) => {
        const matchesSearch =
            food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            food.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "All" || food.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="rm-container">
            {/* Header */}
            <div className="rm-header">
                <div>
                    <h1 className="rm-title">
                        <FaUtensils color="#ff5200" /> Restaurant Menu Management
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        Manage your menu items, update prices, and control online availability.
                    </p>
                </div>

                <button type="button" className="btn-add-food" onClick={openAddModal}>
                    <FaPlus /> Add New Dish
                </button>
            </div>

            {/* Filter Bar */}
            <div className="rm-filter-bar">
                <input
                    type="text"
                    className="rm-search-input"
                    placeholder="Search your menu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="rm-category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat === "All" ? "All Categories" : cat}
                        </option>
                    ))}
                </select>

                <div style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                    Showing {filteredFoods.length} of {foods.length} items
                </div>
            </div>

            {/* Dishes Grid */}
            {loading ? (
                <Loader />
            ) : filteredFoods.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                    <FaUtensils size={40} color="#cbd5e1" style={{ marginBottom: "12px" }} />
                    <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Menu Items Found</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                        {foods.length === 0
                            ? "Get started by adding dishes to your restaurant menu."
                            : "No items match your search filters."}
                    </p>
                </div>
            ) : (
                <div className="rm-grid">
                    {filteredFoods.map((food) => (
                        <div key={food._id} className="rm-food-card">
                            <div className="rm-food-img-wrapper">
                                <img
                                    src={getFoodImageUrl(food.image)}
                                    alt={food.name}
                                    className="rm-food-img"
                                />
                                <span className="rm-veg-badge">
                                    {food.isVeg ? "🟢 Pure Veg" : "🔴 Non-Veg"}
                                </span>
                            </div>

                            <div className="rm-food-body">
                                <h3 className="rm-food-name">{food.name}</h3>
                                <p className="rm-food-desc">{food.description}</p>

                                <div className="rm-price-row">
                                    <div>
                                        <span className="rm-price">₹{food.price}</span>
                                        {food.discountPrice > 0 && (
                                            <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "13px", marginLeft: "6px" }}>
                                                ₹{food.discountPrice}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", color: "#475569" }}>
                                        {food.category}
                                    </span>
                                </div>
                            </div>

                            <div className="rm-card-actions">
                                <button
                                    type="button"
                                    onClick={() => handleToggleAvailability(food._id, food.name)}
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        border: "none",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        background: food.isAvailable ? "#dcfce7" : "#fee2e2",
                                        color: food.isAvailable ? "#166534" : "#991b1b"
                                    }}
                                >
                                    {food.isAvailable ? "Available" : "Out of Stock"}
                                </button>

                                <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                        type="button"
                                        className="btn-rm-edit"
                                        onClick={() => openEditModal(food)}
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-rm-delete"
                                        onClick={() => handleDeleteFood(food._id, food.name)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Dish Modal */}
            {modalOpen && (
                <div className="rm-modal-backdrop" onClick={() => setModalOpen(false)}>
                    <div className="rm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="rm-modal-header">
                            <h2 className="rm-modal-title">
                                {editingFood ? "Edit Menu Dish" : "Add Dish to Menu"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                style={{ background: "none", border: "none", fontSize: "18px", color: "#64748b", cursor: "pointer" }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                    Dish Name *
                                </label>
                                <input
                                    type="text"
                                    className="rm-search-input"
                                    style={{ width: "100%" }}
                                    placeholder="e.g. Special Hyderabadi Dum Biryani"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                    Category *
                                </label>
                                <select
                                    className="rm-category-select"
                                    style={{ width: "100%" }}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        className="rm-search-input"
                                        style={{ width: "100%" }}
                                        placeholder="250"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                        Discount Price (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        className="rm-search-input"
                                        style={{ width: "100%" }}
                                        placeholder="220"
                                        value={formData.discountPrice}
                                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                        Dietary Type
                                    </label>
                                    <select
                                        className="rm-category-select"
                                        style={{ width: "100%" }}
                                        value={formData.isVeg ? "true" : "false"}
                                        onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === "true" })}
                                    >
                                        <option value="true">Pure Veg 🟢</option>
                                        <option value="false">Non-Veg 🔴</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                        Initial Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        className="rm-search-input"
                                        style={{ width: "100%" }}
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                    Description *
                                </label>
                                <textarea
                                    className="rm-search-input"
                                    style={{ width: "100%", minHeight: "80px", resize: "vertical" }}
                                    placeholder="Ingredients, preparation style, spice level..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                                    Dish Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })}
                                    style={{ fontSize: "13px" }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    style={{
                                        padding: "10px 18px",
                                        borderRadius: "10px",
                                        border: "1.5px solid #cbd5e1",
                                        background: "#fff",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-add-food"
                                    disabled={formLoading}
                                >
                                    {formLoading ? "Saving..." : editingFood ? "Update Dish" : "Add Dish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantMenu;
