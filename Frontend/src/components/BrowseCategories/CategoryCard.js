import React from "react";
import "./BrowseCategories.css";

const CategoryCard = ({
  title,
  icon,
  items,
  color,
  active = false,
  onClick,
}) => {
  return (
    <div
      className={`categoryCard ${active ? "activeCategory" : ""}`}
      onClick={onClick}
      style={{
        "--cardColor": color,
      }}
    >
      <div className="categoryGlow"></div>

      <div className="categoryIcon">
        {icon}
      </div>

      <div className="categoryContent">
        <h3>{title}</h3>

        <p>{items}</p>
      </div>

      <div className="categoryArrow">
        →
      </div>
    </div>
  );
};

export default CategoryCard;