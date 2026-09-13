import React from "react";
import { Link } from "react-router-dom";
import "./FoodExpressLogo.css";

/**
 * Reusable FoodExpress Brand Logo Component
 * Supports variants:
 * - "sidebar": Styled for the 247px orange sidebar with translucent burger circle + "FOOD DELIVERY" subtitle
 * - "navbar": Styled for desktop navbar with crisp dark text and FoodExpress orange accent
 * - "mobile": Compact scaled variant for mobile headers and small screens
 *
 * Guarantees white-space: nowrap; to prevent awkward wrapping ("FoodExpre / ss").
 */
const FoodExpressLogo = ({
    variant = "navbar",
    subtitle,
    theme,
    to = "/",
    onClick,
    className = ""
}) => {
    // Determine subtitle based on variant if not explicitly provided
    let displaySubtitle = subtitle;
    if (displaySubtitle === undefined) {
        if (variant === "sidebar") {
            displaySubtitle = "FOOD DELIVERY";
        } else {
            displaySubtitle = null;
        }
    }

    // Determine theme class if specified
    const themeClass = theme ? `fx-theme-${theme}` : "";
    const variantClass = variant === "navbar" ? "fx-variant-navbar navbar-logo" : `fx-variant-${variant}`;

    const content = (
        <>
            <div className="fx-logo-icon-box" aria-hidden="true">
                <span className="fx-logo-emoji">🍔</span>
            </div>

            <div className="fx-logo-text-col">
                <span className="fx-logo-title">
                    Food<span className="fx-logo-title-accent">Express</span>
                </span>
                {displaySubtitle && (
                    <span className="fx-logo-subtitle">{displaySubtitle}</span>
                )}
            </div>
        </>
    );

    const combinedClassName = `foodexpress-logo fx-logo-root ${variantClass} ${themeClass} ${className}`.trim();

    if (to) {
        return (
            <Link
                to={to}
                className={combinedClassName}
                onClick={onClick}
                title="FoodExpress — Food Delivery"
                aria-label="FoodExpress Home"
            >
                {content}
            </Link>
        );
    }

    return (
        <div
            className={combinedClassName}
            onClick={onClick}
            role="banner"
            aria-label="FoodExpress"
        >
            {content}
        </div>
    );
};

export default FoodExpressLogo;
