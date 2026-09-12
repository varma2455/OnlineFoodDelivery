export const API_URL =
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API ||
    "https://onlinefooddelivery-9g60.onrender.com";

export const API_BASE_URL = API_URL;

// Helper to resolve food images cleanly (handles absolute URLs, uploaded files, and fallbacks)
export const getFoodImageUrl = (image) => {
    if (!image) {
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900";
    }
    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }
    return `${API_BASE_URL}/uploads/${image}`;
};

export default API_URL;
