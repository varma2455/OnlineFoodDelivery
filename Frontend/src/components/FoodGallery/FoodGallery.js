import "./FoodGallery.css";
import GalleryCard from "./GalleryCard";

const gallery = [
  {
    id: 1,
    image: "/images/gallery/pizza.jpg",
    likes: "12.5K",
    title: "Cheese Pizza",
    height: "large",
  },
  {
    id: 2,
    image: "/images/gallery/burger.jpg",
    likes: "9.8K",
    title: "Chicken Burger",
    height: "small",
  },
  {
    id: 3,
    image: "/images/gallery/biryani.jpg",
    likes: "14.2K",
    title: "Biryani",
    height: "medium",
  },
  {
    id: 4,
    image: "/images/gallery/noodles.jpg",
    likes: "8.5K",
    title: "Noodles",
    height: "large",
  },
  {
    id: 5,
    image: "/images/gallery/dessert.jpg",
    likes: "11.1K",
    title: "Dessert",
    height: "medium",
  },
  {
    id: 6,
    image: "/images/gallery/drink.jpg",
    likes: "7.6K",
    title: "Cold Coffee",
    height: "small",
  },
];

export default function FoodGallery() {

  return (

    <section className="foodGallery">

      <div className="galleryHeader">

        <span>

          📸 Food Gallery

        </span>

        <h2>

          Delicious Moments

        </h2>

        <p>

          Freshly prepared meals shared by our customers.

        </p>

      </div>

      <div className="galleryGrid">

        {

          gallery.map(item=>

            <GalleryCard
              key={item.id}
              item={item}
            />

          )

        }

      </div>

    </section>

  );

}