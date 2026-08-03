import "./FoodGallery.css";

import {
FaHeart,
FaExpand
} from "react-icons/fa";

export default function GalleryCard({item}){

return(

<div className={`galleryCard ${item.height}`}>

<img
src={item.image}
alt=""
/>

<div className="galleryOverlay">

<h3>

{item.title}

</h3>

<div className="galleryBottom">

<span>

❤️ {item.likes}

</span>

<button>

<FaExpand/>

</button>

</div>

</div>

</div>

);

}