You are a Senior React Native Mobile Architect.

Design and implement a COMPLETE production-ready React Native (Expo + TypeScript) mobile application using LOCAL DATABASE (SQLite).

PROJECT TITLE:
AI Services Marketplace – Product Management & Shopping Cart App

This is a Mobile Programming Lab project.

The application sells:
- AI accounts
- AI subscription upgrades
- Premium tier packages
- Digital services (YouTube, Discord, Spotify, etc.)

UI STYLE:
Modern, premium, Shopify-inspired mobile UI:
- Clean layout
- Rounded cards
- Soft shadows
- Elegant typography
- Smooth 60fps animations
- Professional color palette
- Minimal design
- Mobile-first UX

--------------------------------------------------
TECH STACK (STRICT)
--------------------------------------------------

Frontend:
- React Native (Expo)
- TypeScript (Strict Mode)
- React Navigation
- Context API for state management
- expo-sqlite for local database
- AsyncStorage for "Remember Me"

NO backend server.
NO Node.js.
Everything runs locally.

--------------------------------------------------
PROJECT STRUCTURE (STRICT)
--------------------------------------------------

src/
 ├── screens/
 │     ├── auth/
 │     ├── products/
 │     ├── cart/
 │     ├── revenue/
 ├── components/
 ├── navigation/
 ├── services/
 ├── context/
 ├── hooks/
 ├── utils/
 ├── constants/
 ├── database/
 ├── types/

--------------------------------------------------
DATABASE REQUIREMENTS (SQLite)
--------------------------------------------------

Create local SQLite database with tables:

1️⃣ Users
- id
- fullName
- email (unique)
- password

2️⃣ Products
- id
- name
- description
- price
- image
- tier (Basic / Pro / Premium)

3️⃣ Cart
- id
- productId
- quantity

4️⃣ Orders
- id
- totalAmount
- createdAt

5️⃣ OrderItems
- id
- orderId
- productId
- quantity
- price

Initialize database on app startup.

--------------------------------------------------
REQUIRED FEATURES
--------------------------------------------------

1️⃣ USER REGISTRATION

Fields:
- Full Name
- Email
- Password
- Confirm Password

Validation:
- Valid email format
- Password match
- Email must be unique

Save to SQLite database.

--------------------------------------------------

2️⃣ USER LOGIN

- Login with Email + Password
- Validate against SQLite data
- Save login session in AsyncStorage
- "Remember Me" functionality
- Navigate to Product List on success

--------------------------------------------------

3️⃣ PRODUCT LIST

Display:
- Image
- Name
- Short description
- Price
- Tier badge

Use FlatList.
Add subtle press animation.
Shopify-style card UI.

--------------------------------------------------

4️⃣ PRODUCT MANAGEMENT (CRUD)

Add Product:
- Name
- Description
- Price
- Image URL
- Tier

Update Product.
Delete Product.
View Product Details.

All using SQLite queries.

--------------------------------------------------

5️⃣ PRODUCT SEARCH

- Real-time filtering
- Search by name
- Case-insensitive
- Debounce input

--------------------------------------------------

6️⃣ PRODUCT SORTING

- Sort by price ascending
- Sort by price descending

--------------------------------------------------

7️⃣ SHOPPING CART

- Add to cart
- Remove from cart
- Update quantity
- Auto calculate total price
- Persist cart in SQLite

Checkout:
- Create order record
- Insert order items
- Clear cart
- Show success modal

--------------------------------------------------

8️⃣ REVENUE STATISTICS

- Calculate total revenue from Orders table
- Display:
   - Total revenue
   - Revenue by day
   - Revenue by month
   - Revenue by year

Simple summary dashboard UI.

--------------------------------------------------

UI REQUIREMENTS

- Each feature must be on a separate screen
- Use React Navigation stack
- Clear feedback messages (Toast/Alert)
- SafeAreaView usage
- Responsive layout
- Modern design system
- Tier badges (Basic / Pro / Premium)
- Clean spacing system

Optional bonus:
- Dark mode
- Simple chart for revenue

--------------------------------------------------

STATE MANAGEMENT

Use Context API for:
- Auth state
- Cart state

Separate logic from UI.
Reusable components required:
- FormInput
- ProductCard
- TierBadge
- CartItem
- RevenueCard
- Button

--------------------------------------------------

PERFORMANCE RULES

- Use FlatList properly
- Avoid unnecessary re-renders
- Use memo/useCallback when needed
- No inline heavy logic in render

--------------------------------------------------

DELIVERABLE

Generate:
- Full project structure
- Database setup file
- All SQLite queries
- All screens
- All navigation
- All reusable components
- Clean modular code
- Proper TypeScript types
- Production-ready formatting

No unnecessary comments.
No console.log in production code.

--------------------------------------------------

FINAL GOAL

Deliver a complete Shopify-style AI Services Marketplace mobile app
that satisfies ALL Mobile Programming Lab requirements
using React Native + SQLite only.