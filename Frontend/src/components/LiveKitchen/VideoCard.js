import "./LiveKitchen.css";
import {
  FaPlay,
  FaEye
} from "react-icons/fa";

export default function VideoCard({ video }) {

  return (

    <div className="videoCard">

      <img
        src={video.thumbnail}
        alt={video.title}
      />

      {video.live && (
        <span className="liveBadge">
          🔴 LIVE
        </span>
      )}

      <button className="playBtn">
        <FaPlay />
      </button>

      <div className="videoContent">

        <h3>{video.title}</h3>

        <p>{video.chef}</p>

        <div className="videoFooter">

          <span>
            {video.duration}
          </span>

          <span>
            <FaEye />
            {video.viewers}
          </span>

        </div>

      </div>

    </div>

  );

}