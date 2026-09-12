import React, { useEffect, useState, useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { adminAPI, getFoodImageUrl } from "../../services/api";
import AdminNav from "../../components/AdminNav/AdminNav";
import Loader from "../../components/Loader/Loader";
import "./FoodManagement.css";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaStar,
    FaTimes,
    FaCheck,
    FaLeaf,
    FaDrumstickBite,
    FaUpload
} from "react-icons/fa";

const CATEGORIES = [
    "Pizza",
    "Burger",
    "Biryani",
    "Chinese",
    "South Indian",
    "North Indian",
    "Desserts",
    "Beverages",
    "Fast Food",
    "Snacks",
    "Salads",
    "Noodles",
    "Drinks"
];

const FoodManagement = () => {
    const { showToast, fetchFoodList } = useContext(StoreContext);

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFoodId, setEditingFoodId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormData = {
        name: "",
        description: "",
        category: "Pizza",
        price: "",
        discountPrice: "",
        isVeg: true,
        preparationTime: 20,
        stock: 100,
        featured: false,
        isAvailable: true,
        restaurant: "FoodExpress Kitchen",
        image: ""
    };

    const [formData, setFormData] = useState(initialFormData);
    const [imageFile, setImageFile] = useState(null);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getFoods();
            setFoods(data.foods || []);
        } catch (error) {
            console.error("Failed to fetch admin foods:", error);
            showToast(error.message || "Failed to load foods", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, []);

    const handleOpenAddModal = () => {
        setEditingFoodId(null);
        setFormData(initialFormData);
        setImageFile(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (food) => {
        setEditingFoodId(food._id);
        setFormData({
            name: food.name || "",
            description: food.description || "",
            category: food.category || "Pizza",
            price: food.price || "",
            discountPrice: food.discountPrice || "",
            isVeg: food.isVeg !== undefined ? food.isVeg : true,
            preparationTime: food.preparationTime || 20,
            stock: food.stock || 100,
            featured: food.featured || false,
            isAvailable: food.isAvailable !== undefined ? food.isAvailable : true,
            restaurant: food.restaurant || "FoodExpress Kitchen",
            image: food.image || ""
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.price) {
            showToast("Please fill in all required fields.", "error");
            return;
        }

        try {
            setSubmitting(true);
            const dataToSend = new FormData();
            dataToSend.append("name", formData.name);
            dataToSend.append("description", formData.description);
            dataToSend.append("category", formData.category);
            dataToSend.append("price", formData.price);
            dataToSend.append("discountPrice", formData.discountPrice || 0);
            dataToSend.append("isVeg", formData.isVeg);
            dataToSend.append("preparationTime", formData.preparationTime);
            dataToSend.append("stock", formData.stock);
            dataToSend.append("featured", formData.featured);
            dataToSend.append("isAvailable", formData.isAvailable);
            dataToSend.append("restaurant", formData.restaurant);

            if (imageFile) {
                dataToSend.append("image", imageFile);
            } else if (formData.image) {
                dataToSend.append("image", formData.image);
            }

            if (editingFoodId) {
                await adminAPI.updateFood(editingFoodId, dataToSend);
                showToast("Food item updated successfully! 🎉", "success");
            } else {
                await adminAPI.addFood(dataToSend);
                showToast("New food item added successfully! 🍔", "success");
            }

            setModalOpen(false);
            fetchFoods();
            fetchFoodList(); // Refresh customer menu cache as well
        } catch (error) {
            console.error("Failed to save food:", error);
            showToast(error.message || "Failed to save food item", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFood = async (foodId) => {
        if (!window.confirm("Are you sure you want to delete this food item? This cannot be undone.")) return;

        try {
            await adminAPI.deleteFood(foodId);
            showToast("Food item deleted.", "info");
            fetchFoods();
            fetchFoodList();
        } catch (error) {
            showToast(error.message || "Failed to delete food", "error");
        }
    };

    const handleToggleAvailability = async (food) => {
        try {
            const dataToSend = new FormData();
            dataToSend.append("isAvailable", !food.isAvailable);
            await adminAPI.updateFood(food._id, dataToSend);
            showToast(`Status updated: ${!food.isAvailable ? "Available" : "Hidden"}`, "success");
            fetchFoods();
            fetchFoodList();
        } catch (error) {
            showToast(error.message || "Failed to update availability", "error");
        }
    };

    const filteredFoods = foods.filter((food) => {
        const matchesSearch =
            food.name?.toLowerCase().includes(search.toLowerCase()) ||
            food.restaurant?.toLowerCase().includes(search.toLowerCase());
        const matchesCat =
            categoryFilter === "All" ||
            food.category?.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCat;
    });

    return (
        <div className="admin-page-layout">
            <AdminNav />

            <div className="admin-page-container">
                <div className="admin-page-header">
                    <div>
                        <h1>Food Menu Management 🍔</h1>
                        <p>Add new delicacies, modify pricing, update stock and manage availability.</p>
                    </div>

                    <button className="btn-add-food-primary" onClick={handleOpenAddModal}>
                        <FaPlus /> Add New Food
                    </button>
                </div>

                {/* TOOLBAR */}
                <div className="admin-toolbar-card">
                    <div className="admin-search-input">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search by food name or restaurant..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="admin-filter-select">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories ({foods.length})</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* FOODS TABLE */}
                {loading ? (
                    <Loader />
                ) : (
                    <div className="admin-table-card">
                        <div className="table-card-header">
                            <h3>Food Catalog ({filteredFoods.length} items)</h3>
                        </div>

                        {filteredFoods.length > 0 ? (
                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Dish</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Veg/Non-Veg</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFoods.map((food) => (
                                            <tr key={food._id}>
                                                <td>
                                                    <div className="table-food-col">
                                                        <img
                                                            src={getFoodImageUrl(food.image)}
                                                            alt={food.name}
                                                            className="table-food-thumb"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src =
                                                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900";
                                                            }}
                                                        />
                                                        <div>
                                                            <strong>{food.name}</strong>
                                                            <small>{food.restaurant || "FoodExpress"}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="table-cat-badge">{food.category}</span>
                                                </td>
                                                <td>
                                                    <div className="table-price-col">
                                                        <strong>₹{food.discountPrice > 0 ? food.discountPrice : food.price}</strong>
                                                        {food.discountPrice > 0 && (
                                                            <small className="orig-strike">₹{food.price}</small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`veg-pill ${food.isVeg ? "veg" : "non-veg"}`}>
                                                        {food.isVeg ? <FaLeaf /> : <FaDrumstickBite />}
                                                        {food.isVeg ? "Veg" : "Non-Veg"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>{food.stock ?? 100}</strong>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`btn-availability ${food.isAvailable ? "available" : "unavailable"}`}
                                                        onClick={() => handleToggleAvailability(food)}
                                                        title="Click to toggle availability"
                                                    >
                                                        {food.isAvailable ? "Available" : "Hidden"}
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="table-actions-cell">
                                                        <button
                                                            type="button"
                                                            className="btn-action-edit"
                                                            onClick={() => handleOpenEditModal(food)}
                                                            title="Edit Food"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action-delete"
                                                            onClick={() => handleDeleteFood(food._id)}
                                                            title="Delete Food"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-table-placeholder">
                                <p>No food items match the search or category filter.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ADD / EDIT FOOD MODAL */}
            {modalOpen && (
                <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>{editingFoodId ? "Edit Food Item" : "Add New Food Item"}</h2>
                            <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="admin-modal-form">
                            <div className="modal-form-grid">
                                <div className="form-group full-width">
                                    <label>Food Name *</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. Margherita Cheese Pizza"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Restaurant / Kitchen</label>
                                    <input
                                        type="text"
                                        placeholder="Restaurant name"
                                        value={formData.restaurant}
                                        onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="299"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Discount Price (₹, optional)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="249"
                                        value={formData.discountPrice}
                                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Preparation Time (mins)</label>
                                    <input
                                        type="number"
                                        min="5"
                                        value={formData.preparationTime}
                                        onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Stock Count</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Image URL (or upload below)</label>
                                    <input
                                        type="text"
                                        placeholder="https://images.unsplash.com/..."
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Or Upload Image File</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description *</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Describe the ingredients, taste, and highlights..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group checkbox-row">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.isVeg}
                                            onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                                        />
                                        Is Pure Vegetarian
                                    </label>

                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        />
                                        Mark as Featured
                                    </label>

                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.isAvailable}
                                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                        />
                                        Is Available for Order
                                    </label>
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="btn-modal-cancel"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? "Saving..." : editingFoodId ? "Save Changes" : "Create Food Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodManagement;