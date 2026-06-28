import "./FoodCard.css";

const FoodCard = ({ food }) => {

    return (

        <div className="food-card">

            <div className="food-image">

                <img
                    src={
                        food.image
                            ? `http://localhost:5000/uploads/${food.image}`
                            : "https://via.placeholder.com/300x220?text=Food"
                    }
                    alt={food.name}
                />

                {food.discountPrice > 0 && (

                    <span className="discount-badge">

                        ₹{food.price - food.discountPrice} OFF

                    </span>

                )}

            </div>

            <div className="food-content">

                <h3>{food.name}</h3>

                <p>

                    {food.description}

                </p>

                <div className="food-rating">

                    ⭐ {food.rating || 4.5}

                </div>

                <div className="food-price">

                    {

                        food.discountPrice > 0 ? (

                            <>

                                <span className="old-price">

                                    ₹{food.price}

                                </span>

                                <span className="new-price">

                                    ₹{food.discountPrice}

                                </span>

                            </>

                        ) : (

                            <span className="new-price">

                                ₹{food.price}

                            </span>

                        )

                    }

                </div>

                <button
                    className="add-cart-btn"
                >

                    🛒 Add To Cart

                </button>

            </div>

        </div>

    );

};

export default FoodCard;