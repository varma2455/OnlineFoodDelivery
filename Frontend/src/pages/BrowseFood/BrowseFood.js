import React from "react";

import "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/pages/BrowseFood/ BrowseFood.css";

// Hero
import BrowseHero from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/BrowseHero/BrowseHero.js";

// Categories
import BrowseCategories from "../../components/BrowseCategories/BrowseCategories";

// Filters
import BrowseFilters from "../../components/BrowseFilters/BrowseFilters";

// Recommended
import BrowseRecommended from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ BrowseRecommended/ BrowseRecommended.js";

// Trending
import BrowseTrending from "../../components/BrowseTrending/BrowseTrending";

// Restaurant Explorer
import RestaurantExplorer from "../../components/RestaurantExplorer/RestaurantExplorer";

// Nearby Restaurants
import NearbyRestaurants from "../../components/NearbyRestaurants/NearbyRestaurants";

// Why Choose
import WhyChoose from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ WhyChoose/WhyChoose.js";

// World Cuisine
import WorldCuisine from "../../components/WorldCuisine/WorldCuisine";

// Meal Builder
import MealBuilder from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ MealBuilder/MealBuilder.js";

// Pizza Configurator
import PizzaConfigurator from "../../components/PizzaConfigurator/PizzaConfigurator";

// Fine Dining
import FineDining from "../../components/FineDining/FineDining";

// Popular Foods
import PopularFoods from "../../components/PopularFoods/PopularFoods";

// Chef Special
import ChefSpecial from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ ChefSpecial/ChefSpecial.js";

// Master Chefs
import MasterChefs from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ MasterChefs/MasterChefs.js";

// Flash Sale
import FlashSale from "../../components/FlashSale/FlashSale";

// Live Tracking
import LiveTracking from "../../components/LiveTracking/LiveTracking";

// Testimonials
import Testimonials from "../../components/Testimonials/Testimonials";

// Mobile App
import MobileApp from "../../components/MobileApp/MobileApp";

// Featured Showcase
import FeaturedShowcase from "../../components/FeaturedShowcase/FeaturedShowcase";

// Loyalty Rewards
import LoyaltyRewards from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ LoyaltyRewards/LoyaltyRewards.js";

// Personalized Dashboard
import PersonalizedDashboard from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ PersonalizedDashboard/PersonalizedDashboard.js";

// Coupon Center
import CouponCenter from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ CouponCenter/CouponCenter.js";

// Food Gallery
import FoodGallery from "../../components/FoodGallery/FoodGallery";

// Live Kitchen
import LiveKitchen from "../../components/LiveKitchen/LiveKitchen";

// Food Events
import FoodEvents from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ FoodEvents/FoodEvents.js";

// Newsletter
import Newsletter from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ Newsletter/Newsletter.js";

// Floating Components
import FloatingCart from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ FloatingCart/FloatingCart.js";
import AIFoodAssistant from "../../components/AIFoodAssistant/AIFoodAssistant";

// Footer
import PremiumFooter from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ PremiumFooter/PremiumFooter.js";

export default function BrowseFood() {

    return (

      <div className="browseFoodPage">

      <div className="browseContainer">
  
          {/* All Components */}
  
          <BrowseHero />
          <BrowseCategories />
          <BrowseFilters />
          <BrowseRecommended />
          <BrowseTrending />
          <RestaurantExplorer />
          <NearbyRestaurants />
          <WhyChoose />
          <WorldCuisine />
          <MealBuilder />
          <PizzaConfigurator />
          <FineDining />
          <PopularFoods />
          <ChefSpecial />
          <MasterChefs />
          <FlashSale />
          <LiveTracking />
          <Testimonials />
          <MobileApp />
          <FeaturedShowcase />
          <LoyaltyRewards />
          <PersonalizedDashboard />
          <CouponCenter />
          <FoodGallery />
          <LiveKitchen />
          <FoodEvents />
          <Newsletter />
  
      </div>
  
      <PremiumFooter />
  
      <FloatingCart />
  
      <AIFoodAssistant />
  
    </div>

    );

}