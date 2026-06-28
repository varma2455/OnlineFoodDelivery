import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.css";

const Login = () => {

    const navigate = useNavigate();

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
    
        try {
    
            setLoading(true);
    
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/login",
                formData
            );
    
            localStorage.setItem("token", data.token);
    
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
    
            alert("Login Successful");
    
            if (data.user.role === "admin") {
    
                navigate("/admin");
    
            } else {
    
                navigate("/");
    
            }
    
        } catch (error) {
    
            alert(
                error.response?.data?.message ||
                "Login Failed"
            );
    
        } finally {
    
            setLoading(false);
    
        }
    
    };

    return(

        <div className="login-page">

            <div className="login-card">

                <h1>

                    Welcome Back 👋

                </h1>

                <p>

                    Login to continue ordering your favourite food.

                </p>

                <form

                    onSubmit={handleSubmit}

                >

                    <div className="input-group">

                        <label>

                            Email

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
                                    setShowPassword(
                                        !showPassword
                                    )
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

                    <div className="login-options">

                        <Link
                            to="/forgot-password"
                        >

                            Forgot Password?

                        </Link>

                    </div>

                    <button

                        type="submit"

                        className="login-btn"

                        disabled={loading}

                    >

                        {

                            loading

                                ? "Logging In..."

                                : "Login"

                        }

                    </button>

                    <div className="register-link">

                        <p>

                            Don't have an account?

                            <Link to="/register">

                                Register

                            </Link>

                        </p>

                    </div>

                </form>
            </div>
            

        </div>

    );

};

export default Login;