import { useEffect, useState } from "react";
import axios from "axios";

import "./Menu.css";

import FoodCard from "../../components/FoodCard/FoodCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import Category from "../../components/Category/Category";
import Loader from "../../components/Loader/Loader";

const Menu = () => {

    const [foods, setFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("default");

    useEffect(() => {

        fetchFoods();

    }, []);

    const fetchFoods = async () => {

        try {

            const { data } = await axios.get(
                "https://onlinefooddelivery-9g60.onrender.com/api/foods"
            );

            const foodList = data.foods || [];

            setFoods(foodList);
            setFilteredFoods(foodList);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const searchFood = (keyword) => {

        if (!keyword.trim()) {

            setFilteredFoods(foods);

            return;

        }

        const result = foods.filter(food =>
            food.name
                .toLowerCase()
                .includes(keyword.toLowerCase())
        );

        setFilteredFoods(result);

    };

    const filterCategory = (category) => {

        setSelectedCategory(category);

        if (!category) {

            setFilteredFoods(foods);

            return;

        }

        const result = foods.filter(
            food => food.category === category
        );

        setFilteredFoods(result);

    };

    const sortFoods = (value) => {

        setSortBy(value);

        let sorted = [...filteredFoods];

        switch (value) {

            case "priceLow":

                sorted.sort(
                    (a, b) => a.price - b.price
                );

                break;

            case "priceHigh":

                sorted.sort(
                    (a, b) => b.price - a.price
                );

                break;

            case "rating":

                sorted.sort(
                    (a, b) => b.rating - a.rating
                );

                break;

            default:

                sorted = [...foods];

        }

        setFilteredFoods(sorted);

    };

    if (loading) {

        return <Loader />;

    }

    return (

        <div className="menu-page">

            <div className="menu-header">

                <h1>

                    Our Delicious Menu

                </h1>

                <p>

                    Discover hundreds of freshly prepared meals.

                </p>

            </div>

            <SearchBar
                onSearch={searchFood}
            />

            <Category
                selectedCategory={selectedCategory}
                onSelectCategory={filterCategory}
            />

            <div className="menu-toolbar">

                <label>

                    Sort By

                </label>

                <select
                    value={sortBy}
                    onChange={(e) => sortFoods(e.target.value)}
                >

                    <option value="default">
                        Default
                    </option>

                    <option value="priceLow">
                        Price : Low to High
                    </option>

                    <option value="priceHigh">
                        Price : High to Low
                    </option>

                    <option value="rating">
                        Highest Rated
                    </option>

                </select>

            </div>

            <div className="menu-grid">                {

filteredFoods.length > 0 ? (

    filteredFoods.map((food) => (

        <FoodCard
            key={food._id}
            food={food}
        />

    ))

) : (

    <div className="menu-empty">

        <h2>

            No Food Available

        </h2>

        <p>

            No food items match your search.

        </p>

    </div>

)

}

</div>

{/* ===========================
Information Section
============================ */}

<section className="menu-info">

<div className="info-card">

<h3>

    🍽 Fresh Ingredients

</h3>

<p>

    Every meal is prepared using fresh
    ingredients sourced every day.

</p>

</div>

<div className="info-card">

<h3>

    🚚 Fast Delivery

</h3>

<p>

    Hot and delicious food delivered
    within 30 minutes.

</p>

</div>

<div className="info-card">

<h3>

    💳 Secure Payments

</h3>

<p>

    Pay safely using cards,
    UPI and net banking.

</p>

</div>

</section>

{/* ===========================
Statistics
============================ */}

<section className="menu-stats">

<div className="stat-box">

<h2>

    1000+

</h2>

<p>

    Food Items

</p>

</div>

<div className="stat-box">

<h2>

    500+

</h2>

<p>

    Restaurants

</p>

</div>

<div className="stat-box">

<h2>

    10K+

</h2>

<p>

    Happy Customers

</p>

</div>

<div className="stat-box">

<h2>

    4.9★

</h2>

<p>

    Average Rating

</p>

</div>

</section>

{/* ===========================
Offer Banner
============================ */}

<section className="offer-banner">

<div className="offer-content">

<h2>

    🍔 Weekend Special Offer

</h2>

<p>

    Get Flat 25% OFF on orders
    above ₹799.

</p>

<button>

    Order Now

</button>

</div>

</section>  
</div>

);

};

export default Menu;