import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";

import { auth } from "../../firebase";

const googleProvider = new GoogleAuthProvider();

import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebookF,
  FaHamburger,
  FaMotorcycle,
  FaStore,
  FaGift
} from "react-icons/fa";

import burgerImage from "../../assets/images/burger.png";

const Register = () => {

    const navigate = useNavigate();

    const [loading,setLoading]=useState(false);

    const [showPassword,setShowPassword]=useState(false);

    const [showConfirmPassword,setShowConfirmPassword]=useState(false);

    const [formData,setFormData]=useState({

        name:"",

        email:"",

        phone:"",

        address:"",

        password:"",

        confirmPassword:""

    });

    const handleChange=(e)=>{

        setFormData({

            ...formData,

            [e.target.name]:e.target.value

        });

    };


    const handleGoogleRegister = async () => {

        try {
    
            setLoading(true);
    
            // Google popup
            const result = await signInWithPopup(
                auth,
                googleProvider
            );
    
            const firebaseUser = result.user;
    
            // Firebase token
            const firebaseToken = await firebaseUser.getIdToken();
    
            // Register/Login in backend
            const { data } = await axios.post(
    
                `${process.env.REACT_APP_API}/api/auth/login`,
    
                {},
    
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
    
            navigate("/customer");
    
        } catch (error) {
    
            console.log(error);
    
            alert(
                error.response?.data?.message ||
                error.message
            );
    
        } finally {
    
            setLoading(false);
    
        }
    
    };


    const handleSubmit = async (e) => {

        e.preventDefault();
    
        if(formData.password !== formData.confirmPassword){
    
            alert("Passwords do not match");
    
            return;
    
        }
    
        try{
    
            setLoading(true);
    
            // Step 1: Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
    
            const firebaseUser = userCredential.user;
    
            // Step 2: Save display name in Firebase
            await updateProfile(firebaseUser,{
                displayName: formData.name
            });
    
            
    
            // Step 4: Get Firebase ID Token
            const firebaseToken = await firebaseUser.getIdToken();
    
            // Step 5: Send user details to backend
            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/auth/register`,
                {
                    fullName: formData.name,
                    phone: formData.phone,
                    address: formData.address
                },
                {
                    headers:{
                        Authorization:`Bearer ${firebaseToken}`
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
            
            alert("Registration Successful");
            
            navigate("/customer");
    
        }
    
        catch(error){
    
            console.log(error);
    
            alert(
                error.response?.data?.message ||
                error.message ||
                "Registration Failed"
            );
    
        }
    
        finally{
    
            setLoading(false);
    
        }
    
    };


    return(

<div className="register-page3">

<div className="left-section3">

<div className="logo-area3">

<div className="logo-circle3">

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
 

<div className="dots dots-top3"></div>

<div className="dots dots-bottom3"></div>

<div className="burger-wrapper3">

<img

src={burgerImage}

alt="Burger"

className="burger-image3"

/>

</div>

<div className="hero-text3">

<h1>

Join

</h1>

<h1 className="highlight3">

FoodExpress

</h1>

<p>

Create your account and enjoy delicious food delivered directly to your doorstep.

</p>

</div>

<div className="feature-boxes3">

<div className="feature-card3">

<div className="feature-icon3">

<FaMotorcycle/>

</div>

<h3>

Fast Delivery

</h3>

<p>

Hot & Fresh food

at your doorstep

</p>

</div>

<div className="feature-card3">

<div className="feature-icon3">

<FaStore/>

</div>

<h3>

Top Restaurants

</h3>

<p>

Choose from

Top Rated Restaurants

</p>

</div>

<div className="feature-card3">

<div className="feature-icon3">

<FaGift/>

</div>

<h3>

Amazing Offers

</h3>

<p>

Exciting Deals

Everyday

</p>

</div>

</div>

</div>
<div className="right-section3">

<div className="register-card3">

<div className="card-logo3">

<div className="card-logo-circle3">

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

<h1>

Create Your Account

</h1>

<p className="register-subtitle3">

Register to start ordering delicious food.

</p>

<form onSubmit={handleSubmit}>

<div className="input-group3">

<label>

Full Name

</label>

<div className="input-box3">

<FaUser/>

<input

type="text"

name="name"

placeholder="Enter your full name"

value={formData.name}

onChange={handleChange}

required

/>

</div>

</div>

<div className="input-group3">

<label>

Email Address

</label>

<div className="input-box3">

<FaEnvelope/>

<input

type="email"

name="email"

placeholder="Enter your email"

value={formData.email}

onChange={handleChange}

required

/>

</div>

</div>

<div className="input-group3">

<label>

Mobile Number

</label>

<div className="input-box3">

<FaPhoneAlt/>

<input

type="tel"

name="phone"

placeholder="Enter your mobile number"

value={formData.phone}

onChange={handleChange}

required

/>

</div>

</div>

<div className="input-group3">

<label>

Address

</label>

<div className="input-box3">

<FaMapMarkerAlt/>

<input

type="text"

name="address"

placeholder="Enter your address"

value={formData.address}

onChange={handleChange}

required

/>

</div>

</div>

<div className="input-group3">

<label>

Password

</label>

<div className="input-box3">

<FaLock/>

<input

type={showPassword ? "text" : "password"}

name="password"

placeholder="Enter your password"

value={formData.password}

onChange={handleChange}

required

/>

<button

type="button"

className="eye-btn3"

onClick={() => setShowPassword(!showPassword)}

>

{

showPassword

?

<FaEyeSlash/>

:

<FaEye/>

}

</button>

</div>

</div>

<div className="input-group3">

<label>

Confirm Password

</label>

<div className="input-box3">

<FaLock/>

<input

type={showConfirmPassword ? "text" : "password"}

name="confirmPassword"

placeholder="Confirm your password"

value={formData.confirmPassword}

onChange={handleChange}

required

/>

<button

type="button"

className="eye-btn3"

onClick={() =>

setShowConfirmPassword(

!showConfirmPassword

)

}

>

{

showConfirmPassword

?

<FaEyeSlash/>

:

<FaEye/>

}

</button>

</div>

</div>

<button

type="submit3"

className="register-btn3"

disabled={loading}

>

{

loading

?

"Creating Account..."

:

"Create Account"

}

</button>

<div className="divider3">

<span>

or continue with

</span>

</div>

<div className="social-buttons3">

<button
    type="button3"
    className="google-btn3"
    onClick={handleGoogleRegister}
>

    <FaGoogle />

    Google

</button>

<button

type="button3"

className="facebook-btn3"

>

<FaFacebookF/>

Facebook

</button>

</div>

<div className="password-box-info2">

<h4>

🔒 Password Requirements

</h4>

<div className="password-grid2">

<div>✔ Minimum 8 characters</div>

<div>✔ One uppercase letter</div>

<div>✔ One lowercase letter</div>

<div>✔ One number</div>

<div>✔ One special character</div>

</div>

</div>

<div className="login-link4">

Already have an account?

<Link to="/login">

Login

</Link>

</div>

</form>

</div>

</div>

</div>

);

};


export default Register;