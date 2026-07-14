import { useEffect, useState } from "react";
import axios from "axios";

import "./FoodManagement.css";

const FoodManagement = () => {

    const [foods, setFoods] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchFoods();

    }, []);

    const fetchFoods = async () => {

        try{

            const token = localStorage.getItem("token");

            const { data } = await axios.get(

                "https://onlinefooddelivery-9g60.onrender.com/api/admin/foods",

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            setFoods(data.foods || []);

        }

        catch(error){

            console.log(error);

        }

        finally{

            setLoading(false);

        }

    };

    const filteredFoods = foods.filter((food)=>

        food.name.toLowerCase().includes(

            search.toLowerCase()

        )

    );

    if(loading){

        return <h2>Loading Foods...</h2>;

    }

    return(

        <div className="food-management-page">

            <div className="food-header">

                <h1>

                    Food Management

                </h1>

                <p>

                    Add, edit and manage all food items.

                </p>

            </div>

            <div className="food-toolbar">

                <input

                    type="text"

                    placeholder="Search food..."

                    value={search}

                    onChange={(e)=>

                        setSearch(e.target.value)

                    }

                />

                <button

                    className="add-food-btn"

                >

                    + Add Food

                </button>

            </div>

            <div className="food-grid">
                                {

                    filteredFoods.map((food) => (

                        <div
                            key={food._id}
                            className="food-card"
                        >

                            <img

                                src={`${process.env.REACT_APP_API}/uploads/${user.profileImage}`}

                                alt={food.name}

                            />

                            <div className="food-content">

                                <h2>

                                    {food.name}

                                </h2>

                                <p>

                                    {food.description}

                                </p>

                                <h3>

                                    ₹{food.price}

                                </h3>

                                <span>

                                    {food.category}

                                </span>

                            </div>

                            <div className="food-actions">

                                <button
                                    className="edit-btn"
                                >

                                    ✏️ Edit

                                </button>

                                <button
                                    className="delete-btn"
                                >

                                    🗑 Delete

                                </button>

                            </div>

                        </div>

                    ))

                }

            </div>
        </div>
        

    );

};

export default FoodManagement;