import axios from "axios";
import { API_BASE_URL, API_URL, getFoodImageUrl } from "../config/api";

export { API_BASE_URL, API_URL, getFoodImageUrl };

// Create configured Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach JWT token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to format errors nicely
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Something went wrong. Please try again.";
        return Promise.reject(new Error(message));
    }
);

// ==============================
// AUTH API
// ==============================
export const authAPI = {
    register: (userData) => api.post("/api/auth/register", userData),
    login: (credentials) => api.post("/api/auth/login", credentials),
    firebaseLogin: (idToken) => api.post("/api/auth/login", { idToken }),
    logout: () => api.post("/api/auth/logout"),
    getProfile: () => api.get("/api/auth/profile"),
    updateProfile: (profileData) => api.put("/api/auth/profile", profileData),
    changePassword: (passwordData) => api.put("/api/auth/change-password", passwordData),
    toggleFavorite: (foodId) => api.post("/api/auth/favorites/toggle", { foodId }),
    getAddresses: () => api.get("/api/auth/addresses"),
    addAddress: (addressData) => api.post("/api/auth/addresses", addressData),
    updateAddress: (addressId, addressData) => api.put(`/api/auth/addresses/${addressId}`, addressData),
    setDefaultAddress: (addressId) => api.put(`/api/auth/addresses/${addressId}/default`),
    deleteAddress: (addressId) => api.delete(`/api/auth/addresses/${addressId}`)
};

// ==============================
// FOOD API
// ==============================
export const foodAPI = {
    getAllFoods: (params = {}) => api.get("/api/foods", { params }),
    getCategories: (params = {}) => api.get("/api/foods/categories", { params }),
    getFoodById: (id) => api.get(`/api/foods/${id}`),
    searchFoods: (keyword) => api.get("/api/foods/search", { params: { keyword } }),
    getFeaturedFoods: () => api.get("/api/foods/featured"),
    getPopularFoods: () => api.get("/api/foods/popular"),
    getLatestFoods: () => api.get("/api/foods/latest"),
    getByCategory: (category, params = {}) => api.get(`/api/foods/category/${encodeURIComponent(category)}`, { params }),
    getRelatedFoods: (id) => api.get(`/api/foods/${id}/related`),
    getReviews: (foodId) => api.get(`/api/foods/${foodId}/reviews`),
    addReview: (foodId, reviewData) => api.post(`/api/foods/${foodId}/reviews`, reviewData)
};

// ==============================
// CART API
// ==============================
export const cartAPI = {
    getCart: () => api.get("/api/cart"),
    addToCart: (item) => api.post("/api/cart/add", item),
    updateCartItem: (id, quantity) => api.put(`/api/cart/${id}`, { quantity }),
    removeCartItem: (id) => api.delete(`/api/cart/${id}`),
    clearCart: () => api.delete("/api/cart/clear/all")
};

// ==============================
// ORDER API
// ==============================
export const orderAPI = {
    placeOrder: (orderData) => api.post("/api/orders", orderData),
    getMyOrders: () => api.get("/api/orders/my-orders"),
    getOrderById: (id) => api.get(`/api/orders/${id}`),
    cancelOrder: (id) => api.put(`/api/orders/${id}/cancel`)
};

// ==============================
// ADMIN API
// ==============================
export const adminAPI = {
    getDashboard: () => api.get("/api/admin/dashboard"),
    getFoods: () => api.get("/api/admin/foods"),
    addFood: (formData) => api.post("/api/foods", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    updateFood: (id, formData) => api.put(`/api/foods/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    deleteFood: (id) => api.delete(`/api/foods/${id}`),
    getOrders: () => api.get("/api/admin/orders"),
    updateOrderStatus: (id, orderStatus) => api.put(`/api/admin/orders/${id}/status`, { orderStatus }),
    deleteOrder: (id) => api.delete(`/api/admin/orders/${id}`),
    getUsers: () => api.get("/api/admin/users"),
    getFirebaseUsers: () => api.get("/api/admin/firebase/users"),
    toggleBlockUser: (id) => api.put(`/api/admin/users/${id}/block`),
    changeUserRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    // Restaurant Management for Admin
    getRestaurants: (params = {}) => api.get("/api/admin/restaurants", { params }),
    getRestaurantById: (id) => api.get(`/api/admin/restaurants/${id}`),
    approveRestaurant: (id) => api.put(`/api/admin/restaurants/${id}/approve`),
    rejectRestaurant: (id, reason) => api.put(`/api/admin/restaurants/${id}/reject`, { reason }),
    suspendRestaurant: (id, reason) => api.put(`/api/admin/restaurants/${id}/suspend`, { reason }),
    activateRestaurant: (id) => api.put(`/api/admin/restaurants/${id}/activate`)
};

// ==============================
// RESTAURANT PARTNER API
// ==============================
export const restaurantAPI = {
    register: (data) => api.post("/api/restaurant/register", data),
    getMyRestaurant: () => api.get("/api/restaurant/me"),
    updateMyRestaurant: (data) => api.put("/api/restaurant/me", data),
    getDashboard: () => api.get("/api/restaurant/dashboard"),
    getOrders: (params = {}) => api.get("/api/restaurant/orders", { params }),
    getOrderById: (id) => api.get(`/api/restaurant/orders/${id}`),
    updateOrderStatus: (id, orderStatus) => api.put(`/api/restaurant/orders/${id}/status`, { orderStatus }),
    acceptOrder: (id) => api.put(`/api/restaurant/orders/${id}/accept`),
    rejectOrder: (id) => api.put(`/api/restaurant/orders/${id}/reject`),
    prepareOrder: (id) => api.put(`/api/restaurant/orders/${id}/preparing`),
    readyOrder: (id) => api.put(`/api/restaurant/orders/${id}/ready`),
    getFoods: () => api.get("/api/restaurant/menu"),
    getMenu: () => api.get("/api/restaurant/menu"),
    addFood: (formData) => api.post("/api/restaurant/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    updateFood: (id, formData) => api.put(`/api/restaurant/menu/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    deleteFood: (id) => api.delete(`/api/restaurant/menu/${id}`),
    updateFoodStock: (id, stockData) => api.put(`/api/restaurant/menu/${id}/stock`, stockData),
    toggleAvailability: (id) => api.put(`/api/restaurant/foods/${id}/availability`),
    getAnalytics: () => api.get("/api/restaurant/analytics"),
    getReviews: () => api.get("/api/restaurant/reviews")
};

// ==============================
// DELIVERY API
// ==============================
export const deliveryAPI = {
    getOrders: () => api.get("/api/delivery/orders"),
    updateDeliveryStatus: (id, orderStatus) => api.put(`/api/delivery/orders/${id}/status`, { orderStatus })
};

export const walletAPI = {
    addMoney: (amount, paymentMethod) => api.post("/api/wallet/add-money", { amount, paymentMethod }),
    getWalletDetails: () => api.get("/api/wallet/details"),
    getTransactions: () => api.get("/api/wallet/transactions")
};

// ==============================
// OFFER API
// ==============================
export const offerAPI = {
    getOffers: (params = {}) => api.get("/api/offers", { params }),
    getOfferByCode: (codeOrId) => api.get(`/api/offers/${codeOrId}`),
    validateOffer: (data) => api.post("/api/offers/validate", data),
    toggleSaveOffer: (id) => api.post(`/api/offers/${id}/save`),
    createOffer: (offerData) => api.post("/api/offers", offerData),
    updateOffer: (id, offerData) => api.put(`/api/offers/${id}`, offerData),
    deleteOffer: (id) => api.delete(`/api/offers/${id}`)
};

// ==============================
// REWARDS API
// ==============================
export const rewardAPI = {
    getProfile: () => api.get("/api/rewards"),
    getCatalog: () => api.get("/api/rewards/catalog"),
    redeemReward: (id) => api.post(`/api/rewards/${id}/redeem`),
    getRedeemedRewards: () => api.get("/api/rewards/redeemed"),
    getHistory: (params = {}) => api.get("/api/rewards/history", { params })
};

// ==============================
// SUPPORT API
// ==============================
export const supportAPI = {
    getOverview: () => api.get("/api/support/overview"),
    getFAQs: (params = {}) => api.get("/api/support/faqs", { params }),
    createTicket: (formData) => api.post("/api/support/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    getTickets: (params = {}) => api.get("/api/support/tickets", { params }),
    getTicketDetails: (id) => api.get(`/api/support/tickets/${id}`),
    replyToTicket: (id, formData) => api.post(`/api/support/tickets/${id}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),
    submitFeedback: (id, data) => api.post(`/api/support/tickets/${id}/feedback`, data),
    cancelOrder: (orderId) => api.post(`/api/support/orders/${orderId}/cancel`)
};

// ==============================
// SETTINGS API
// ==============================
export const settingsAPI = {
    getSettings: () => api.get("/api/settings"),
    updateSettings: (data) => api.put("/api/settings", data),
    updateAccount: (data) => api.put("/api/settings/account", data),
    updatePrivacy: (data) => api.put("/api/settings/privacy", data),
    updateNotifications: (data) => api.put("/api/settings/notifications", data),
    updateAppearance: (data) => api.put("/api/settings/appearance", data),
    updateAccessibility: (data) => api.put("/api/settings/accessibility", data),
    updateOrders: (data) => api.put("/api/settings/orders", data),
    updatePayments: (data) => api.put("/api/settings/payments", data),
    changePassword: (data) => api.put("/api/settings/change-password", data),
    toggleTwoFactor: (enabled) => api.post("/api/settings/two-factor", { enabled }),
    logoutOtherDevices: () => api.post("/api/settings/sessions/logout-others"),
    downloadUserData: () => api.get("/api/settings/download-data"),
    clearSearchHistory: () => api.post("/api/settings/clear-history"),
    clearRecentlyViewed: () => api.post("/api/settings/clear-viewed"),
    deactivateAccount: () => api.post("/api/settings/deactivate"),
    deleteAccount: (confirmation) => api.delete("/api/settings/delete-account", { data: { confirmation } })
};

// ==============================
// MEMBERSHIP API
// ==============================
export const membershipAPI = {
    getStatus: () => api.get("/api/membership/status"),
    subscribe: (data) => api.post("/api/membership/subscribe", data),
    toggleAutoRenew: (autoRenew) => api.put("/api/membership/auto-renew", { autoRenew }),
    cancelMembership: () => api.put("/api/membership/cancel"),
    getHistory: () => api.get("/api/membership/history"),
    getAllMemberships: () => api.get("/api/membership/admin/all")
};

export default api;

