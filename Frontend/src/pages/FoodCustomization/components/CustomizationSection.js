import React from "react";

export default function CustomizationSection({
    title,
    required = false,
    subtitle = null,
    children
}) {
    return (
        <section className="customization-section-block">
            <div className="section-header-row">
                <div className="section-title-group">
                    <h3 className="section-title">{title}</h3>
                    {subtitle && <p className="section-subtitle">{subtitle}</p>}
                </div>

                <span className={`requirement-badge ${required ? "required" : "optional"}`}>
                    {required ? "Required" : "Optional"}
                </span>
            </div>

            <div className="section-options-grid">
                {children}
            </div>
        </section>
    );
}
