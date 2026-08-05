import "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/pages/BrowseFood/ BrowseFood.css";

import BrowseSidebar from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/BrowseSidebar/BrowseSidebar.js";
import BrowseHeader from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ BrowseHeader/BrowseHeader.js";

import BrowseCategories from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/BrowseCategories/BrowseCategories.js";
import RecommendedFoods from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/BrowseRecommended/BrowseRecommended.js";

import BrowseFilters from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/BrowseFilters/BrowseFilters.js";
import TopRestaurants from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/TopRestaurants/TopRestaurants.js";

import TrendingFoods from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ TrendingFoods/TrendingFoods.js";
import FlashSale from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/FlashSale/FlashSale.js";
import ChefSpecial from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/ChefSpecial/ChefSpecial.js";

import BrowseHero from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/BrowseHero/BrowseHero.js";

export default function BrowseFood() {

    return (

        <div className="browseLayout">

            {/* LEFT */}

            <BrowseSidebar />

            {/* CENTER */}

            <main className="browseMain">

                <BrowseHeader />

                <div className="mainContent">

                    {/* Hero Section */}

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

            {/* RIGHT */}

            <aside className="browseCart">

                <div className="cartCard">

                    <h2>Your Cart</h2>

                    <p>No items added.</p>

                </div>

            </aside>

        </div>

    );

}