# 🍽️ TableSide — Restaurant QR Table Ordering System

A production-ready, full-stack restaurant QR ordering web app with a premium dark glassmorphism UI.

---

## ✨ Features

### Customer Side
- 📱 QR code table detection (`/menu?table=5`)
- 🔍 Search + category filter + veg-only toggle
- 🛒 Cart with quantity controls
- ⭐ Today's Specials section
- 🌿/🍖 Veg / Non-veg indicators
- 📦 Place order, or add more to active order
- 📊 Live order status tracking

### Admin Side
- 📊 Dashboard with revenue, active tables, pending orders
- 🧾 Orders management with status updates
- 💵📱 Manual cash / UPI payment confirmation
- 🍛 Full menu CRUD (add/edit/delete/toggle)
- 🗂️ Category management with emoji picker
- 🔳 QR code generator (download PNG, print all)
- 🧾 Bill generation — print or download PDF
- ⚙️ Restaurant settings + tax configuration
- 🔔 Real-time new order sound notification

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
Edit `src/firebase/config.js` with your Firebase project credentials:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Configure Cloudinary (for image uploads)
Edit `src/utils/helpers.js`:
```js
export const CLOUDINARY_UPLOAD_PRESET = 'your_unsigned_preset';
export const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
```

### 4. Create Firebase Admin Account
1. Go to Firebase Console → Authentication → Users
2. Add a user with email + password
3. This will be your admin login

### 5. Set Firebase Database Rules
```json
{
  "rules": {
    "menuItems": { ".read": true, ".write": "auth != null" },
    "categories": { ".read": true, ".write": "auth != null" },
    "orders": { ".read": "auth != null", ".write": true },
    "restaurant": { ".read": true, ".write": "auth != null" }
  }
}
```

### 6. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── BillModal.jsx        # Bill view + print + PDF download
│   │   └── ImageUpload.jsx      # Cloudinary drag-and-drop upload
│   ├── customer/
│   │   ├── CartDrawer.jsx       # Slide-in cart
│   │   ├── FoodCard.jsx         # Menu item card
│   │   └── Navbar.jsx           # Top navigation bar
│   └── shared/
│       ├── ConfirmDialog.jsx    # Reusable confirm modal
│       └── LoadingSpinner.jsx   # Spinner component
├── context/
│   ├── AuthContext.jsx          # Firebase auth state
│   ├── CartContext.jsx          # Cart state management
│   └── RestaurantContext.jsx    # Restaurant config state
├── firebase/
│   ├── config.js               # Firebase initialization
│   └── database.js             # All DB read/write helpers + seed data
├── hooks/
│   ├── useCategories.js        # Realtime categories subscription
│   ├── useMenuItems.js         # Realtime menu items subscription
│   └── useOrders.js            # Realtime orders subscription
├── pages/
│   ├── admin/
│   │   ├── AdminLayout.jsx     # Sidebar layout wrapper
│   │   ├── AdminLogin.jsx      # Login page
│   │   ├── CategoriesPage.jsx  # Category CRUD
│   │   ├── Dashboard.jsx       # Stats & overview
│   │   ├── MenuManagement.jsx  # Menu item CRUD
│   │   ├── OrdersPage.jsx      # Orders + payment management
│   │   ├── QRCodesPage.jsx     # QR code generator
│   │   └── SettingsPage.jsx    # Restaurant settings
│   └── customer/
│       ├── HomePage.jsx         # Landing page with hero
│       ├── MenuPage.jsx         # Menu browsing + ordering
│       └── OrderStatusPage.jsx  # Live order tracking
├── styles/
│   └── index.css               # Tailwind + global styles
├── utils/
│   ├── billGenerator.js        # jsPDF bill generator
│   └── helpers.js              # Formatters, constants, Cloudinary
├── App.jsx                     # Routes
└── main.jsx                    # Entry point
```

---

## 🔳 QR Code URLs

Each table gets its own URL:
- Table 1 → `/menu?table=1`
- Table 2 → `/menu?table=2`
- ...

Admin can generate + print QR codes from the **QR Codes** page in the admin panel.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Image Upload | Cloudinary (unsigned) |
| PDF | jsPDF + jspdf-autotable |
| QR Codes | qrcode.react |
| Toasts | react-hot-toast |

---

## 📦 Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. Deploy to **Vercel**, **Netlify**, or **Firebase Hosting**.

### Deploy to Vercel (easiest)
```bash
npx vercel
```

---

## 🔐 Admin Access

- URL: `/admin/login`
- Create account via Firebase Console → Authentication
- Default demo credentials: set in Firebase

---

## 💡 Tips

- First visit automatically seeds sample menu data (runs once if DB is empty)
- Set your production domain in QR Codes page before printing
- Sound notifications use Web Audio API — no MP3 files needed
- For table count > 12, adjust `TABLE_COUNT` in `src/utils/helpers.js`
