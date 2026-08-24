# My Bakery Application Flowchart

This document describes the runtime flow of the MERN application. The diagrams use Mermaid and can be previewed in VS Code or rendered by any Mermaid-compatible Markdown viewer.

## 1. System Flow

```mermaid
flowchart LR
    Browser[Customer or admin browser]
    Entry[client/src/main.jsx\nReact providers]
    Router[client/src/App.jsx\nReact Router]
    Guard{Route guard}
    UI[Pages and reusable components]
    State[AuthContext\nCartContext\nThemeContext]
    API[Axios client\n/api proxy or VITE_API_URL\nJWT and cookie credentials]

    Browser --> Entry --> Router
    Router --> Guard
    Guard -->|Public| UI
    Guard -->|Authenticated user| UI
    Guard -->|Authenticated admin| UI
    UI <--> State
    UI --> API

    API --> Server[server/server.js\nExpress application]
    Server --> Middleware[Security, CORS, compression, logging,\nbody parsing, rate limits]
    Middleware --> Routes[API route modules]
    Routes --> Auth[auth routes]
    Routes --> Catalog[products and categories]
    Routes --> Commerce[cart, orders, coupons]
    Routes --> Account[users and reviews]
    Routes --> Payments[payment routes]
    Routes --> Admin[admin dashboard routes]

    Auth --> Controllers[Controllers and middleware]
    Catalog --> Controllers
    Commerce --> Controllers
    Account --> Controllers
    Payments --> Controllers
    Admin --> Controllers
    Controllers --> Mongo[(MongoDB via Mongoose)]
    Controllers --> External[Cloudinary\nStripe\nRazorpay\nSMTP email]
    Server --> Uploads[/uploads static files/]
    Controllers --> Errors[Global error handler]
```

## 2. Request Lifecycle

```mermaid
flowchart TD
    Start[User action or page load] --> Service[client/src/services\nAPI service function]
    Service --> Axios[Axios request interceptor]
    Axios --> Token{JWT in localStorage?}
    Token -->|Yes| Header[Add Authorization: Bearer token]
    Token -->|No| Send[Send request with cookie credentials]
    Header --> Send
    Send --> Vite[Vite dev proxy\n/api -> localhost:5000]
    Vite --> Express[Express app]
    Express --> Limits[Rate limit and common middleware]
    Limits --> Prefix{API prefix}
    Prefix --> Route[Matching route handler]
    Route --> AuthCheck{Protected or admin route?}
    AuthCheck -->|No| Controller[Controller]
    AuthCheck -->|Protected| Protect[protect\nread JWT or token cookie]
    Protect --> UserCheck{Valid token?}
    UserCheck -->|No| Unauthorized[401 response]
    UserCheck -->|Yes| RoleCheck{Admin role required?}
    RoleCheck -->|No| Controller
    RoleCheck -->|Yes and admin| Controller
    RoleCheck -->|Yes and not admin| Forbidden[403 response]
    Controller --> Database[(Mongoose models and MongoDB)]
    Controller --> Services[Cloudinary, payment gateway, or email]
    Controller --> Response[JSON response]
    Database --> Response
    Services --> Response
    Response --> AxiosResponse[Axios response interceptor]
    AxiosResponse -->|401| Clear[Clear local auth and redirect to /login]
    AxiosResponse -->|Other response| Update[Update context or local page state]
    Update --> Render[Render UI and toast feedback]
    Unauthorized --> AxiosResponse
    Forbidden --> AxiosResponse
    Controller -->|Error| ErrorHandler[Global error handler]
    ErrorHandler --> AxiosResponse
```

## 3. Customer Purchase Flow

```mermaid
flowchart TD
    Visit[Visit home or products] --> Browse[Browse, filter, or search products]
    Browse --> Detail[Open product detail]
    Detail --> Reviews[Read product reviews and related products]
    Detail --> LoginNeeded{Signed in?}
    LoginNeeded -->|No| SignIn[Login or register]
    SignIn --> Authenticated[AuthContext stores JWT and user]
    LoginNeeded -->|Yes| Authenticated
    Authenticated --> Add[Choose quantity, flavor, size, notes]
    Add --> CartAPI[POST /api/users/cart]
    CartAPI --> CartDB[(Cart document)]
    CartDB --> Cart[Cart page and CartContext]
    Cart --> Coupon{Apply coupon?}
    Coupon -->|Yes| Validate[POST /api/coupons/validate]
    Validate --> Cart
    Coupon -->|No| Checkout[Checkout page]
    Cart --> Checkout
    Checkout --> Details[Shipping address, delivery date/time, instructions]
    Details --> Create[POST /api/orders]
    Create --> Reprice[Server validates products and stock\ncalculates discount, tax, shipping, total]
    Reprice --> OrderDB[(Order document)]
    Reprice --> Stock[Deduct Product.stock]
    Reprice --> ClearCart[Clear Cart.items]
    Reprice --> Email[Send confirmation email\nnon-blocking]
    OrderDB --> Method{Payment method}
    Method -->|Cash on delivery| Pending[Order pending]
    Method -->|Stripe| StripeIntent[Create PaymentIntent]
    StripeIntent --> StripeConfirm[Client confirms payment\nthen server confirms payment]
    Method -->|Razorpay| RazorOrder[Create Razorpay order]
    RazorOrder --> RazorVerify[Client payment then\nserver verifies HMAC signature]
    StripeConfirm --> Paid[Payment paid\norder confirmed]
    RazorVerify --> Paid
    Pending --> Track[Order tracking]
    Paid --> Track
    Track --> Status[Admin updates status history]
    Status --> Delivered[Delivered]
    Track --> Cancel{Customer cancels\nwhile pending or confirmed?}
    Cancel -->|Yes| Restore[Restore stock and mark cancelled]
    Cancel -->|No| Status
```

## 4. Authentication and Account Flow

```mermaid
flowchart TD
    Start[Open app] --> Stored{bakery_token exists?}
    Stored -->|No| Guest[Guest session]
    Stored -->|Yes| Me[GET /api/auth/me]
    Me --> Valid{Token valid?}
    Valid -->|Yes| Session[AuthContext user session]
    Valid -->|No| Clear[Remove stored token and user]
    Guest --> Login[Login or register]
    Login --> Credentials[POST /api/auth/login or /register]
    Credentials --> Token[JWT response plus HttpOnly token cookie]
    Token --> Session
    Session --> Access{Requested area}
    Access -->|Public| Public[Catalog and content]
    Access -->|User| UserGuard[ProtectedRoute]
    Access -->|Admin| AdminGuard[AdminRoute]
    UserGuard --> Dashboard[Profile, orders, wishlist, addresses, settings]
    AdminGuard --> Admin[Admin dashboard and management pages]
    Login --> Forgot[Forgot password]
    Forgot --> Email[Reset email]
    Email --> Reset[Reset password with token]
    Reset --> Session
    Session --> Logout[POST /api/auth/logout]
    Logout --> Clear
```

## 5. Route and Domain Inventory

| Client area | API prefix | Main responsibility | Persistence or integration |
|---|---|---|---|
| Home, products, product detail | `/api/products`, `/api/categories`, `/api/reviews` | Catalog, featured items, related items, reviews | `Product`, `Category`, `Review`; Cloudinary for images |
| Login and account recovery | `/api/auth` | Register, login, session verification, password reset, email verification | `User`; SMTP email |
| Cart and wishlist | `/api/users/cart`, `/api/users/wishlist` | Add/update/remove cart items and toggle wishlist | `Cart`, `User`, `Product` |
| Checkout and tracking | `/api/orders` | Create, list, view, cancel, and progress orders | `Order`, `Product`, `Coupon`, `Cart` |
| Online payments | `/api/payments` | Stripe intents/webhook and Razorpay order/signature verification | `Order`; Stripe and Razorpay |
| Profile and addresses | `/api/users/profile`, `/api/users/addresses` | Profile/avatar and saved delivery addresses | `User`; Cloudinary for avatar |
| Coupon validation | `/api/coupons/validate` | Validate customer coupon during checkout | `Coupon` |
| Admin dashboard | `/api/admin/dashboard` | Aggregate operational statistics | `adminController` and domain models |
| Admin management | Shared product/category/order/user/review/coupon prefixes | CRUD and moderation operations | Role guard `authorize('admin')` |

## 6. Order State Flow

```mermaid
stateDiagram-v2
    [*] --> pending: Order created
    pending --> confirmed: Payment received or admin confirmation
    confirmed --> preparing: Bakery starts preparation
    preparing --> out_for_delivery: Dispatched
    out_for_delivery --> delivered: Delivery completed
    pending --> cancelled: Customer or admin cancellation
    confirmed --> cancelled: Customer cancellation before preparation
    delivered --> [*]
    cancelled --> [*]
```

## Source Anchors

- Frontend bootstrap and providers: `client/src/main.jsx`
- Frontend route and access decisions: `client/src/App.jsx`, `client/src/components/common/ProtectedRoute.jsx`, `client/src/components/common/AdminRoute.jsx`
- HTTP behavior: `client/src/services/api.js` and `client/src/services/index.js`
- Backend middleware, route mounting, 404, and error handling: `server/server.js`
- Business operations: `server/controllers/`
- Persistence: `server/models/`