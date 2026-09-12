import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { API_BASE_URL, getFoodImageUrl } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardRecentOrders.css";

import {
  FaCheckCircle,
  FaClock,
  FaMotorcycle,
  FaRedoAlt,
  FaChevronRight,
  FaShoppingBag,
  FaReceipt
} from "react-icons/fa";

const sampleOrders = [
  {
    id: "#ORD-9842",
    rawId: "mock1",
    food: "Crispy Chicken Zinger Burger + Coke",
    amount: "₹299",
    status: "Delivered",
    date: "Yesterday, 8:15 PM",
    itemCount: 2,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    items: [{ _id: "pop-1", name: "Crispy Chicken Zinger Burger", price: 199, quantity: 1 }]
  },
  {
    id: "#ORD-9810",
    rawId: "mock2",
    food: "Farmhouse Cheesy Burst Pizza (Medium)",
    amount: "₹389",
    status: "Delivered",
    date: "3 days ago",
    itemCount: 1,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300",
    items: [{ _id: "pop-2", name: "Farmhouse Cheesy Burst Pizza", price: 329, quantity: 1 }]
  },
  {
    id: "#ORD-9764",
    rawId: "mock3",
    food: "Dum Handi Chicken Biryani + Raita",
    amount: "₹269",
    status: "Delivered",
    date: "Last Sunday",
    itemCount: 2,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=300",
    items: [{ _id: "pop-3", name: "Dum Handi Chicken Biryani", price: 269, quantity: 1 }]
  }
];

const DashboardRecentOrders = () => {
  const navigate = useNavigate();
  const { addToCart, showToast } = useContext(StoreContext);
  const [orders, setOrders] = useState(sampleOrders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const API_BASE = API_BASE_URL;
        
        // Try user orders first
        let res = null;
        try {
          res = await axios.get(`${API_BASE}/api/orders/my-orders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch {
          try {
            res = await axios.get(`${API_BASE}/api/order/userorders`, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch {
            // fallback to dashboard orders
            res = await axios.get(`${API_BASE}/api/dashboard/orders`, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }

        const orderData = res?.data?.orders || res?.data?.data;
        if (orderData && orderData.length > 0) {
          const formatted = orderData.slice(0, 4).map((o) => {
            const firstItem = o.items?.[0] || {};
            const itemCount = o.items?.length || 1;
            const extraText = itemCount > 1 ? ` + ${itemCount - 1} more items` : "";

            const img = getFoodImageUrl(firstItem.image);

            return {
              id: `#ORD-${(o._id || "").slice(-5).toUpperCase()}`,
              rawId: o._id,
              food: (firstItem.name || "Special Food Order") + extraText,
              amount: `₹${o.finalAmount || o.totalAmount || o.amount || 0}`,
              status: o.orderStatus === "Out for Delivery" ? "On The Way" : (o.orderStatus || "Delivered"),
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent",
              itemCount,
              image: img,
              items: o.items || []
            };
          });
          setOrders(formatted);
        }
      } catch (err) {
        console.warn("Recent orders fetch notice:", err.message);
      }
    };

    fetchOrders();
  }, []);

  const handleReorder = (order, e) => {
    e.stopPropagation();
    if (!order.items || order.items.length === 0) {
      navigate("/browse-food");
      return;
    }

    let addedCount = 0;
    order.items.forEach((item) => {
      const id = item._id || item.foodId || item.id;
      if (id && addToCart) {
        addToCart(id);
        addedCount++;
      }
    });

    if (showToast) {
      showToast(`Added ${addedCount || 1} item(s) from order to cart! 🛍️`, "success");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="order-status-badge delivered">
            <FaCheckCircle /> Delivered
          </span>
        );
      case "On The Way":
      case "Out for Delivery":
        return (
          <span className="order-status-badge ontheway">
            <FaMotorcycle /> On The Way
          </span>
        );
      case "Preparing":
      case "Cooking in Kitchen":
        return (
          <span className="order-status-badge preparing">
            <FaClock /> Preparing
          </span>
        );
      default:
        return (
          <span className="order-status-badge confirmed">
            <FaClock /> {status}
          </span>
        );
    }
  };

  return (
    <div className="foodexpress-recent-orders-card">
      <div className="orders-header-row">
        <div>
          <h3 className="orders-title">Past Orders</h3>
          <p className="orders-sub">Quickly reorder your favorite meals</p>
        </div>
        <button
          className="btn-view-all-orders"
          onClick={() => navigate("/my-orders")}
        >
          View All <FaChevronRight />
        </button>
      </div>

      <div className="recent-orders-list">
        {orders.length === 0 ? (
          <div className="empty-orders-view">
            <FaShoppingBag className="empty-bag-icon" />
            <p>No past orders yet. Ready for your first meal?</p>
            <button className="btn-first-order" onClick={() => navigate("/browse-food")}>
              Explore Menu
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div
              className="single-order-row"
              key={order.id}
              onClick={() => navigate("/my-orders")}
            >
              <img
                src={order.image}
                alt={order.food}
                className="order-item-thumb"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300";
                }}
              />

              <div className="order-info-col">
                <div className="order-id-date">
                  <span className="order-id-tag">{order.id}</span>
                  <span className="order-dot">•</span>
                  <span className="order-date-text">{order.date}</span>
                </div>

                <h4 className="order-food-name">{order.food}</h4>
                <div className="order-amount-pill">{order.amount}</div>
              </div>

              <div className="order-actions-col">
                {getStatusBadge(order.status)}

                <button
                  className="btn-quick-reorder"
                  onClick={(e) => handleReorder(order, e)}
                  title="Reorder this meal"
                >
                  <FaRedoAlt className="reorder-icon" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardRecentOrders;