import { useEffect, useState } from "react";
import axios from "axios";

import "./Home.css";

import Hero from "../../components/Hero/Hero";
import SearchBar from "../../components/SearchBar/SearchBar";
import Category from "../../components/Category/Category";
import FoodCard from "../../components/FoodCard/FoodCard";
import Loader from "../../components/Loader/Loader";

const Home = () => {

    const [foods, setFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchFoods();

    }, []);

    const fetchFoods = async () => {

        try {

            const { data } = await axios.get(
                "https://onlinefooddelivery-9g60.onrender.com/api/foods"
            );

            setFoods(data.foods);
            setFilteredFoods(data.foods);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const searchFood = (keyword) => {

        if (!keyword) {

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
    
        if (category === "All") {
            setFilteredFoods(foods);
            return;
        }
    
        const result = foods.filter(
            food => food.category === category
        );
    
        setFilteredFoods(result);
    };

    if (loading) {

        return <Loader />;

    }

    return (

        <>

            <Hero />

            <SearchBar
                onSearch={searchFood}
            />

            <Category
                selectedCategory={selectedCategory}
                onSelectCategory={filterCategory}
            />

            <section className="food-section">

                <div className="section-title">

                    <h2>

                        Popular Foods

                    </h2>

                    <p>

                        Freshly prepared meals from our best restaurants.

                    </p>

                </div>

                <div className="food-grid">                    {

filteredFoods.length > 0 ? (

    filteredFoods.map((food) => (

        <FoodCard
            key={food._id}
            food={food}
        />

    ))

) : (

    <div className="no-food">

        <h2>

            No Food Found

        </h2>

        <p>

            Try another search keyword or choose another category.

        </p>

    </div>

)

}

</div>

</section>

{/* ==========================
Promotional Banner
========================== */}

<section className="promo-section">

<div className="promo-content">

<h2>

Get 30% OFF On Your First Order

</h2>

<p>

Use coupon code

<strong> FIRST30 </strong>

and enjoy delicious meals at amazing prices.

</p>

<button>

Order Now

</button>

</div>

</section>

{/* ==========================
Why Choose Us
========================== */}

<section className="why-section">

<div className="section-title">

<h2>

Why Choose FoodExpress?

</h2>

</div>

<div className="why-grid">

<div className="why-card">

<div className="why-icon">

    🚚

</div>

<h3>

    Fast Delivery

</h3>

<p>

    Fresh food delivered within
    30 minutes.

</p>

</div>

<div className="why-card">

<div className="why-icon">

    👨‍🍳

</div>

<h3>

    Top Restaurants

</h3>

<p>

    Order from the best restaurants
    near you.

</p>

</div>

<div className="why-card">

<div className="why-icon">

    💳

</div>

<h3>

    Secure Payment

</h3>

<p>

    Safe and secure online
    payment methods.

</p>

</div>

<div className="why-card">

<div className="why-icon">

    ⭐

</div>

<h3>

    Premium Quality

</h3>

<p>

    Fresh ingredients with
    excellent taste.

</p>

</div>

</div>

</section>
            {/* ==========================
                    Statistics
            ========================== */}

<section className="stats-section">

<div className="stats-grid">

    <div className="stat-card">

        <h2>10K+</h2>

        <p>Happy Customers</p>

    </div>

    <div className="stat-card">

        <h2>500+</h2>

        <p>Restaurants</p>

    </div>

    <div className="stat-card">

        <h2>1000+</h2>

        <p>Food Items</p>

    </div>

    <div className="stat-card">

        <h2>4.9 ★</h2>

        <p>Average Rating</p>

    </div>

</div>

</section>

{/* ==========================
    Newsletter
========================== */}

<section className="newsletter">

<div className="newsletter-content">

    <h2>

        Subscribe To Our Newsletter

    </h2>

    <p>

        Get exclusive offers, discounts,
        and updates delivered directly
        to your inbox.

    </p>

    <div className="newsletter-box">

        <input
            type="email"
            placeholder="Enter your email"
        />

        <button>

            Subscribe

        </button>

    </div>

</div>

</section>

</>

);

};

export default Home;