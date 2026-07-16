import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";


import { auth } from "../../firebase";


const googleProvider = new GoogleAuthProvider();


import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebookF,
  FaHamburger,
  FaMotorcycle,
  FaStore,
  FaTags
} from "react-icons/fa";


import burgerImage from "../../assets/images/burger.png";


const Login = () => {

    const navigate = useNavigate();


    const handleGoogleLogin = async () => {

        try {
    
            // Step 1
            const result = await signInWithPopup(
                auth,
                googleProvider
            );
    
            // Step 2
            const firebaseUser = result.user;
    
            // Step 3
            const firebaseToken = await firebaseUser.getIdToken();
    
            // Step 4
            const { data } = await axios.post(
    
                `${process.env.REACT_APP_API}/api/auth/login`,
    
                {},
    
                {
    
                    headers: {
    
                        Authorization:
                        `Bearer ${firebaseToken}`
    
                    }
    
                }
    
            );
    
            // Step 5
            localStorage.setItem(
                "token",
                data.token
            );
    
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
    
            // Step 6
            navigate("/dashboard");
    
        }
    
        catch(error){
    
            console.log(error);
    
            alert(
                error.response?.data?.message ||
                error.message
            );
    
        }
    
    };


    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        email: "",

        password: ""

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();
    
        if (!formData.email || !formData.password) {
    
            alert("Please fill all fields");
    
            return;
    
        }
    
        try {
    
            setLoading(true);
    
            // Step 1: Login with Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
    
            const firebaseUser = userCredential.user;
    
            // Step 2: Get Firebase ID Token
            const firebaseToken = await firebaseUser.getIdToken();
    
            // Step 3: Send token to backend
            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/auth/login`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${firebaseToken}`
                    }
                }
            );
    
            localStorage.setItem(
                "token",
                data.token
            );
    
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
    
            alert("Login Successful");
    
            switch (data.user.role) {

                case "admin":
                    navigate("/admin");
                    break;
            
                case "restaurant":
                    navigate("/restaurant");
                    break;
            
                case "delivery":
                    navigate("/delivery");
                    break;
            
                case "customer":
                    navigate("/dashboard");
                    break;
            
                default:
                    navigate("/login");
            
            }
    
        } catch (err) {

            console.error(err);
        
            alert(
                err.response?.data?.message ||
                err.message ||
                "Login Failed"
            );
        
        } finally {
    
            setLoading(false);
    
        }
    
    };

    return(

        <div className="login-page2">
            <div className="left-section2">
                <div className="logo-area2">
                    <div className="logo-circle2">
                        <FaHamburger/>
                    </div>
                <div>

                <h2>
                    Food<span>Express</span>
                </h2>
                <p>
                    Delicious food, delivered fast
                </p>
            </div>
        </div>


        <div className="dots dots-top2"></div>
            <div className="dots dots-bottom2"></div>
                <div className="burger-wrapper2">

                    <img src={burgerImage} alt="burger" className="burger-image2"/>
                </div>

                <div className="hero-text2">
                <h1>
                    Craving Something
                </h1>

                <h1 className="highlight2">Delicious?</h1>

                <p>

                    Order from your favourite restaurants
                    and get it delivered to your doorstep.

                </p>

            </div>

            <div className="feature-boxes2">
                <div className="feature-card2">
                    <div className="feature-icon2">

                        <FaMotorcycle/>
                    </div>

                    <h3> Fast Delivery </h3>

                    <p>Hot & Fresh food at your doorstep</p>

                </div>

                <div className="feature-card2">
                    <div className="feature-icon2">
                        <FaStore/>
                    </div>

                    <h3> Best Restaurants </h3>
                    <p> Choose from Top Rated Restaurants </p>

                </div>


                <div className="feature-card2">
                    <div className="feature-icon2">
                        <FaTags/>

                    </div>


                    <h3> Exclusive Offers </h3>

                    <p> Exciting Deals Everyday </p>

                </div>

            </div>

        </div>

        <div className="right-section2">
            <div className="login-card2">
                <div className="card-logo2">
                    <div className="card-logo-circle2">
                        <FaHamburger/>
                    </div>

                    <div>
                        <h2> Food<span>Express</span> </h2>
                        <p> Delicious food, delivered fast </p>
                    </div>
                </div>

                <h1> Welcome Back! 👋 </h1>


                <p className="login-subtitle2"> Login to continue your delicious journey </p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group2">
                        <label> Email Address </label>
                        <div className="input-box2">
                            <FaEnvelope/>
                            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange}/>
                        </div>
                    </div>

                    <div className="input-group2">
                    <label> Password </label>
                        <div className="input-box2">
                            <FaLock/>
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
                            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>

                                {
                                    showPassword ?
                                    <FaEyeSlash/>:
                                    <FaEye/>

                                }

                            </button>
                        </div>

            </div>
            
            <div className="forgot-link2">

                <Link to="/forgot-password"> Forgot Password? </Link>

            </div>

            <button className="login-btn2" type="submit" disabled={loading}>
                {
                    loading ? "Logging In..." : "Login"
                }
            </button>

            <div className="divider2">

                <span> or continue with </span>
            </div>

            <div className="social-buttons2">

            <button
                type="button2"
                className="google-btn2"
                onClick={handleGoogleLogin}>
                <FaGoogle /> Google
            </button>

            <button type="button" className="facebook-btn2" >

                <FaFacebookF/> Facebook
            </button>

        </div>

        <div className="password-box2">

        <h4> 🔒 Password Requirements </h4>

        <div className="password-grid2">

            <div>✔ Minimum 8 characters</div>
            <div>✔ One lowercase letter</div>
            <div>✔ One uppercase letter</div>
            <div>✔ One special character</div>
            <div>✔ One number</div>

        </div>

    </div>

    <div className="register-text2"> Don't have an account? <Link to="/register"> Register </Link> </div>

    </form>

    </div>

    </div>

    </div>

   );

};

console.log(process.env.REACT_APP_API);

export default Login;