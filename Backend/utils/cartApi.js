import axios from "axios";

const API_URL =
    process.env.REACT_APP_API ||
    "https://onlinefooddelivery-9g60.onrender.com";


export const addToCart = async (cartData) => {

    const token =
        localStorage.getItem("token");


    if (!token) {

        throw new Error(
            "Please login before adding items to cart."
        );

    }


    const response = await axios.post(

        `${API_URL}/api/cart/add`,

        cartData,

        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }

    );


    return response.data;
};