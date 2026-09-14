import React from "react";
import "./HorizontalOrderTimeline.css";
import {
    FaReceipt,
    FaCheckCircle,
    FaUtensils,
    FaBoxOpen,
    FaMotorcycle,
    FaMapMarkerAlt,
    FaShieldAlt,
    FaClock,
    FaPhoneAlt
} from "react-icons/fa";

export const TRACKING_STAGES = [
    { key: "placed", label: "Placed", subLabel: "Order Placed", icon: <FaReceipt /> },
    { key: "confirmed", label: "Confirmed", subLabel: "Confirmed", icon: <FaCheckCircle /> },
    { key: "cooking", label: "Cooking", subLabel: "In Kitchen", icon: <FaUtensils /> },
    { key: "ready", label: "Ready", subLabel: "Ready for Pickup", icon: <FaBoxOpen /> },
    { key: "assigned", label: "Assigned", subLabel: "Driver Assigned", icon: <FaMotorcycle /> },
    { key: "accepted", label: "Accepted", subLabel: "Driver Accepted", icon: <FaMotorcycle /> },
    { key: "out_for_delivery", label: "Out for Delivery", subLabel: "Out for Delivery", icon: <FaMotorcycle /> },
    { key: "arrived", label: "Arrived", subLabel: "Driver Arrived", icon: <FaMapMarkerAlt /> },
    { key: "otp_handover", label: "OTP Handover", subLabel: "OTP Handover", icon: <FaShieldAlt /> },
    { key: "delivered", label: "Delivered", subLabel: "Delivered", icon: <FaCheckCircle /> }
];

export const getOrderTrackingStageIndex = (order) => {
    if (!order) return 0;
    const orderStatus = (order.orderStatus || "").toLowerCase();
    const deliveryStatus = (order.deliveryStatus || order.delivery?.status || "").toLowerCase();
    const hasPartner = Boolean(
        order.deliveryPartner ||
        order.deliveryPartnerId ||
        order.delivery?.deliveryPartner ||
        order.delivery?.deliveryPartnerId
    );

    // Stage 10: Delivered
    if (orderStatus === "delivered" || deliveryStatus === "delivered") {
        return 9;
    }

    // Stage 9: OTP Handover (Rider has arrived at customer location)
    if (deliveryStatus === "arrived at customer") {
        return 8;
    }

    // Stage 7: Out for Delivery
    if (
        deliveryStatus === "going to customer" ||
        deliveryStatus === "order picked up" ||
        orderStatus === "out for delivery"
    ) {
        return 6;
    }

    // Stage 6: Driver Accepted
    if (
        deliveryStatus === "accepted" ||
        deliveryStatus === "going to restaurant" ||
        deliveryStatus === "arrived at restaurant"
    ) {
        return 5;
    }

    // Stage 5: Driver Assigned
    if (
        deliveryStatus === "assigned" ||
        (hasPartner && (orderStatus === "ready for pickup" || orderStatus === "preparing"))
    ) {
        return 4;
    }

    // Stage 4: Ready for Pickup
    if (orderStatus === "ready for pickup") {
        return 3;
    }

    // Stage 3: Cooking in Kitchen
    if (orderStatus === "preparing") {
        return 2;
    }

    // Stage 2: Confirmed
    if (orderStatus === "confirmed") {
        return 1;
    }

    // Stage 1: Order Placed
    return 0;
};

const HorizontalOrderTimeline = ({ order, compact = false, showDetails = true }) => {
    if (!order) return null;

    const currentStageIndex = getOrderTrackingStageIndex(order);
    const isDelivered = currentStageIndex === 9;

    // Resolve assigned delivery partner info
    const partner =
        order.deliveryPartner ||
        order.deliveryPartnerId ||
        order.delivery?.deliveryPartner ||
        order.delivery?.deliveryPartnerId ||
        null;

    const partnerName =
        (typeof partner === "object" && partner !== null ? partner.name : null) ||
        null;

    const estimatedMins = order.estimatedDeliveryTime || 30;

    return (
        <div className={`hot-timeline-wrapper ${compact ? "compact-mode" : ""}`}>
            {/* Header info badge bar */}
            <div className="hot-meta-bar">
                <div className="hot-eta-badge">
                    <FaClock className="hot-eta-icon" />
                    <span>
                        Estimated Delivery: <strong>~{estimatedMins} mins</strong>
                    </span>
                </div>

                <div className={`hot-driver-badge ${partnerName ? "assigned" : "unassigned"}`}>
                    <FaMotorcycle className="hot-driver-icon" />
                    {partnerName ? (
                        <span>
                            Delivery Partner: <strong>{partnerName}</strong>
                            {partner.phone && (
                                <a
                                    href={`tel:${partner.phone}`}
                                    className="hot-driver-call-link"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Call Delivery Partner"
                                >
                                    <FaPhoneAlt size={10} /> Call
                                </a>
                            )}
                        </span>
                    ) : (
                        <span>Delivery Partner: <em>Not assigned yet</em></span>
                    )}
                </div>
            </div>

            {/* Scrollable horizontal progress track */}
            <div className="hot-scroll-container">
                <div className="hot-track-line">
                    {TRACKING_STAGES.map((stage, idx) => {
                        const isCompleted = isDelivered ? true : idx < currentStageIndex;
                        const isCurrent = !isDelivered && idx === currentStageIndex;
                        const isUpcoming = !isDelivered && idx > currentStageIndex;

                        // Connector line segment to the next node
                        const isLineActive = isDelivered || idx < currentStageIndex;

                        return (
                            <div key={stage.key} className="hot-step-cell">
                                {/* Connecting line to previous node */}
                                {idx > 0 && (
                                    <div
                                        className={`hot-connector-line ${
                                            isLineActive ? "active" : "inactive"
                                        }`}
                                    />
                                )}

                                <div
                                    className={`hot-node-circle ${
                                        isCompleted
                                            ? "node-completed"
                                            : isCurrent
                                            ? "node-current"
                                            : "node-upcoming"
                                    }`}
                                >
                                    {isCompleted ? <FaCheckCircle /> : stage.icon}
                                    {isCurrent && <span className="hot-node-pulse" />}
                                </div>

                                <div
                                    className={`hot-label-wrap ${
                                        isCompleted
                                            ? "label-completed"
                                            : isCurrent
                                            ? "label-current"
                                            : "label-upcoming"
                                    }`}
                                >
                                    <span className="hot-step-title">{stage.label}</span>
                                    {showDetails && (
                                        <small className="hot-step-sub">{stage.subLabel}</small>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HorizontalOrderTimeline;
