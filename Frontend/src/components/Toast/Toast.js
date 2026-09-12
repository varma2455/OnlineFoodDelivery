import React from "react";
import "./Toast.css";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function Toast({ toasts, removeToast }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-item toast-${toast.type || "info"}`}>
                    <div className="toast-icon">
                        {toast.type === "success" && <FaCheckCircle />}
                        {toast.type === "error" && <FaExclamationCircle />}
                        {toast.type === "info" && <FaInfoCircle />}
                    </div>
                    <div className="toast-message">{toast.message}</div>
                    <button
                        className="toast-close"
                        onClick={() => removeToast(toast.id)}
                        aria-label="Close notification"
                    >
                        <FaTimes />
                    </button>
                </div>
            ))}
        </div>
    );
}
