import "./FoodEvents.css";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";

export default function EventCard({ event }) {
  return (
    <div className="eventCard">

      <img src={event.image} alt={event.title} />

      <span className="eventOffer">
        {event.discount}
      </span>

      <div className="eventContent">

        <h3>{event.title}</h3>

        <div className="eventInfo">
          <span>
            <FaCalendarAlt />
            {event.date}
          </span>

          <span>
            <FaMapMarkerAlt />
            {event.location}
          </span>
        </div>

        <button>
          Book Now
          <FaArrowRight />
        </button>

      </div>

    </div>
  );
}