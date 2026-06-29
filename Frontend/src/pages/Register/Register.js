import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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

    const handleSubmit=async(e)=>{

        e.preventDefault();

        if(formData.password!==formData.confirmPassword){

            alert("Passwords do not match");

            return;

        }

        try{

            setLoading(true);

            await axios.post(

                "https://onlinefooddelivery-9g60.onrender.com/api/auth/register",

                {

                    fullName:formData.name,

                    email:formData.email,

                    phone:formData.phone,

                    address:formData.address,

                    password:formData.password

                }

            );

            alert("Registration Successful");

            navigate("/login");

        }

        catch(error){

            alert(

                error.response?.data?.message ||

                "Registration Failed"

            );

        }

        finally{

            setLoading(false);

        }

    };

    return(

<div className="register-page">

<div className="left-section">

<div className="logo-area">

<div className="logo-circle">

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
 

<div className="dots dots-top"></div>

<div className="dots dots-bottom"></div>

<div className="burger-wrapper">

<img

src={burgerImage}

alt="Burger"

className="burger-image"

/>

</div>

<div className="hero-text">

<h1>

Join

</h1>

<h1 className="highlight">

FoodExpress

</h1>

<p>

Create your account and enjoy delicious food delivered directly to your doorstep.

</p>

</div>

<div className="feature-boxes">

<div className="feature-card">

<div className="feature-icon">

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

<div className="feature-card">

<div className="feature-icon">

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

<div className="feature-card">

<div className="feature-icon">

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
<div className="right-section">

<div className="register-card">

<div className="card-logo">

<div className="card-logo-circle">

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

<p className="register-subtitle">

Register to start ordering delicious food.

</p>

<form onSubmit={handleSubmit}>

<div className="input-group">

<label>

Full Name

</label>

<div className="input-box">

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

<div className="input-group">

<label>

Email Address

</label>

<div className="input-box">

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

<div className="input-group">

<label>

Mobile Number

</label>

<div className="input-box">

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

<div className="input-group">

<label>

Address

</label>

<div className="input-box">

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

<div className="input-group">

<label>

Password

</label>

<div className="input-box">

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

className="eye-btn"

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

<div className="input-group">

<label>

Confirm Password

</label>

<div className="input-box">

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

className="eye-btn"

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

type="submit"

className="register-btn"

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

<div className="divider">

<span>

or continue with

</span>

</div>

<div className="social-buttons">

<button

type="button"

className="google-btn"

>

<FaGoogle/>

Google

</button>

<button

type="button"

className="facebook-btn"

>

<FaFacebookF/>

Facebook

</button>

</div>

<div className="password-box-info">

<h4>

🔒 Password Requirements

</h4>

<div className="password-grid">

<div>✔ Minimum 8 characters</div>

<div>✔ One uppercase letter</div>

<div>✔ One lowercase letter</div>

<div>✔ One number</div>

<div>✔ One special character</div>

</div>

</div>

<div className="login-link">

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