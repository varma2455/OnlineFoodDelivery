import React from "react";
import "./BrowseFood.css";

import BrowseSidebar from "../../components/BrowseSidebar/BrowseSidebar";
import BrowseHeader from "../../components/BrowseHeader/BrowseHeader";

import BrowseHero from "../../components/BrowseHero/BrowseHero";
import BrowseCategories from "../../components/BrowseCategories/BrowseCategories";
import BrowseFilters from "../../components/BrowseFilters/BrowseFilters";

import RecommendedFoods from "../../components/BrowseRecommended/BrowseRecommended";
import TopRestaurants from "../../components/TopRestaurants/TopRestaurants";

import TrendingFoods from "../../components/TrendingFoods/TrendingFoods";
import FlashSale from "../../components/FlashSale/FlashSale";
import ChefSpecial from "../../components/ChefSpecial/ChefSpecial";

export default function BrowseFood() {

    return (

        <div className="browseLayout">

            {/* LEFT SIDEBAR */}
            <BrowseSidebar />

            {/* CENTER CONTENT */}
            <main className="browseMain">

                <BrowseHeader />

                <div className="mainContent">

                    <BrowseHero />

                    <BrowseCategories />

                    <BrowseFilters />

                    <TopRestaurants />

                    <RecommendedFoods />

                    <TrendingFoods />

                    <FlashSale />

                    <ChefSpecial />

                </div>

            </main>

            {/* RIGHT SIDEBAR */}

            <aside className="browseCart">

                <div className="cartCard">

                    <h2>Your Cart</h2>

                    <p>No items added.</p>

                </div>

            </aside>

        </div>

    );

}