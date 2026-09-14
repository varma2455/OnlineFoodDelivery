import React, { useState, useRef, useEffect } from "react";
import { deliveryPartnerAPI } from "../../services/api";
import "./DeliveryOtpInput.css";
import { FaLock, FaCheckCircle, FaExclamationCircle, FaShieldAlt } from "react-icons/fa";

const DeliveryOtpInput = ({
    orderId,
    orderNumber,
    customerName,
    onSuccess,
    onCancel
}) => {
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(null);

    const inputRefs = useRef([]);

    useEffect(() => {
        // Auto-focus first digit on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Clear previous error
        setErrorMessage("");

        // Handle multi-character paste or input
        const numeric = value.replace(/\D/g, "");
        if (!numeric) {
            const nextDigits = [...otpDigits];
            nextDigits[index] = "";
            setOtpDigits(nextDigits);
            return;
        }

        if (numeric.length > 1) {
            // Handle paste directly into this box
            handlePasteData(numeric);
            return;
        }

        const nextDigits = [...otpDigits];
        nextDigits[index] = numeric;
        setOtpDigits(nextDigits);

        // Move focus to next box if available
        if (index < 5 && numeric) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0) {
                // Move focus to previous box
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePasteData = (pastedData) => {
        const cleaned = pastedData.replace(/\D/g, "").slice(0, 6);
        if (!cleaned) return;

        const nextDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
            nextDigits[i] = cleaned[i] || "";
        }
        setOtpDigits(nextDigits);

        const focusIndex = Math.min(cleaned.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text");
        handlePasteData(text);
    };

    const fullOtp = otpDigits.join("");
    const isComplete = fullOtp.length === 6 && /^\d{6}$/.test(fullOtp);

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!isComplete || loading) return;

        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await deliveryPartnerAPI.verifyDeliveryOtp(orderId, fullOtp);

            setIsSuccess(true);
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess(data);
                }, 1200);
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "Incorrect delivery OTP. Please ask the customer to provide the correct code.";
            setErrorMessage(msg);
            setOtpDigits(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();

            if (err.response?.data?.remainingAttempts !== undefined) {
                setRemainingAttempts(err.response.data.remainingAttempts);
            }
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="dp-otp-verified-card">
                <div className="verified-animation">
                    <FaCheckCircle className="verified-check-icon" />
                </div>
                <h3>✅ Delivery Verified</h3>
                <p className="verified-order-pill">{orderNumber || `#FE${orderId?.slice(-6).toUpperCase()}`}</p>
                <p className="verified-sub">Delivered Successfully to {customerName || "Customer"}</p>
                <div className="verified-timestamp">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
        );
    }

    return (
        <div className="dp-otp-verification-card">
            <div className="dp-otp-header">
                <div className="dp-otp-icon-wrap">
                    <FaLock />
                </div>
                <div>
                    <h3 className="dp-otp-title">Delivery Verification</h3>
                    <p className="dp-otp-subtitle">
                        Ask {customerName ? <strong>{customerName}</strong> : "the customer"} for their 6-digit FoodExpress OTP.
                    </p>
                </div>
            </div>

            <form onSubmit={handleVerify} className="dp-otp-form">
                <div className="dp-otp-inputs-row" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className={`dp-otp-digit-box ${digit ? "filled" : ""} ${errorMessage ? "error" : ""}`}
                            autoComplete="one-time-code"
                            aria-label={`Digit ${idx + 1} of 6`}
                            disabled={loading}
                        />
                    ))}
                </div>

                {errorMessage && (
                    <div className="dp-otp-error-alert" role="alert">
                        <FaExclamationCircle className="alert-icon" />
                        <div>
                            <strong>Incorrect OTP</strong>
                            <p>{errorMessage}</p>
                            {remainingAttempts !== null && remainingAttempts > 0 && (
                                <small className="attempts-warning">
                                    Remaining attempts before lockout: {remainingAttempts}
                                </small>
                            )}
                        </div>
                    </div>
                )}

                <div className="dp-otp-notice">
                    <FaShieldAlt /> Tell the customer their OTP is visible in their Order Tracker under "Delivery OTP".
                </div>

                <div className="dp-otp-actions-bar">
                    {onCancel && (
                        <button
                            type="button"
                            className="btn-dp-otp-cancel"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn-dp-otp-verify"
                        disabled={!isComplete || loading}
                    >
                        {loading ? (
                            <span className="dp-otp-spinner">Verifying OTP...</span>
                        ) : (
                            "Verify & Complete Delivery"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DeliveryOtpInput;
