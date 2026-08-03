import "./BrowseHero.css";
import { FaSearch, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

// import pizza from "../../assets/hero-pizza.png";
// import burger from "../../assets/hero-burger.png";
// import fries from "../../assets/hero-fries.png";
// import drink from "../../assets/hero-drink.png";

export default function BrowseHero() {
  return (
    <section className="browseHero">

      <div className="heroContent">

        <span className="offerBadge">
          🔥 Flat 50% OFF Today
        </span>

        <h1>
          Discover the
          <span> Best Food </span>
          Around You
        </h1>

        <p>
          Order from thousands of restaurants and enjoy
          lightning-fast delivery with exclusive offers.
        </p>

        <div className="searchBox">

          <FaSearch className="icon"/>

          <input
            type="text"
            placeholder="Search Pizza, Burger, Biryani..."
          />

          <button>

            <FaArrowRight/>

          </button>

        </div>

        <div className="heroStats">

          <div>

            <h2>10K+</h2>

            <p>Foods</p>

          </div>

          <div>

            <h2>250+</h2>

            <p>Restaurants</p>

          </div>

          <div>

            <h2>4.9★</h2>

            <p>Ratings</p>

          </div>

        </div>

      </div>

      <div className="heroImages">

        {/* <img src={pizza} className="pizza" alt="" />

        <img src={burger} className="burger" alt="" />

        <img src={fries} className="fries" alt="" />

        <img src={drink} className="drink" alt="" /> */}

      </div>

    </section>
  );
}