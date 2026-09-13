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
    FaShoppingBag,
    FaMotorcycle,
    FaPhoneAlt,
    FaBolt,
    FaCheckCircle
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

    // Delivery Partner Assignment State
    const [eligibleDrivers, setEligibleDrivers] = useState([]);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignTargetOrder, setAssignTargetOrder] = useState(null);
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [assigning, setAssigning] = useState(false);

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

    const fetchEligibleDrivers = async () => {
        try {
            const { data } = await adminAPI.getEligibleDrivers();
            setEligibleDrivers(data.drivers || []);
        } catch (err) {
            console.warn("Could not fetch eligible drivers:", err.message);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchEligibleDrivers();
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

    // Open Assign Driver Modal
    const openAssignModal = (order) => {
        setAssignTargetOrder(order);
        setSelectedDriverId(order.deliveryPartner?._id || "");
        setAssignModalOpen(true);
        fetchEligibleDrivers();
    };

    // Assign / Reassign Driver to specific order
    const handleAssignDriver = async (orderId, driverId) => {
        try {
            setAssigning(true);
            const { data } = await adminAPI.assignDeliveryPartner(orderId, driverId);
            showToast(data.message || "Delivery partner assigned successfully! 🛵", "success");

            // Update only THIS specific order in state
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? {
                              ...o,
                              deliveryPartner: data.order?.deliveryPartner || null,
                              deliveryStatus: data.order?.deliveryStatus || (driverId ? "Accepted" : "Available"),
                              orderStatus: data.order?.orderStatus || o.orderStatus
                          }
                        : o
                )
            );

            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder((prev) => ({
                    ...prev,
                    deliveryPartner: data.order?.deliveryPartner || null,
                    deliveryStatus: data.order?.deliveryStatus || (driverId ? "Accepted" : "Available"),
                    orderStatus: data.order?.orderStatus || prev.orderStatus
                }));
            }

            setAssignModalOpen(false);
            setAssignTargetOrder(null);
            fetchEligibleDrivers();
        } catch (err) {
            showToast(err.message || "Failed to assign delivery partner", "error");
        } finally {
            setAssigning(false);
        }
    };

    // Intelligent Auto-Assign Driver (Least-Loaded Online Driver)
    const handleAutoAssign = async (orderId) => {
        try {
            setAssigning(true);
            const { data } = await adminAPI.autoAssignDeliveryPartner(orderId);
            showToast(data.message || "Order auto-assigned! 🛵", "success");

            // Update only THIS specific order in state
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? {
                              ...o,
                              deliveryPartner: data.order?.deliveryPartner || null,
                              deliveryStatus: data.order?.deliveryStatus || "Accepted",
                              orderStatus: data.order?.orderStatus || o.orderStatus
                          }
                        : o
                )
            );

            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder((prev) => ({
                    ...prev,
                    deliveryPartner: data.order?.deliveryPartner || null,
                    deliveryStatus: data.order?.deliveryStatus || "Accepted",
                    orderStatus: data.order?.orderStatus || prev.orderStatus
                }));
            }

            setAssignModalOpen(false);
            setAssignTargetOrder(null);
            fetchEligibleDrivers();
        } catch (err) {
            showToast(err.message || "Auto-assign failed", "error");
        } finally {
            setAssigning(false);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
            order._id?.toLowerCase().includes(search.toLowerCase()) ||
            order.deliveryPartner?.name?.toLowerCase().includes(search.toLowerCase());

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
                        <p>Real-time order pipeline. Assign delivery partners, update status, and inspect customer delivery details.</p>
                    </div>

                    <button className="btn-admin-refresh" onClick={() => { fetchOrders(); fetchEligibleDrivers(); }}>
                        <FaSyncAlt /> Refresh Orders
                    </button>
                </div>

                {/* TOOLBAR */}
                <div className="admin-toolbar-card">
                    <div className="admin-search-input">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search by customer name, driver name, email, or order ID..."
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
                                            <th>Delivery Partner</th>
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
                                                        <div className="table-driver-cell">
                                                            {order.deliveryPartner ? (
                                                                <>
                                                                    <span className="table-driver-name">
                                                                        <FaMotorcycle /> {order.deliveryPartner.name}
                                                                    </span>
                                                                    <span className="table-driver-status">
                                                                        {order.deliveryStatus || "Accepted"}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-assign-driver-tag"
                                                                        onClick={() => openAssignModal(order)}
                                                                    >
                                                                        Change Driver
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="table-driver-name unassigned">
                                                                        Not Assigned
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-assign-driver-tag"
                                                                        onClick={() => openAssignModal(order)}
                                                                    >
                                                                        + Assign Driver
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
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

                            {/* Delivery Partner Section in Modal */}
                            <div className="modal-section">
                                <h4 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff4757", margin: "0 0 8px" }}>
                                    <FaMotorcycle /> Assigned Delivery Partner
                                </h4>
                                {selectedOrder.deliveryPartner ? (
                                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                        <p style={{ margin: 0, fontSize: "14px", color: "#2f3542", lineHeight: 1.6 }}>
                                            <strong>Driver Name:</strong> {selectedOrder.deliveryPartner.name}<br />
                                            <strong>Phone:</strong> {selectedOrder.deliveryPartner.phone || "N/A"}<br />
                                            <strong>Vehicle:</strong> {selectedOrder.deliveryPartner.vehicleType || "Bike"} ({selectedOrder.deliveryPartner.vehicleNumber || "Verified"})<br />
                                            <strong>Rating:</strong> ⭐ {selectedOrder.deliveryPartner.rating ? Number(selectedOrder.deliveryPartner.rating).toFixed(1) : "5.0"}<br />
                                            <strong>Delivery Status:</strong> <span style={{ color: "#2ed573", fontWeight: 700 }}>{selectedOrder.deliveryStatus || "Accepted"}</span>
                                        </p>
                                        <button
                                            type="button"
                                            className="btn-assign-driver-tag"
                                            style={{ marginTop: "10px" }}
                                            onClick={() => openAssignModal(selectedOrder)}
                                        >
                                            Change Assigned Driver
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ background: "#fff8f5", padding: "12px", borderRadius: "8px", border: "1px dashed #ffb8b8" }}>
                                        <p style={{ margin: "0 0 10px", fontSize: "13.5px", color: "#747d8c" }}>
                                            No delivery partner has been assigned to this order yet.
                                        </p>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                type="button"
                                                className="btn-assign-driver-tag"
                                                onClick={() => openAssignModal(selectedOrder)}
                                            >
                                                + Assign Driver
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-assign-driver-tag"
                                                style={{ background: "#e8f4fd", color: "#0984e3", borderColor: "#74b9ff" }}
                                                onClick={() => handleAutoAssign(selectedOrder._id)}
                                            >
                                                <FaBolt /> Auto-Dispatch Driver
                                            </button>
                                        </div>
                                    </div>
                                )}
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

            {/* DEDICATED ASSIGN DRIVER MODAL */}
            {assignModalOpen && assignTargetOrder && (
                <div className="admin-modal-backdrop" onClick={() => { if (!assigning) setAssignModalOpen(false); }}>
                    <div className="admin-modal-card" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Assign Delivery Partner 🛵</h2>
                            <button
                                className="modal-close-btn"
                                onClick={() => setAssignModalOpen(false)}
                                disabled={assigning}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="admin-modal-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13.5px" }}>
                                <div>Order: <strong>#{assignTargetOrder._id.slice(-6).toUpperCase()}</strong></div>
                                <div>Customer: <strong>{assignTargetOrder.user?.name || "Customer"}</strong> ({assignTargetOrder.deliveryAddress?.city || "Hyderabad"})</div>
                                <div>
                                    Current Driver:{" "}
                                    <strong>{assignTargetOrder.deliveryPartner?.name || "None (Unassigned)"}</strong>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                                    Select Verified Delivery Partner:
                                </label>
                                <select
                                    style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "1.5px solid #edf0f5", fontSize: "14px" }}
                                    value={selectedDriverId}
                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                    disabled={assigning}
                                >
                                    <option value="">-- Choose a Driver --</option>
                                    {eligibleDrivers.map((driver) => (
                                        <option key={driver._id} value={driver._id}>
                                            {driver.name} — {driver.availabilityStatus?.toUpperCase()} ({driver.activeOrdersCount || 0} active orders) — ⭐ {driver.rating || "5.0"} ({driver.vehicleType || "Bike"})
                                        </option>
                                    ))}
                                    {assignTargetOrder.deliveryPartner && (
                                        <option value="unassign">-- Unassign Delivery Partner --</option>
                                    )}
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                <button
                                    type="button"
                                    className="btn-admin-refresh"
                                    style={{ flex: 1, justifyContent: "center", background: "#ff4757", color: "#fff", border: "none" }}
                                    disabled={assigning}
                                    onClick={() => handleAssignDriver(assignTargetOrder._id, selectedDriverId)}
                                >
                                    {assigning ? "Assigning..." : "Confirm Driver Assignment"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-admin-refresh"
                                    style={{ justifyContent: "center", background: "#e8f4fd", color: "#0984e3", borderColor: "#74b9ff" }}
                                    disabled={assigning}
                                    onClick={() => handleAutoAssign(assignTargetOrder._id)}
                                    title="Dispatches to online driver with lowest active delivery workload"
                                >
                                    <FaBolt /> Auto-Dispatch
                                </button>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                className="btn-modal-cancel"
                                onClick={() => setAssignModalOpen(false)}
                                disabled={assigning}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;