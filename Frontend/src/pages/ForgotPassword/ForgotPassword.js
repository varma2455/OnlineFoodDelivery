import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "./ForgotPassword.css";

const ForgotPassword = () => {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try{

            setLoading(true);

            const { data } = await axios.post(

                "https://onlinefooddelivery-9g60.onrender.com/api/auth/forgot-password",

                {

                    email

                }

            );

            alert(

                data.message ||

                "Password reset link sent successfully."

            );

        }

        catch(error){

            alert(

                error.response?.data?.message ||

                "Unable to send reset link."

            );

        }

        finally{

            setLoading(false);

        }

    };

    return(

        <div className="forgot-page">

            <div className="forgot-card">

                <h1>

                    Forgot Password

                </h1>

                <p>

                    Enter your registered email address.
                    We'll send you a password reset link.

                </p>

                <form

                    onSubmit={handleSubmit}

                >

                    <div className="input-group">

                        <label>

                            Email Address

                        </label>

                        <input

                            type="email"

                            value={email}

                            onChange={(e)=>
                                setEmail(e.target.value)
                            }

                            placeholder="Enter your email"

                            required

                        />
                                            </div>

                    <button

                        type="submit"

                        className="reset-btn"

                        disabled={loading}

                    >

                        {

                            loading

                                ? "Sending Reset Link..."

                                : "Send Reset Link"

                        }

                    </button>

                    <div className="login-link">

                        <p>

                            Remember your password?

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

export default ForgotPassword;