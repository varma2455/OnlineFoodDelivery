import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {

    const url = "http://localhost:5000";

    const [token, setToken] = useState(

        localStorage.getItem("token") || ""

    );

    const [foodList, setFoodList] = useState([]);

    const [cartItems, setCartItems] = useState({});

    const [user, setUser] = useState(null);

    const fetchFoodList = async () => {

        try{

            const { data } = await axios.get(

                `${url}/api/foods`

            );

            setFoodList(data.foods || []);

        }

        catch(error){

            console.log(error);

        }

    };

    const fetchUserProfile = async () => {

        if(!token) return;

        try{

            const { data } = await axios.get(

                `${url}/api/users/profile`,

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            setUser(data.user);

        }

        catch(error){

            console.log(error);

        }

    };
    const addToCart = (foodId) => {

        setCartItems((prev) => ({

            ...prev,

            [foodId]: prev[foodId]

                ? prev[foodId] + 1

                : 1

        }));

    };

    const removeFromCart = (foodId) => {

        setCartItems((prev) => {

            if(!prev[foodId]){

                return prev;

            }

            const updatedCart = {

                ...prev

            };

            if(updatedCart[foodId] === 1){

                delete updatedCart[foodId];

            }

            else{

                updatedCart[foodId] -= 1;

            }

            return updatedCart;

        });

    };

    const getTotalCartAmount = () => {

        let total = 0;

        foodList.forEach((food) => {

            if(cartItems[food._id]){

                total +=

                    food.price *

                    cartItems[food._id];

            }

        });

        return total;

    };

    const clearCart = () => {

        setCartItems({});

    };
    useEffect(() => {

        fetchFoodList();

    }, []);

    useEffect(() => {

        if(token){

            fetchUserProfile();

        }

    }, [token]);

    const contextValue = {

        url,

        token,

        setToken,

        user,

        setUser,

        foodList,

        setFoodList,

        cartItems,

        setCartItems,

        addToCart,

        removeFromCart,

        clearCart,

        getTotalCartAmount

    };

    return(

        <StoreContext.Provider

            value={contextValue}

        >

            {children}
                    </StoreContext.Provider>

    );

};

export default StoreContextProvider;