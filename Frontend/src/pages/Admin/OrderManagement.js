import React, { useEffect, useState, useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { adminAPI, getFoodImageUrl } from "../../services/api";
import AdminNav from "../../components/AdminNav/AdminNav";
import Loader from "../../components/Loader/Loader";
import "./OrderManagement.css";
import {
    FaSearch,
    FaSyncAlt,
    FaEye,
    FaTrash,
    FaTimes,
    FaMapMarkerAlt,
    FaCreditCard,
    FaShoppingBag
} from "react-icons/fa";

const ORDER_STATUS_OPTIONS = [
    "Placed",
    "Confirmed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
];

const OrderManagement = () => {
    const { showToast } = useContext(StoreContext);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const { data } = await adminAPI.getOrders();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Failed to load admin orders:", error);
            showToast(error.message || "Failed to load orders", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            showToast(`Order status updated to "${newStatus}" in MongoDB! ✅`, "success");

            // Update local state immediately
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o))
            );

            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder((prev) => ({ ...prev, status: newStatus, orderStatus: newStatus }));
            }
        } catch (error) {
            showToast(error.message || "Failed to update order status", "error");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order record?")) return;
        try {
            await adminAPI.deleteOrder(orderId);
            showToast("Order record deleted.", "info");
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(null);
            }
        } catch (error) {
            showToast(error.message || "Failed to delete order", "error");
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
            order._id?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "All" ||
            order.status?.toLowerCase() === statusFilter.toLowerCase() ||
            order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="admin-page-layout">
            <AdminNav />

            <div className="admin-page-container">
                <div className="admin-page-header">
                    <div>
                        <h1>Live Order Management 📦</h1>
                        <p>Real-time order pipeline. Update status and inspect customer delivery details.</p>
                    </div>

                    <button className="btn-admin-refresh" onClick={() => fetchOrders()}>
                        <FaSyncAlt /> Refresh Orders
                    </button>
                </div>

                {/* TOOLBAR */}
                <div className="admin-toolbar-card">
                    <div className="admin-search-input">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search by customer name, email, or order ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="admin-filter-select">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses ({orders.length})</option>
                            {ORDER_STATUS_OPTIONS.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ORDERS TABLE */}
                {loading ? (
                    <Loader />
                ) : (
                    <div className="admin-table-card">
                        <div className="table-card-header">
                            <h3>Orders ({filteredOrders.length})</h3>
                        </div>

                        {filteredOrders.length > 0 ? (
                            <div className="table-responsive">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer Details</th>
                                            <th>Amount</th>
                                            <th>Payment</th>
                                            <th>Status (Update)</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => {
                                            const currentStatus = order.orderStatus || order.status || "Placed";

                                            return (
                                                <tr key={order._id}>
                                                    <td>
                                                        <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>{order.user?.name || "Customer"}</strong>
                                                            <small style={{ display: "block", color: "#747d8c", fontSize: "12px" }}>
                                                                {order.user?.email || order.deliveryAddress?.phone || "No contact"}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <strong style={{ color: "#2ed573", fontSize: "15px" }}>
                                                            ₹{order.totalAmount}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <span className="table-pay-badge">
                                                            {order.paymentMethod || "COD"} • {order.paymentStatus || "Pending"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className={`status-select status-${currentStatus.toLowerCase().replace(/\s+/g, "-")}`}
                                                            value={currentStatus}
                                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        >
                                                            {ORDER_STATUS_OPTIONS.map((st) => (
                                                                <option key={st} value={st}>
                                                                    {st}
                                                                </option>
                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        {order.createdAt
                                                            ? new Date(order.createdAt).toLocaleDateString()
                                                            : "Recently"}
                                                    </td>
                                                    <td>
                                                        <div className="table-actions-cell">
                                                            <button
                                                                type="button"
                                                                className="btn-action-edit"
                                                                onClick={() => setSelectedOrder(order)}
                                                                title="View Details"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-action-delete"
                                                                onClick={() => handleDeleteOrder(order._id)}
                                                                title="Delete Order"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-table-placeholder">
                                <p>No orders found matching the search criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ORDER INSPECTION MODAL */}
            {selectedOrder && (
                <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Order Details #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                            <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="admin-modal-form" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* Customer & Address */}
                            <div className="modal-section">
                                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff4757", margin: "0 0 8px" }}>
                                    <FaMapMarkerAlt /> Delivery Information
                                </h4>
                                <p style={{ margin: 0, fontSize: "14px", color: "#2f3542", lineHeight: 1.5 }}>
                                    <strong>Name:</strong> {selectedOrder.deliveryAddress?.fullName || selectedOrder.user?.name}<br />
                                    <strong>Phone:</strong> {selectedOrder.deliveryAddress?.phone || selectedOrder.user?.phone}<br />
                                    <strong>Address:</strong> {selectedOrder.deliveryAddress?.addressLine1}, {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.postalCode}
                                    {selectedOrder.deliveryAddress?.addressLine2 && (
                                        <>
                                            <br />
                                            <strong>Note:</strong> {selectedOrder.deliveryAddress?.addressLine2}
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Payment */}
                            <div className="modal-section">
                                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff4757", margin: "0 0 8px" }}>
                                    <FaCreditCard /> Payment & Status
                                </h4>
                                <p style={{ margin: 0, fontSize: "14px", color: "#2f3542" }}>
                                    Method: <strong>{selectedOrder.paymentMethod || "Cash on Delivery"}</strong><br />
                                    Payment Status: <strong>{selectedOrder.paymentStatus || "Pending"}</strong><br />
                                    Current Order Stage: <strong>{selectedOrder.orderStatus || selectedOrder.status}</strong>
                                </p>
                            </div>

                            {/* Items */}
                            <div className="modal-section">
                                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff4757", margin: "0 0 8px" }}>
                                    <FaShoppingBag /> Ordered Food Items
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f7f8fa", padding: "10px", borderRadius: "8px" }}>
                                            <span>{item.quantity}x {item.name}</span>
                                            <strong>₹{item.subtotal || item.price * item.quantity}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Change status from modal */}
                            <div className="modal-section" style={{ borderTop: "1px solid #edf0f5", paddingTop: "14px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                                    Update Order Status:
                                </label>
                                <select
                                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1.5px solid #edf0f5" }}
                                    value={selectedOrder.orderStatus || selectedOrder.status}
                                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                                >
                                    {ORDER_STATUS_OPTIONS.map((st) => (
                                        <option key={st} value={st}>
                                            {st}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button className="btn-modal-cancel" onClick={() => setSelectedOrder(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;