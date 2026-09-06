import React from "react";
import { Link } from "react-router-dom";

import "./CategoryCard.css";


export default function CategoryCard({ item }){

    return(

        <Link
            to={item.link}
            className="categoryCardLink"
        >

            <div
                className="categoryCard"
                style={{
                    background:item.color
                }}
            >

                <div className="categoryIcon">
                    {item.icon}
                </div>

                <h3>
                    {item.name}
                </h3>

            </div>

        </Link>

    );

}