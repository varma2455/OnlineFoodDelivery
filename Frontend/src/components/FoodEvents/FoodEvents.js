import "./FoodEvents.css";
import EventCard from "./EventCard";

const events = [
  {
    id: 1,
    title: "Pizza Festival 2026",
    date: "25 Aug 2026",
    image: "/images/events/pizza-fest.jpg",
    location: "Hyderabad",
    discount: "50% OFF",
  },
  {
    id: 2,
    title: "Street Food Carnival",
    date: "02 Sep 2026",
    image: "/images/events/street-food.jpg",
    location: "Bangalore",
    discount: "Free Entry",
  },
  {
    id: 3,
    title: "Chef's Live Cooking",
    date: "12 Sep 2026",
    image: "/images/events/chef-night.jpg",
    location: "Chennai",
    discount: "VIP Pass",
  },
];

export default function FoodEvents() {
  return (
    <section className="foodEvents">

      <div className="eventsHeader">
        <div>
          <span>🎉 Upcoming Events</span>
          <h2>Food Festivals Near You</h2>
          <p>Discover exciting food festivals and chef specials.</p>
        </div>

        <button>See All Events</button>
      </div>

      <div className="eventsGrid">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

    </section>
  );
}