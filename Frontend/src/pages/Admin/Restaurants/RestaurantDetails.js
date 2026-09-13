import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdminNav from "../../../components/AdminNav/AdminNav";
import { StoreContext } from "../../../context/StoreContext";
import { adminAPI, getFoodImageUrl } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantDetails.css";
import {
    FaStore,
    FaArrowLeft,
    FaCheck,
    FaTimes,
    FaBan,
    FaStar,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaClock,
    FaUtensils,
    FaShoppingBag
} from "react-icons/fa";

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useContext(StoreContext);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal state for rejection / suspension
    const [modalAction, setModalAction] = useState(null); // "reject" | "suspend"
    const [modalReason, setModalReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getRestaurantById(id);
            setData(res.data);
        } catch (err) {
            console.error("Failed to load restaurant details:", err);
            showToast(err.message || "Failed to load restaurant details", "error");
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            await adminAPI.approveRestaurant(id);
            showToast("Restaurant approved successfully! 🎉", "success");
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Approval failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleActivate = async () => {
        try {
            setActionLoading(true);
            await adminAPI.activateRestaurant(id);
            showToast("Restaurant reactivated successfully!", "success");
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Activation failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleModalConfirm = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            if (modalAction === "reject") {
                await adminAPI.rejectRestaurant(id, modalReason.trim() || "Application does not meet criteria.");
                showToast("Restaurant application rejected.", "info");
            } else if (modalAction === "suspend") {
                await adminAPI.suspendRestaurant(id, modalReason.trim() || "Suspended by administrator.");
                showToast("Restaurant suspended.", "info");
            }

            setModalAction(null);
            setModalReason("");
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Action failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
                <AdminNav />
                <Loader />
            </div>
        );
    }

    if (!data || !data.restaurant) {
        return (
            <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
                <AdminNav />
                <div className="ard-container" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <h2>Restaurant Not Found</h2>
                    <Link to="/admin/restaurants">Back to Restaurants</Link>
                </div>
            </div>
        );
    }

    const { restaurant, metrics, foods, recentOrders } = data;
    const statusClass = (restaurant.status || "").toLowerCase();

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <AdminNav />

            <div className="ard-container">
                {/* Header */}
                <div className="ard-header">
                    <div>
                        <Link to="/admin/restaurants" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "13px", fontWeight: "600", textDecoration: "none", marginBottom: "8px" }}>
                            <FaArrowLeft /> Back to Restaurants List
                        </Link>
                        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                            {restaurant.name}
                        </h1>
                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                            Application ID: <code>#REST-{restaurant._id.slice(-6).toUpperCase()}</code> • Submitted on {new Date(restaurant.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span className={`app-status-badge ${statusClass}`}>
                            {restaurant.status}
                        </span>

                        {restaurant.status === "pending" && (
                            <>
                                <button
                                    type="button"
                                    className="btn-arm-action approve"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    <FaCheck /> Approve Restaurant
                                </button>
                                <button
                                    type="button"
                                    className="btn-arm-action reject"
                                    onClick={() => {
                                        setModalAction("reject");
                                        setModalReason("");
                                    }}
                                    disabled={actionLoading}
                                >
                                    <FaTimes /> Reject
                                </button>
                            </>
                        )}

                        {restaurant.status === "approved" && (
                            <button
                                type="button"
                                className="btn-arm-action suspend"
                                onClick={() => {
                                    setModalAction("suspend");
                                    setModalReason("");
                                }}
                                disabled={actionLoading}
                            >
                                <FaBan /> Suspend Restaurant
                            </button>
                        )}

                        {(restaurant.status === "suspended" || restaurant.status === "rejected") && (
                            <button
                                type="button"
                                className="btn-arm-action activate"
                                onClick={handleActivate}
                                disabled={actionLoading}
                            >
                                <FaCheck /> Reactivate Restaurant
                            </button>
                        )}
                    </div>
                </div>

                {/* Rejection / Suspension Notice if applicable */}
                {restaurant.status === "rejected" && restaurant.rejectionReason && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "16px 20px", borderRadius: "14px", marginBottom: "20px", color: "#991b1b" }}>
                        <strong>Rejection Reason Stored:</strong> {restaurant.rejectionReason}
                    </div>
                )}
                {restaurant.status === "suspended" && restaurant.suspensionReason && (
                    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", padding: "16px 20px", borderRadius: "14px", marginBottom: "20px", color: "#9a3412" }}>
                        <strong>Suspension Reason Stored:</strong> {restaurant.suspensionReason}
                    </div>
                )}

                {/* Overview Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                        <div className="ard-item-label">TOTAL DISHES</div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{metrics.totalFoods}</div>
                    </div>
                    <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                        <div className="ard-item-label">TOTAL ORDERS</div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{metrics.totalOrders}</div>
                    </div>
                    <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                        <div className="ard-item-label">RATING</div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#f59e0b", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaStar size={20} /> {restaurant.rating || "5.0"}
                        </div>
                    </div>
                </div>

                {/* Restaurant & Owner Information Card */}
                <div className="ard-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: "17px", color: "#0f172a" }}>Store & Owner Information</h3>
                    <div className="ard-grid-2">
                        <div>
                            <div className="ard-item-label">OWNER FULL NAME</div>
                            <div className="ard-item-val">{restaurant.ownerId?.fullName || "N/A"}</div>
                        </div>
                        <div>
                            <div className="ard-item-label">OWNER EMAIL</div>
                            <div className="ard-item-val">{restaurant.ownerId?.email || "N/A"}</div>
                        </div>
                        <div>
                            <div className="ard-item-label">RESTAURANT PHONE</div>
                            <div className="ard-item-val">{restaurant.phone}</div>
                        </div>
                        <div>
                            <div className="ard-item-label">RESTAURANT EMAIL</div>
                            <div className="ard-item-val">{restaurant.email}</div>
                        </div>
                        <div>
                            <div className="ard-item-label">STORE TYPE</div>
                            <div className="ard-item-val">{restaurant.restaurantType}</div>
                        </div>
                        <div>
                            <div className="ard-item-label">CUISINES OFFERED</div>
                            <div className="ard-item-val">{restaurant.cuisineTypes?.join(", ") || "Indian"}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f8fafc" }}>
                        <div className="ard-item-label">ADDRESS & PICKUP LOCATION</div>
                        <div className="ard-item-val">
                            {restaurant.address?.street}, {restaurant.address?.city}, {restaurant.address?.state} - {restaurant.address?.pincode}
                        </div>
                    </div>

                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f8fafc" }}>
                        <div className="ard-item-label">OPERATING HOURS & MINIMUMS</div>
                        <div className="ard-item-val">
                            {restaurant.openingTime} to {restaurant.closingTime} • Min Order: ₹{restaurant.minimumOrderAmount} • Delivery Fee: ₹{restaurant.deliveryFee}
                        </div>
                    </div>
                </div>

                {/* Sample Menu Section */}
                <div className="ard-card">
                    <h3 style={{ margin: "0 0 14px", fontSize: "17px", color: "#0f172a" }}>
                        Menu Dishes Sample ({foods?.length || 0})
                    </h3>
                    {foods && foods.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                            {foods.map((food) => (
                                <div key={food._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "#f8fafc", borderRadius: "10px" }}>
                                    <img
                                        src={getFoodImageUrl(food.image)}
                                        alt={food.name}
                                        style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <strong style={{ fontSize: "13px", color: "#0f172a" }}>{food.name}</strong>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>₹{food.price} • {food.category}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No foods listed yet.</p>
                    )}
                </div>

                {/* Recent Orders Section */}
                <div className="ard-card">
                    <h3 style={{ margin: "0 0 14px", fontSize: "17px", color: "#0f172a" }}>
                        Recent Restaurant Orders ({recentOrders?.length || 0})
                    </h3>
                    {recentOrders && recentOrders.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                            <table className="arm-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((ord) => (
                                        <tr key={ord._id}>
                                            <td><code>#FD-{ord._id.slice(-6).toUpperCase()}</code></td>
                                            <td>{ord.user?.fullName || "Customer"}</td>
                                            <td>{ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</td>
                                            <td><strong>₹{ord.totalAmount}</strong></td>
                                            <td>
                                                <span className={`rd-order-badge ${(ord.orderStatus || "").toLowerCase().replace(/\s+/g, "-")}`}>
                                                    {ord.orderStatus}
                                                </span>
                                            </td>
                                            <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>No orders placed with this restaurant yet.</p>
                    )}
                </div>
            </div>

            {/* Modal for Rejection / Suspension */}
            {modalAction && (
                <div className="rm-modal-backdrop" onClick={() => setModalAction(null)}>
                    <div className="rm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="rm-modal-header">
                            <h2 className="rm-modal-title">
                                {modalAction === "reject" ? "Reject Restaurant Application" : "Suspend Restaurant Account"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalAction(null)}
                                style={{ background: "none", border: "none", fontSize: "18px", color: "#64748b", cursor: "pointer" }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleModalConfirm}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
                                Operational Reason for {modalAction === "reject" ? "Rejection" : "Suspension"} *
                            </label>
                            <textarea
                                className="rest-textarea"
                                placeholder="Enter specific explanation for the restaurant owner..."
                                value={modalReason}
                                onChange={(e) => setModalReason(e.target.value)}
                                required
                            />

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                                <button
                                    type="button"
                                    onClick={() => setModalAction(null)}
                                    style={{ padding: "10px 18px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: "600" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-add-food"
                                    style={{ background: modalAction === "reject" ? "#ef4444" : "#ea580c" }}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? "Submitting..." : `Confirm ${modalAction === "reject" ? "Rejection" : "Suspension"}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDetails;
