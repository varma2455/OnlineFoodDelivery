# 🍔 FoodExpress — Online Food Delivery Platform (MERN Stack + Firebase Auth)

A full-stack, enterprise-grade online food delivery application inspired by industry leaders like Swiggy and Zomato. Built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js) with **Firebase Authentication + Dual-Token Backend Authorization**, featuring **4 distinct user roles**, real-time kitchen & delivery dispatch pipelines, customer storefront, and an administrative moderation and Firebase management suite.

---

## 🌟 Key Architecture & Highlights

### 🔐 1. Firebase Authentication + Multi-Role Access Control
- **Identity Provider (Firebase Auth)**:
  - Email/Password authentication & Google OAuth Sign-In with popup.
  - User identity tokens (JWT ID tokens) securely passed to backend.
  - Email verification & password reset flows via Firebase Client SDK.
- **Authoritative Data & Role Source (MongoDB)**:
  - User profiles stored in MongoDB with authoritative `role` (`customer`, `restaurant`, `delivery`, `admin`).
  - Account status tracking (`isBlocked`, `isVerified`, `wallet`, `rewardPoints`, `savedAddresses`).
  - **Backend Role-Based Authorization**: Client-supplied roles (`req.body.role` or `localStorage.role`) are NEVER trusted. Public registration strictly defaults to `customer`.
  - **Account Blocking & Revocation**: When an administrator blocks a user (`isBlocked: true`), all subsequent API calls immediately return `403 Forbidden`. The status is also synchronized to Firebase Auth (`disabled: true`).
  - **Firebase Admin SDK**: Strictly initialized on the **Backend only** (`Backend/config/firebaseAdmin.js`). Never exposed in frontend client bundles.
  - **Admin-Only Firebase Management**: Firebase Auth user operations (`/api/admin/firebase/users`) are strictly guarded by `protect, isAdmin` middleware. Non-admin roles receive `403 Forbidden`.

---

## 👥 The 4 Roles & Portals

```
               ┌────────────────────────────────────────────────────────┐
               │           FoodExpress Authentication Gateway           │
               │   (Firebase ID Token / JWT + MongoDB Role Authority)   │
               └───────────────────────────┬────────────────────────────┘
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┐
         │                  │                    │                  │
         ▼                  ▼                    ▼                  ▼
   [ CUSTOMER ]      [ RESTAURANT ]        [ DELIVERY ]         [ ADMIN ]
  Storefront & Cart    Kitchen Portal       Dispatch Hub     Super Admin Suite
  • Catalog & Search • Order Pipeline     • Assigned Orders • Analytics Stats
  • Cart & Checkout  • Status Update      • Customer Details • Food Catalog CRUD
  • Visual Tracking  • Dish Availability  • Mark Delivered  • User & Role Mgmt
  • Reviews & Wallet • Prep Time Controls • COD Settlement   • Firebase Auth Mgmt
```

### 1. 🛒 Customer (`customer`)
- **Interactive Home & Catalog**: Hero discovery banner, category carousel, chef picks, top-rated filters.
- **Advanced Food Menu (`/menu`)**: Real-time keyword search, Pure Veg / Non-Veg toggles, 4.0+ rating filters, price sliders, and smart sorting.
- **Dish Details & Reviews (`/food/:id`)**: High-res dish views, preparation indicators, customer reviews, and interactive 5-star review submission.
- **Customized Cart & Price Engine (`/cart`)**: Real-time quantity adjustments, GST calculation, free delivery over ₹500, and coupon codes (`FIRST30`, `FOOD20`).
- **Checkout (`/checkout`)**: Multi-address selector, new address entry, and payment selection (Cash on Delivery, UPI, Card, Net Banking).
- **Live Order Timeline (`/orders`)**: Visual stage tracking: $\text{Placed} \to \text{Confirmed} \to \text{Preparing} \to \text{Out for Delivery} \to \text{Delivered}$.
- **Customer Profile (`/profile`)**: Wallet balance, 10% reward points earned on orders, saved addresses manager, and profile editor.

### 2. 🍳 Restaurant Kitchen Partner (`restaurant`)
- **Dedicated Kitchen Portal (`/restaurant`)**:
  - Live orders feed for incoming, preparing, and dispatched orders.
  - One-click preparation status updates: `Confirmed` $\to$ `Preparing` $\to$ `Out for Delivery`.
  - Dish availability management: Instantly toggle dishes between **Available** and **Out of Stock**.
  - Strict role isolation: Restaurant users cannot access `/admin/*` or `/delivery/*`.

### 3. 🛵 Delivery Partner (`delivery`)
- **Dedicated Delivery Hub (`/delivery`)**:
  - Real-time queue of orders marked `Preparing` and `Out for Delivery`.
  - Customer contact details, delivery address, phone, and order item breakdowns.
  - One-click **"Mark as Delivered"** action that automatically updates the order status to `Delivered` and marks Cash on Delivery orders as `Paid`.
  - Strict role isolation: Delivery partners cannot access `/admin/*` or `/restaurant/*`.

### 4. 🛡️ Super Administrator (`admin`)
- **Admin Management Suite (`/admin`)**:
  - **Live Analytics (`/admin/dashboard`)**: Aggregated metrics for total users, catalog size, active orders, and gross revenue.
  - **Food Catalog CRUD (`/admin/foods`)**: Create new dishes with file upload or URL, edit pricing, discount rates, inventory stock, and availability.
  - **Order Pipeline (`/admin/orders`)**: Complete view of all platform orders with status advancement and cancellation.
  - **User & Role Management (`/admin/users`)**: Search across all registered users, update roles (`customer`, `restaurant`, `delivery`, `admin`), toggle account block/unblock with immediate 403 enforcement, and delete accounts.
  - **Firebase Auth Management Tab**: Dedicated view querying the Firebase Admin SDK (`/api/admin/firebase/users`) displaying Firebase UIDs, email verification status, custom claims, and disabled state.

---

## 🔒 Role & Security Access Control Matrix

| Endpoint Route / Resource | Customer | Restaurant | Delivery | Admin | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `GET /api/foods` (Catalog) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/cart` (Cart Actions) | ✅ | ✅ | ✅ | ✅ | ❌ 401 |
| `POST /api/orders` (Checkout) | ✅ | ✅ | ✅ | ✅ | ❌ 401 |
| `GET /api/orders/my-orders` | ✅ | ✅ | ✅ | ✅ | ❌ 401 |
| `GET /api/restaurant/orders` | ❌ 403 | ✅ | ❌ 403 | ✅ | ❌ 401 |
| `PUT /api/restaurant/orders/:id/status` | ❌ 403 | ✅ | ❌ 403 | ✅ | ❌ 401 |
| `PUT /api/restaurant/foods/:id/availability` | ❌ 403 | ✅ | ❌ 403 | ✅ | ❌ 401 |
| `GET /api/delivery/orders` | ❌ 403 | ❌ 403 | ✅ | ✅ | ❌ 401 |
| `PUT /api/delivery/orders/:id/status` | ❌ 403 | ❌ 403 | ✅ | ✅ | ❌ 401 |
| `GET /api/admin/*` (Dashboard, Foods, Orders, Users) | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ❌ 401 |
| `GET /api/admin/firebase/users` | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ❌ 401 |
| `PUT /api/admin/users/:id/block` | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ❌ 401 |
| `PUT /api/admin/users/:id/role` | ❌ 403 | ❌ 403 | ❌ 403 | ✅ | ❌ 401 |
| Blocked Accounts (`isBlocked: true`) | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 401 |

---

## 🔑 Demo Accounts & Credentials

The system includes pre-seeded accounts for all 4 roles:

| Role | Email | Password | Landing Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@foodexpress.com` | `adminPassword123!` | `/admin/dashboard` |
| **Customer** | `customer@foodexpress.com` | `customerPassword123!` | `/dashboard` & `/` |
| **Restaurant** | `restaurant@foodexpress.com` | `restaurantPassword123!` | `/restaurant` |
| **Delivery** | `delivery@foodexpress.com` | `deliveryPassword123!` | `/delivery` |

> [!TIP]
> On the **Login** page (`/login`), click any of the 4 quick demo pills (**Admin**, **Customer**, **Restaurant**, **Delivery**) to auto-populate credentials for instant testing!

---

## 🏗️ Folder Structure

```
OnlineFoodDelivery2/
├── Backend/
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── firebaseAdmin.js        # Firebase Admin SDK (Backend-only) with graceful offline fallback
│   ├── controllers/
│   │   ├── adminController.js      # Dashboard stats, user management, Firebase Auth users
│   │   ├── authController.js       # Register, login, profile, addresses, password reset
│   │   ├── cartController.js       # Cart CRUD with quantity & duplicate protection
│   │   ├── foodController.js       # Catalog, filters, categories aggregation, reviews
│   │   └── orderController.js      # Orders pipeline, status tracking, rewards
│   ├── middleware/
│   │   ├── authMiddleware.js       # Dual Firebase ID token + JWT verification & isBlocked check
│   │   ├── roleMiddleware.js       # Role authorization guard (customer, restaurant, delivery, admin)
│   │   ├── adminMiddleware.js      # Admin authorization guard
│   │   ├── errorMiddleware.js      # Centralized error handling
│   │   └── uploadMiddleware.js     # Multer image upload handler
│   ├── models/
│   │   ├── Food.js                 # Food item schema
│   │   ├── Order.js                # Order schema with address & tracking
│   │   ├── Review.js               # Customer food reviews & ratings schema
│   │   ├── User.js                 # User schema (firebaseUid, role, isBlocked, wallet, rewards)
│   │   └── Cart.js                 # Persistent cart model with quantity support
│   ├── routes/
│   │   ├── adminRoutes.js          # Admin dashboard, users, foods, orders, Firebase management
│   │   ├── authRoutes.js           # Auth, profile, saved addresses, password change
│   │   ├── cartRoutes.js           # Cart endpoints
│   │   ├── deliveryRoutes.js       # Delivery partner dispatch routes
│   │   ├── foodRoutes.js           # Food catalog routes
│   │   ├── orderRoutes.js          # Order placement & tracking routes
│   │   └── restaurantRoutes.js     # Restaurant kitchen orders & menu availability routes
│   ├── seed/
│   │   └── foodSeeder.js           # Database seeder for demo users and food menu
│   ├── uploads/                    # Uploaded dish images directory
│   ├── .env                        # Backend environment configuration
│   ├── package.json
│   └── server.js                   # Express server entrypoint
│
└── Frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── AdminNav/           # Admin top navigation bar
    │   │   ├── FoodCard/           # Food item card with veg indicator & counter
    │   │   ├── Navbar/             # Main navigation bar with role badges & cart counter
    │   │   ├── Toast/              # Toast notifications component
    │   │   └── ProtectedRoute.js   # Route protection for roles & blocked accounts
    │   ├── context/
    │   │   └── StoreContext.js     # Global state: Firebase Auth, User, Cart, Wishlist, Toast
    │   ├── pages/
    │   │   ├── Admin/              # AdminDashboard, FoodManagement, OrderManagement, UserManagement
    │   │   ├── Cart/               # Cart page with price breakdown
    │   │   ├── Checkout/           # Checkout with address selector
    │   │   ├── Delivery/           # Delivery partner dashboard (/delivery)
    │   │   ├── FoodDetails/        # Dish details, reviews, related foods
    │   │   ├── ForgotPassword/     # Firebase password reset
    │   │   ├── Home/               # Customer landing page
    │   │   ├── Login/              # Login with Firebase, Google Sign-In, and 4-role demo pills
    │   │   ├── Menu/               # Food catalog with filters
    │   │   ├── Orders/             # Customer order tracking
    │   │   ├── Profile/            # Customer profile, wallet, saved addresses
    │   │   ├── Register/           # Registration with Firebase (enforces customer role)
    │   │   └── Restaurant/         # Restaurant kitchen dashboard (/restaurant)
    │   ├── services/
    │   │   └── api.js              # Centralized Axios client with automatic Bearer token
    │   ├── firebase.js             # Firebase Client SDK initialization
    │   ├── App.js                  # Routing table with ProtectedRoute for all 4 roles
    │   ├── index.js                # React entrypoint
    │   ├── .env                    # Frontend environment configuration
    │   └── package.json
```

---

## ⚙️ Environment Configuration

### Backend (`Backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/online_food_delivery
JWT_SECRET=foodexpress_secret_jwt_key_2025
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Firebase Admin SDK Configuration (Backend-Only)
# Note: Graceful offline fallback mode is enabled if credentials are not provided.
FIREBASE_PROJECT_ID=foodexpress-cc86b
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Frontend (`Frontend/.env`)
```env
REACT_APP_API=http://localhost:5000

# Firebase Client SDK Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyB63dXav-PnSWkqlbrjpyrWllCbCkEl1uM
REACT_APP_FIREBASE_AUTH_DOMAIN=foodexpress-cc86b.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=foodexpress-cc86b
REACT_APP_FIREBASE_STORAGE_BUCKET=foodexpress-cc86b.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=192471303769
REACT_APP_FIREBASE_APP_ID=1:192471303769:web:5039d8de6cb90a9bb91348
REACT_APP_FIREBASE_MEASUREMENT_ID=G-X39YBYYDBB
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or v20+)
- **MongoDB** running locally on port `27017` (or provide a remote MongoDB URI in `Backend/.env`)

### 2. Start the Backend Server
```bash
cd Backend
npm install
npm start
```
The server will start on **http://localhost:5000**.
Health check: `curl http://localhost:5000/api/health`

### 3. Start the Frontend Application
```bash
cd Frontend
npm install
npm start
```
The React development server will start on **http://localhost:3000**.

### 4. Build Frontend for Production
```bash
cd Frontend
npm run build
```
Builds an optimized, production-ready static bundle in `Frontend/build`.

---

## 🧪 Automated Testing & Verification

The project includes an end-to-end automated integration and role security verification suite testing all 4 roles, boundary controls, and user blocking:

```bash
node /home/kali2455/.gemini/antigravity-cli/brain/2bb7f1cd-012a-4a6a-b8ec-24dd746feeda/scratch/e2eRoleIntegrationTest.js
```

### Test Coverage (37/37 Tests Passed — 100% Success):
- **Customer Workflow**: Authentication, profile retrieval, food browsing, cart add, cart fetch, checkout & order placement, order history, and boundary checks (`403` on `/api/admin/*`, `/api/restaurant/*`, `/api/delivery/*`).
- **Restaurant Workflow**: Authentication, orders pipeline retrieval, status update (`Preparing`), food item availability toggling, and boundary check (`403` on `/api/admin/*`).
- **Delivery Workflow**: Authentication, assigned orders list, status update (`Delivered`) with automated COD payment status settlement (`Paid`), and boundary check (`403` on `/api/admin/*`).
- **Admin Workflow**: Authentication, live statistics, full user management list, Firebase Auth user management API, and boundary check (`403` on non-admin calls to Firebase API).
- **Security & Blocking Controls**: Public registration role injection defense (`role: admin` strictly ignored and set to `customer`), immediate `403 Forbidden` rejection on blocked accounts, administrative role promotion, and access restoration upon unblocking.
