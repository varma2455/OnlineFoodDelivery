import { useState } from "react";
import { Link } from "react-router-dom";


import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

import "./ForgotPassword.css";

const ForgotPassword = () => {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();
    
        try {
    
            setLoading(true);
    
            await sendPasswordResetEmail(auth, email);
    
            alert("Password reset link has been sent to your email.");
    
            setEmail("");
    
        } catch (error) {
    
            switch (error.code) {
    
                case "auth/user-not-found":
                    alert("No account found with this email.");
                    break;
    
                case "auth/invalid-email":
                    alert("Please enter a valid email.");
                    break;
    
                default:
                    alert(error.message);
            }
    
        } finally {
    
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