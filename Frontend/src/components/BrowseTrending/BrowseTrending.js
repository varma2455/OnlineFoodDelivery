import "./BrowseTrending.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

import TrendingCard from "./TrendingCard";

const foods = [
  {
    id: 1,
    title: "Margherita Pizza",
    image: "/images/pizza.jpg",
    rating: 4.9,
    price: 299,
    time: "20 min",
    offer: "30% OFF"
  },
  {
    id: 2,
    title: "Chicken Burger",
    image: "/images/burger.jpg",
    rating: 4.8,
    price: 249,
    time: "15 min",
    offer: "20% OFF"
  },
  {
    id: 3,
    title: "Hyderabadi Biryani",
    image: "/images/biryani.jpg",
    rating: 5.0,
    price: 349,
    time: "25 min",
    offer: "BUY 1 GET 1"
  },
  {
    id: 4,
    title: "Chinese Noodles",
    image: "/images/noodles.jpg",
    rating: 4.7,
    price: 199,
    time: "18 min",
    offer: "15% OFF"
  },
  {
    id: 5,
    title: "Cold Coffee",
    image: "/images/drink.jpg",
    rating: 4.9,
    price: 149,
    time: "10 min",
    offer: "NEW"
  }
];

export default function BrowseTrending() {
  return (
    <section className="browseTrending">

      <div className="sectionTitle">

        <div>

          <h2>🔥 Trending Today</h2>

          <p>Most Ordered Food Today</p>

        </div>

        <button>Explore</button>

      </div>

      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        spaceBetween={25}
        slidesPerView={4}
        breakpoints={{
          320: {
            slidesPerView: 1.2,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
          1400: {
            slidesPerView: 4,
          },
        }}
      >
        {foods.map(food => (

          <SwiperSlide key={food.id}>

            <TrendingCard food={food} />

          </SwiperSlide>

        ))}
      </Swiper>

    </section>
  );
}