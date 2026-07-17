# My Bakery — Codebase Context

## Project Overview

**My Bakery** is a full-stack premium bakery e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). It supports product browsing, cart management, order placement with custom delivery preferences, dual payment gateways, a customer dashboard, and a full admin panel.

---

## Tech Stack

### Backend (`/server`)
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (Bearer token + HttpOnly cookie) |
| Image Storage | Cloudinary |
| File Upload | Multer (memory storage) |
| Payments | Stripe + Razorpay |
| Email | Nodemailer (SMTP) |
| Security | Helmet, express-mongo-sanitize, HPP, express-rate-limit |
| Logging | Morgan |

### Frontend (`/client`)
| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion + GSAP |
| Forms | React Hook Form + Yup |
| HTTP Client | Axios (with interceptors) |
| Charts | Recharts |
| Slider | Swiper |
| Notifications | React Hot Toast |
| Icons | React Icons |
| Payment UI | @stripe/react-stripe-js |

---

## Repository Structure

```
My_Backery/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── App.jsx           # Root router
│       ├── main.jsx          # Entry — wraps providers
│       ├── context/          # Global state (Auth, Cart, Theme)
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level pages
│       ├── services/         # Axios API call modules
│       └── utils/            # Helper functions
└── server/                  # Express backend
    ├── server.js             # Entry point, middleware, routes
    ├── config/               # DB + Cloudinary config
    ├── controllers/          # Business logic handlers
    ├── middleware/           # Auth, error, upload
    ├── models/               # Mongoose schemas
    ├── routes/               # Express route definitions
    └── utils/                # Email utilities
```

---

## Backend

### Entry Point (`server/server.js`)
- Connects to MongoDB via `config/db.js`
- Applies security middleware stack: `helmet`, `express-mongo-sanitize`, `hpp`
- Global rate limiter: **200 req / 15 min** per IP on `/api/`
- Auth-specific limiter: **20 req / 15 min** on `/api/auth/`
- CORS configured for `CLIENT_URL` (default `http://localhost:5173`)
- Serves static files from `/uploads`
- Health check endpoint: `GET /api/health`

### API Routes

| Prefix | Module | Auth Required |
|---|---|---|
| `/api/auth` | authRoutes | Mixed |
| `/api/products` | productRoutes | Public read, Admin write |
| `/api/categories` | categoryRoutes | Public read, Admin write |
| `/api/orders` | orderRoutes | User (own), Admin (all) |
| `/api/payments` | paymentRoutes | User |
| `/api/users` | userRoutes | User (profile/cart), Admin (management) |
| `/api/reviews` | reviewRoutes | Public read, User write, Admin manage |
| `/api/coupons` | couponRoutes | User validate, Admin CRUD |
| `/api/admin` | adminRoutes | Admin only |

### Auth Routes (`/api/auth`)
```
POST   /register              — Create account (triggers welcome email)
POST   /login                 — Returns JWT + user payload
POST   /logout                — Clears token cookie
GET    /me                    — Get current user
PUT    /update-password       — Change password (protected)
POST   /forgot-password       — Send reset email (15-min token)
PUT    /reset-password/:token — Apply new password
GET    /verify-email/:token   — Email verification (24-hr token)
```

### Product Routes (`/api/products`)
```
GET    /                      — List products (public, filterable)
GET    /featured              — Featured products
GET    /:idOrSlug             — Single product by ID or slug
GET    /:id/related           — Related products
POST   /                      — Create product (admin, multipart)
PUT    /:id                   — Update product (admin, multipart)
DELETE /:id                   — Delete product (admin)
```

### Order Routes (`/api/orders`)
```
POST   /                      — Create order
GET    /my                    — My orders (user)
GET    /:id                   — Single order
PUT    /:id/cancel            — Cancel order (user)
GET    /                      — All orders (admin)
PUT    /:id/status            — Update status (admin)
```

### Payment Routes (`/api/payments`)
```
POST   /stripe/create-intent  — Create Stripe PaymentIntent
POST   /stripe/confirm        — Confirm Stripe payment
POST   /stripe/webhook        — Stripe webhook (raw body)
POST   /razorpay/create-order — Create Razorpay order
POST   /razorpay/verify       — Verify Razorpay signature
```

### User / Cart Routes (`/api/users`)
```
GET/PUT  /profile             — View & update profile (avatar upload)
GET/POST /addresses           — Manage saved addresses
PUT/DEL  /addresses/:id       — Edit/remove specific address
GET/POST /wishlist            — View wishlist / toggle product
GET      /cart                — Fetch cart
POST     /cart                — Add item to cart
PUT      /cart/:itemId        — Update cart item quantity
DELETE   /cart/:itemId        — Remove cart item
DELETE   /cart                — Clear entire cart
GET      /                    — List all users (admin)
PUT      /:id/role            — Change user role (admin)
PUT      /:id/deactivate      — Deactivate user (admin)
```

---

## Data Models

### User
- Fields: `name`, `email`, `password` (bcrypt, 12 rounds), `phone`, `avatar` (Cloudinary), `role` (user | admin), `addresses[]`, `wishlist[]`
- Auth tokens: `resetPasswordToken`, `emailVerifyToken`, `refreshToken` (all `select: false`)
- Methods: `comparePassword`, `getResetPasswordToken` (15 min), `getEmailVerifyToken` (24 hr)

### Product
- Fields: `name`, `slug` (auto-generated), `description`, `shortDesc`, `price`, `discountPrice`, `images[]` (Cloudinary), `category` (ref), `tags[]`, `ingredients[]`, `allergens[]`
- Inventory: `stock`, `minOrderQty`, `maxOrderQty`, `isAvailable`
- Flags: `isFeatured`, `isBestseller`, `isNew`
- Customization: `customizable`, `flavors[]`, `sizes[]` (name + price)
- Virtuals: `discountPercent`, `effectivePrice`
- Text indexes on `name`, `description`, `tags`

### Order
- Fields: `orderNumber` (auto: `BKY-{timestamp}-{random}`), `user`, `items[]`, `shippingAddress`
- Pricing: `itemsPrice`, `taxPrice`, `shippingPrice`, `discountAmount`, `totalPrice`
- Payment: `paymentMethod` (stripe | razorpay | cod), `paymentStatus` (pending | paid | failed | refunded)
- Delivery: `deliveryDate`, `deliveryTime`, `specialInstructions`
- Status flow: `pending → confirmed → preparing → out_for_delivery → delivered | cancelled`
- `statusHistory[]` tracks all transitions with timestamps and notes

### Cart
- One cart per user (unique user ref)
- Items: `product`, `quantity`, `price`, `flavor`, `size`, `specialNote`
- Supports coupon association
- Virtuals: `totalItems`, `subtotal`

### Coupon
- `discountType`: `percentage` | `fixed`
- Validity: `validFrom` / `validTo` date range
- Usage controls: `usageLimit` (global), `userUsageLimit` (per user), `usedBy[]`
- Scope: `applicableProducts[]`, `applicableCategories[]`
- Virtual `isValid` checks active + date range + usage limit

### Review
- One review per user per product (compound unique index)
- Fields: `rating` (1–5), `title`, `comment`, `images[]`, `isVerifiedPurchase`, `isApproved`
- Static `calcRatings()` aggregation auto-updates product `ratings` and `numReviews` on save/remove

### Category
- Fields: `name`, `slug` (auto-generated), `description`, `image`, `isActive`, `sortOrder`
- Virtual `productCount` via populate

---

## Middleware

### `auth.js`
- `protect` — Extracts JWT from `Authorization: Bearer` header or `token` cookie; attaches `req.user`
- `authorize(...roles)` — Role-based access guard
- `generateToken(id)` — Signs JWT with `JWT_SECRET` (default 30d expiry)
- `sendTokenResponse` — Sets HttpOnly cookie + returns JSON with token and user data

### `upload.js`
- Multer with **memory storage** (buffers fed directly to Cloudinary)
- Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- Max file size: **5 MB**

### `error.js`
- Custom `AppError` class (extends Error) with `statusCode` and `isOperational` flag
- Global error handler catches Mongoose validation errors, cast errors, duplicate key errors, JWT errors

---

## Frontend

### Dev Server
- Port: **5173** (Vite)
- API proxy: `/api` → `http://localhost:5000`
- Path alias: `@` → `./src`

### Routing (`App.jsx`)
All routes wrapped in `<AnimatePresence mode="wait">` for page transitions.

**Public routes** (inside `<Layout>`):
- `/` — Home
- `/products` — Product listing
- `/products/:idOrSlug` — Product detail
- `/order-from-here` — Custom order form
- `/contact` — Contact page
- `/login`, `/register`, `/forgot-password`, `/reset-password/:token`

**Protected user routes** (via `<ProtectedRoute>`):
- `/cart`, `/checkout`
- `/orders/:id` — Order tracking
- `/dashboard` — User dashboard
- `/dashboard/profile`, `/dashboard/orders`, `/dashboard/wishlist`, `/dashboard/addresses`, `/dashboard/settings`

**Admin routes** (via `<AdminRoute>`):
- `/admin` — Dashboard with stats
- `/admin/products`, `/admin/categories`, `/admin/orders`
- `/admin/users`, `/admin/coupons`, `/admin/reviews`, `/admin/analytics`

### Global State (Context API)

| Context | Key State | Key Actions |
|---|---|---|
| `AuthContext` | `user`, `loading`, `isAuthenticated`, `isAdmin` | `login`, `register`, `logout`, `updateUser` |
| `CartContext` | `cart`, `cartCount`, `subtotal`, `loading` | `addToCart`, `updateItem`, `removeItem`, `clearCart`, `refetchCart` |
| `ThemeContext` | `isDark` | `toggleTheme` (persisted to `localStorage`) |

Auth state is persisted in `localStorage` under keys `bakery_token` and `bakery_user`. Token verified on mount via `GET /api/auth/me`.

### API Service Layer (`services/`)

| Service Module | Responsibilities |
|---|---|
| `api.js` | Axios instance; request interceptor adds `Bearer` token; response interceptor handles 401 → redirect to `/login` |
| `authService.js` | register, login, logout, getMe, updatePassword, forgotPassword, resetPassword, verifyEmail |
| `productService.js` | getProducts, getProduct, getFeaturedProducts, getRelatedProducts |
| `index.js` | orderService, cartService, couponService, paymentService, reviewService, userService, adminService |

### Component Structure

```
components/
├── common/
│   ├── AdminRoute.jsx      — Admin-only route guard
│   ├── ProtectedRoute.jsx  — Auth-required route guard
│   ├── Button.jsx          — Reusable button
│   ├── Input.jsx           — Reusable input
│   ├── Loader.jsx          — Loading spinner
│   ├── Modal.jsx           — Dialog modal
│   ├── Pagination.jsx      — Page pagination
│   ├── Skeleton.jsx        — Loading skeleton
│   └── StarRating.jsx      — Star rating display
├── home/
│   ├── HeroSection.jsx
│   ├── FeaturedProducts.jsx
│   ├── CategoriesSection.jsx
│   ├── StatsSection.jsx
│   ├── TestimonialsSection.jsx
│   └── WhyChooseUs.jsx
├── layout/
│   ├── Layout.jsx          — Main shell (Navbar + Footer + Outlet)
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── DashboardLayout.jsx — User dashboard sidebar layout
│   └── AdminLayout.jsx     — Admin panel sidebar layout
└── products/
    └── ProductCard.jsx
```

---

## Email Notifications (`utils/emailUtils.js`)

Sent via Nodemailer (SMTP). Three HTML templates:

| Template | Trigger | Expiry |
|---|---|---|
| `welcome` | On registration | Verify link: 24 hours |
| `resetPassword` | Forgot password request | Reset link: 15 minutes |
| `orderConfirmation` | Order placed | — |

---

## Image Management

- All uploads go through Multer memory storage → directly uploaded to **Cloudinary**
- Stored with `quality: auto`, `fetch_format: auto`, max dimension 1000×1000 (crop: limit)
- Cloudinary folder: `mybakery` (default)
- `public_id` stored on each document for targeted deletion

---

## Security Measures

| Measure | Implementation |
|---|---|
| NoSQL Injection | `express-mongo-sanitize` |
| HTTP Parameter Pollution | `hpp` |
| Security Headers | `helmet` |
| Rate Limiting | `express-rate-limit` (global + stricter auth) |
| Password Hashing | `bcryptjs` (12 rounds) |
| JWT | Signed with `JWT_SECRET`, 30d default, HttpOnly cookie |
| CORS | Restricted to `CLIENT_URL` |
| File Upload | MIME whitelist, 5 MB limit |
| XSS | `xss-clean` |

---

## Environment Variables

### Server (`.env`)
```
NODE_ENV
PORT
MONGO_URI
JWT_SECRET
JWT_EXPIRE
COOKIE_EXPIRE
CLIENT_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

### Client (`.env`)
```
VITE_API_URL        — Backend base URL (default: /api via proxy)
```

---

## Development Scripts

### Server
```bash
npm run dev     # nodemon server.js
npm start       # node server.js
```

### Client
```bash
npm run dev     # vite dev server (port 5173)
npm run build   # production build → dist/
npm run preview # preview production build
```

---

## Key Design Patterns

- **MERN full-stack** with clear separation of concerns
- **Controller–Route–Model** pattern on the backend
- **Context API** for global state (no Redux)
- **Axios service layer** abstracts all API calls from UI components
- **Optimistic UI** with React Hot Toast feedback on cart/auth actions
- **Compound indexes** on Product (category + flags) and Review (product + user)
- **Virtual fields** for computed values (discountPercent, effectivePrice, subtotal, isValid)
- **Pre/post hooks** for slug generation, password hashing, and review rating aggregation
- **Dual payment gateway** (Stripe + Razorpay) with webhook support for Stripe
- **Role-based access** (user | admin) enforced at both route and UI level
