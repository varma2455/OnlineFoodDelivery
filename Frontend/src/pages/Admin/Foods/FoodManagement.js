import React, { useState } from "react";
import "./FoodManagement.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaHamburger,
  FaPizzaSlice,
  FaIceCream,
  FaCoffee
} from "react-icons/fa";

const FoodManagement = () => {
  const [search, setSearch] = useState("");

  const foods = [
    {
      id: 1,
      name: "Chicken Burger",
      category: "Burger",
      price: "$8.99",
      stock: "Available",
      icon: <FaHamburger />
    },
    {
      id: 2,
      name: "Veg Pizza",
      category: "Pizza",
      price: "$12.50",
      stock: "Available",
      icon: <FaPizzaSlice />
    },
    {
      id: 3,
      name: "Chocolate Ice Cream",
      category: "Dessert",
      price: "$4.99",
      stock: "Out of Stock",
      icon: <FaIceCream />
    },
    {
      id: 4,
      name: "Cold Coffee",
      category: "Beverage",
      price: "$3.99",
      stock: "Available",
      icon: <FaCoffee />
    }
  ];

  return (
    <div className="food-management">

      <div className="food-header">
        <h1>🍔 Food Management</h1>

        <button className="add-food-btn">
          <FaPlus />
          Add Food
        </button>
      </div>

      <div className="search-section">

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      <div className="food-table">

        <table>

          <thead>

            <tr>

              <th>Icon</th>
              <th>Food Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {foods
              .filter(food =>
                food.name.toLowerCase().includes(search.toLowerCase())
              )
              .map(food => (

                <tr key={food.id}>

                  <td className="food-icon">{food.icon}</td>

                  <td>{food.name}</td>

                  <td>{food.category}</td>

                  <td>{food.price}</td>

                  <td>

                    <span
                      className={
                        food.stock === "Available"
                          ? "available"
                          : "out-stock"
                      }
                    >
                      {food.stock}
                    </span>

                  </td>

                  <td>

                    <button className="edit-btn">

                      <FaEdit />

                    </button>

                    <button className="delete-btn">

                      <FaTrash />

                    </button>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default FoodManagement;