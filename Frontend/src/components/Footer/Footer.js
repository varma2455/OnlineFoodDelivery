import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {

    const year = new Date().getFullYear();

    return (

        <footer className="footer">

            <div className="footer-container">

                <div className="footer-about">

                    <h2>🍔 FoodExpress</h2>

                    <p>
                        Delicious food delivered to your doorstep.
                        Order your favourite meals anytime,
                        anywhere with our fast and reliable
                        delivery service.
                    </p>

                </div>

                <div className="footer-links">

                    <h3>Quick Links</h3>

                    <ul>

                        <li>
                            <Link to="/">Home</Link>
                        </li>

                        <li>
                            <Link to="/menu">Menu</Link>
                        </li>

                        <li>
                            <Link to="/cart">Cart</Link>
                        </li>

                        <li>
                            <Link to="/orders">Orders</Link>
                        </li>

                    </ul>

                </div>

                <div className="footer-contact">

                    <h3>Contact</h3>

                    <p>Email: support@foodexpress.com</p>

                    <p>Phone: +91 98765 43210</p>

                    <p>Location: Hyderabad, India</p>

                </div>

                <div className="footer-social">

                    <h3>Follow Us</h3>

                    <div className="social-icons">

                        <a href="#">Facebook</a>

                        <a href="#">Instagram</a>

                        <a href="#">Twitter</a>

                        <a href="#">LinkedIn</a>

                    </div>

                </div>

            </div>

            <div className="footer-bottom">

                <p>

                    © {year} FoodExpress.
                    All Rights Reserved.

                </p>

            </div>

        </footer>

    );

};

export default Footer;