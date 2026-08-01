import React, { useState } from "react";
import "./Pizza.css";
import { pizzaData } from "./pizzaData";

import { useNavigate } from "react-router-dom";

const Pizza = () => {

  const navigate = useNavigate();

  
  const [search, setSearch] = useState("");

  const filteredPizzas = pizzaData.filter((pizza) =>
    pizza.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = () => {

    alert("Please login first.");
    // User is logged in
    navigate("/login"); // or do nothing if you haven't implemented the cart yet
  };

  return (
    <div className="pizza-page">

      {/* Hero Section */}
      <section className="pizza-hero">
        <div className="hero-content">
          <h1>🍕 Pizza Paradise</h1>
          <p>
            Freshly baked pizzas made with premium ingredients and delivered
            hot to your doorstep.
          </p>

          <button className="hero-btn" onClick={() => navigate("/login")}>
            Order Now
          </button>
        </div>
      </section>

      {/* Search */}
      <section className="search-section">
        <input
          type="text"
          placeholder="Search your favourite pizza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {/* Popular Pizzas */}
      <section className="pizza-container">

        <div className="title">
          <h2>Popular Pizzas</h2>
          <p>Choose from our delicious collection</p>
        </div>

        <div className="pizza-grid">

          {filteredPizzas.length > 0 ? (
            filteredPizzas.map((pizza) => (
              <div className="pizza-card" key={pizza.id}>

                <img
                  src={pizza.image}
                  alt={pizza.name}
                />

                <div className="pizza-info">

                  <h3>{pizza.name}</h3>

                  <p className="restaurant">
                    {pizza.restaurant}
                  </p>

                  <div className="rating-time">

                    <span>⭐ {pizza.rating}</span>

                    <span>🕒 {pizza.time}</span>

                  </div>

                  <div className="price-cart">

                    <h4>₹{pizza.price}</h4>

                    <button onClick={addToCart}>Add to Cart</button>

                  </div>

                </div>

              </div>
            ))
          ) : (
            <h2 className="not-found">
              No Pizza Found
            </h2>
          )}

        </div>

      </section>

      {/* Why Choose Us */}

      <section className="why-pizza">

        <h2>Why Choose Our Pizza?</h2>

        <div className="features">

          <div className="feature">
            <h3>🍅 Fresh Ingredients</h3>
            <p>
              We use farm fresh vegetables and premium cheese.
            </p>
          </div>

          <div className="feature">
            <h3>🚀 Fast Delivery</h3>
            <p>
              Get your pizza delivered within 30 minutes.
            </p>
          </div>

          <div className="feature">
            <h3>👨‍🍳 Expert Chefs</h3>
            <p>
              Handcrafted pizzas made by experienced chefs.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
};

export default Pizza;