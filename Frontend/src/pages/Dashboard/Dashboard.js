import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// Components
import DashboardHeroBanner from "../../components/DashboardHeroBanner/DashboardHeroBanner";
import DashboardStatsCards from "../../components/DashboardStatsCards/DashboardStatsCards";
import DashboardActiveOrder from "../../components/DashboardActiveOrder/DashboardActiveOrder";
import DashboardBestOffers from "../../components/DashboardBestOffers/DashboardBestOffers";
import DashboardRecommendations from "../../components/DashboardRecommendations/DashboardRecommendations";
import DashboardPopularFoods from "../../components/DashboardPopularFoods/DashboardPopularFoods";
import DashboardTopRestaurants from "../../components/DashboardTopRestaurants/DashboardTopRestaurants";
import DashboardWalletCard from "../../components/DashboardWalletCard/DashboardWalletCard";
import DashboardMembershipCard from "../../components/DashboardMembershipCard/DashboardMembershipCard";
import DashboardRecentOrders from "../../components/DashboardRecentOrders/DashboardRecentOrders";
import DashboardFavorites from "../../components/DashboardFavorites/DashboardFavorites";
import DashboardFooterFeatures from "../../components/DashboardFooterFeatures/DashboardFooterFeatures";
import DashboardFloatingCart from "../../components/DashboardFloatingCart/DashboardFloatingCart";
import DashboardMobileNav from "../../components/DashboardMobileNav/DashboardMobileNav";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const handleHeroSearch = (query) => {
    navigate(`/browse-food?search=${encodeURIComponent(query)}`);
  };

  const handleCategorySelect = (categoryName) => {
    setActiveCategory(categoryName);
    const popularSec = document.getElementById("popular-dishes-section");
    if (popularSec) {
      popularSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="dashboard-page-container">
      {/* MAIN CONTENT AREA */}
      <div className="dashboard-content-area">
        {/* Dashboard Main Feed */}
        <main className="dashboard-main-feed" role="main">
          {/* Section 1: Live Active Order Tracking (or Smart Empty State) */}
          <div id="active-order-section">
            <DashboardActiveOrder />
          </div>

          {/* Section 2: Hero Search & 10-Category Food Discovery Carousel */}
          <DashboardHeroBanner
            onSearchSubmit={handleHeroSearch}
            onCategorySelect={handleCategorySelect}
          />

          {/* Section 3: Quick Actions (Reorder, Track, Offers, Favorites, Addresses, Wallet, Rewards, Support) */}
          <DashboardStatsCards />

          {/* Section 4: Flash Offers & Today's Best Deals */}
          <div id="offers-section">
            <DashboardBestOffers />
          </div>

          {/* Section 5: Personalized Recommendations & "Order Again" past items */}
          <DashboardRecommendations />

          {/* Section 6: Popular Dishes Near You with Smart Filters & Sorting */}
          <div id="popular-dishes-section">
            <DashboardPopularFoods />
          </div>

          {/* Section 7: Top Restaurants Near You Carousel */}
          <DashboardTopRestaurants />

          {/* Section 8: Utility Grid: FoodExpress Wallet + VIP Membership + Recent Orders Preview */}
          <section className="dashboard-utility-grid">
            <div className="utility-column left-col">
              <div id="wallet-card-section">
                <DashboardWalletCard />
              </div>
              <DashboardMembershipCard />
            </div>

            <div className="utility-column right-col">
              <DashboardRecentOrders />
            </div>
          </section>

          {/* Section 9: Saved Favorites (with 1-Click Add & Smart Empty State) */}
          <div id="favorites-section">
            <DashboardFavorites />
          </div>

          {/* Section 10: Brand Guarantees & Features */}
          <DashboardFooterFeatures />
        </main>
      </div>

      {/* Floating Bottom Cart Bar */}
      <DashboardFloatingCart />

      {/* Mobile Bottom Navigation */}
      <DashboardMobileNav />
    </div>
  );
};

export default Dashboard;
