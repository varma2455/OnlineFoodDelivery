import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Register.css";

const Register = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name:"",
        email:"",
        phone:"",
        address:"",
        password:"",
        confirmPassword:""
    });
    
    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if(formData.password !== formData.confirmPassword){

            alert("Passwords do not match");

            return;

        }

        try{

            setLoading(true);

            await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    fullName: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address
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

            <div className="register-card">

                <h1>

                    Create Account

                </h1>

                <p>

                    Register to start ordering delicious food.

                </p>

                <form

                    onSubmit={handleSubmit}

                >

                    <div className="input-group">

                        <label>

                            Full Name

                        </label>

                        <input

                            type="text"

                            name="name"

                            value={formData.name}

                            onChange={handleChange}

                            placeholder="Enter your full name"

                            required

                        />

                    </div>

                    <div className="input-group">

                        <label>

                            Email Address

                        </label>

                        <input

                            type="email"

                            name="email"

                            value={formData.email}

                            onChange={handleChange}

                            placeholder="Enter your email"

                            required

                        />

                    </div>

                    <div className="input-group">

                        <label>

                            Mobile Number

                        </label>

                        <input

                            type="tel"

                            name="phone"

                            value={formData.phone}

                            onChange={handleChange}

                            placeholder="Enter your mobile number"

                            required

                        />

                    </div>


                    <div className="input-group">
                        <label>Address</label>

                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                            required
                        />

                    </div>



                    <div className="input-group">

                        <label>

                            Password

                        </label>

                        <div className="password-box">

                            <input

                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }

                                name="password"

                                value={formData.password}

                                onChange={handleChange}

                                placeholder="Enter your password"

                                required

                            />

                            <button

                                type="button"

                                className="show-btn"

                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }

                            >

                                {

                                    showPassword

                                        ? "Hide"

                                        : "Show"

                                }

                            </button>

                        </div>

                    </div>

                    <div className="input-group">

                        <label>

                            Confirm Password

                        </label>

                        <div className="password-box">

                            <input

                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }

                                name="confirmPassword"

                                value={formData.confirmPassword}

                                onChange={handleChange}

                                placeholder="Confirm your password"

                                required

                            />

                            <button

                                type="button"

                                className="show-btn"

                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }

                            >

                                {

                                    showConfirmPassword

                                        ? "Hide"

                                        : "Show"

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

                                ? "Creating Account..."

                                : "Register"

                        }

                    </button>

                    <div className="login-link">

                        <p>

                            Already have an account?

                            <Link to="/login">

                                Login

                            </Link>

                        </p>

                    </div>

                </form>
            </div>
            

        </div>

    );

};

export default Register;