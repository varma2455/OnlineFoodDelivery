import "./LiveKitchen.css";
import VideoCard from "./VideoCard";

const videos = [
  {
    id: 1,
    title: "How Our Signature Pizza Is Made",
    chef: "Chef Marco",
    duration: "3:45",
    thumbnail: "/images/videos/pizza.jpg",
    viewers: "12.4K",
    live: true,
  },
  {
    id: 2,
    title: "Authentic Hyderabadi Biryani",
    chef: "Chef Ahmed",
    duration: "5:10",
    thumbnail: "/images/videos/biryani.jpg",
    viewers: "8.9K",
    live: false,
  },
  {
    id: 3,
    title: "Perfect Burger Secrets",
    chef: "Chef John",
    duration: "4:20",
    thumbnail: "/images/videos/burger.jpg",
    viewers: "15.2K",
    live: false,
  },
];

export default function LiveKitchen() {
  return (
    <section className="liveKitchen">

      <div className="kitchenHeader">

        <span>🎬 Live Kitchen</span>

        <h2>
          Watch Your Favorite Food Come to Life
        </h2>

        <p>
          Learn recipes, meet our chefs, and watch live cooking sessions.
        </p>

      </div>

      <div className="videoGrid">

        {videos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
          />
        ))}

      </div>

    </section>
  );
}