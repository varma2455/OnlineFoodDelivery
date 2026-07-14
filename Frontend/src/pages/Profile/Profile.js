import { useEffect, useState } from "react";
import axios from "axios";

import { auth } from "../../firebase";

import "./Profile.css";

const Profile = () => {

    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        profileImage: ""
    });

    useEffect(() => {

        fetchProfile();

    }, []);

    const fetchProfile = async () => {

        try{
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
            navigate("/login");
            return;
            }

            const firebaseToken = await firebaseUser.getIdToken();

            const { data } = await axios.get(

                `${process.env.REACT_APP_API}/api/auth/profile`,

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
    

        finally{

            setLoading(false);

        }

    };

    if(loading){

        return <h2>Loading Profile...</h2>;

    }

    return(

        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-image">

                    <img

                        src={
                            user.profileImage
                                ? `https://onlinefooddelivery-9g60.onrender.com/uploads/${user.profileImage}`
                                : "https://via.placeholder.com/180"
                        }

                        alt="Profile"

                    />

                </div>

                <div className="profile-info">

                    <h1>

                        {user.fullName}

                    </h1>

                    <p>

                        Welcome to your FoodExpress account.

                    </p>

                    <div className="profile-details">

                        <div className="detail-item">

                            <span>

                                📧 Email

                            </span>

                            <h3>

                                {user.email}

                            </h3>

                        </div>

                        <div className="detail-item">

                            <span>

                                📱 Phone

                            </span>

                            <h3>

                                {user.phone}

                            </h3>

                        </div>


                        <div className="detail-item">

                            <span>

                                📍 Address

                            </span>

                            <h3>

                                {

                                    user.address ||

                                    "No address added"

                                }

                            </h3>

                        </div>

                    </div>

                    <div className="profile-actions">

                        <button
                            className="edit-btn"
                        >

                            Edit Profile

                        </button>

                        <button
                            className="password-btn"
                        >

                            Change Password

                        </button>

                    </div>

                </div>

            </div>

            <div className="profile-sections">

                <div className="recent-orders">

                    <h2>

                        Recent Orders

                    </h2>

                    <ul>

                        <li>

                            🍕 Margherita Pizza

                            <span>

                                Delivered

                            </span>

                        </li>

                        <li>

                            🍔 Veg Burger

                            <span>

                                Delivered

                            </span>

                        </li>

                        <li>

                            🍝 Pasta Alfredo

                            <span>

                                Preparing

                            </span>

                        </li>

                    </ul>

                </div>

                <div className="favorite-foods">

                    <h2>

                        Favourite Foods

                    </h2>

                    <div className="favorites-grid">

                        <div className="favorite-item">

                            🍕 Pizza

                        </div>

                        <div className="favorite-item">

                            🍔 Burger

                        </div>

                        <div className="favorite-item">

                            🍜 Noodles

                        </div>

                        <div className="favorite-item">

                            🥗 Salad

                        </div>

                    </div>

                </div>
            </div>

        </div>

    );

};

export default Profile;