import "./SpecialOffer.css";
import {
  FaArrowRight,
  FaGift,
  FaClock,
} from "react-icons/fa";

export default function SpecialOffer() {
  return (
    <section className="specialOffer">

      <div className="offerLeft">

        <span className="offerTag">

          <FaGift />

          Today's Special

        </span>

        <h1>

          Buy 1 Get 1

          <span> FREE </span>

          on Premium Pizza

        </h1>

        <p>

          Order your favourite pizza today and enjoy
          an exclusive Buy One Get One absolutely free.

        </p>

        <div className="countdown">

          <div>

            <h2>05</h2>

            <span>Hours</span>

          </div>

          <div>

            <h2>34</h2>

            <span>Minutes</span>

          </div>

          <div>

            <h2>17</h2>

            <span>Seconds</span>

          </div>

        </div>

        <button>

          Order Now

          <FaArrowRight/>

        </button>

      </div>

      <div className="offerRight">

        <img
          src="/images/offer-pizza.png"
          alt=""
        />

      </div>

    </section>
  );
}