import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { StoreContext } from "../../context/StoreContext";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const { showToast } = useContext(StoreContext);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            showToast("Password reset link has been sent to your email! 📩", "success");
            setEmail("");
        } catch (error) {
            switch (error.code) {
                case "auth/user-not-found":
                    showToast("No account found with this email.", "error");
                    break;
                case "auth/invalid-email":
                    showToast("Please enter a valid email.", "error");
                    break;
                default:
                    showToast(error.message || "Failed to send reset link.", "error");
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