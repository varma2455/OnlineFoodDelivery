import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardFloatingCart.css";
import { FaShoppingBag, FaArrowRight } from "react-icons/fa";

const DashboardFloatingCart = () => {
  const navigate = useNavigate();
  const { getCartCount, getTotalCartAmount, grandTotal } = useContext(StoreContext);

  const count = getCartCount ? getCartCount() : 0;
  if (count <= 0) return null;

  const total = grandTotal || (getTotalCartAmount ? getTotalCartAmount() : 0);

  return (
    <aside className="foodexpress-floating-cart-bar" aria-label="Current cart summary">
      <div className="floating-cart-inner" onClick={() => navigate("/cart")}>
        <div className="floating-cart-info">
          <div className="floating-cart-icon-bubble">
            <FaShoppingBag />
          </div>
          <div className="floating-cart-text">
            <span className="floating-cart-items-count">
              {count} {count === 1 ? "Item" : "Items"} Added
            </span>
            <span className="floating-cart-total-price">₹{total}</span>
          </div>
        </div>

        <button
          className="btn-view-cart-floating"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/cart");
          }}
          aria-label="View Cart"
        >
          <span>VIEW CART</span>
          <FaArrowRight className="arrow-icon" />
        </button>
      </div>
    </aside>
  );
};

export default DashboardFloatingCart;
