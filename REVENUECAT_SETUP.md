# 💳 RevenueCat Integration Guide

Complete guide for the Friday App's RevenueCat subscription system.

---

## 📋 Overview

The Friday app uses **RevenueCat** for subscription management with:
- ✅ Native RevenueCat Paywall UI
- ✅ Customer Center for subscription management
- ✅ Email/password authentication
- ✅ "Friday Pro" entitlement
- ✅ Test API key integration
- ✅ Monthly, Yearly, and Lifetime subscription support

---

## 🚀 Quick Start

### **1. Installation**

Already installed:
```bash
npm install --save react-native-purchases react-native-purchases-ui
```

Current versions:
- `react-native-purchases@9.6.8`
- `react-native-purchases-ui@9.6.8`

### **2. Configuration**

**API Key:** `test_KdrJvaXdhrWRpuZevZlhxTCzjcR`
**Entitlement ID:** `pro`
**Platform:** iOS & Android (same API key)

---

## 📂 File Structure

```
friday/
├── src/
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Email/password authentication
│   │   └── SubscriptionContext.tsx   # RevenueCat SDK + Paywall + Customer Center
│   └── screens/
│       ├── LoginScreen.tsx           # Email/password login/signup
│       ├── PaywallScreen.tsx         # Native RevenueCat Paywall presentation
│       └── VoiceScreen.tsx           # Main app + Customer Center access
└── App.tsx                            # 4-tier user flow
```

---

## 🔄 User Flow

```
1. No User
   └─> LoginScreen (email/password signup/signin)

2. Guest User (user.id === 'guest')
   └─> VoiceScreen (bypasses paywall)

3. Authenticated User (NOT subscribed)
   └─> PaywallScreen (native RevenueCat paywall)

4. Subscribed User
   └─> VoiceScreen (full access + Customer Center)
```

---

## 🎨 Features Implemented

### **1. Native RevenueCat Paywall**

**Location:** `src/screens/PaywallScreen.tsx`

**How it works:**
- Automatically presents when screen loads (`useEffect`)
- Uses `RevenueCatUI.presentPaywall()` for native UI
- Handles all purchase flows (purchased, restored, cancelled, error)
- Shows feature list before paywall presentation

**Code:**
```typescript
const { presentPaywall } = useSubscription();

const result = await presentPaywall();

switch (result) {
  case PAYWALL_RESULT.PURCHASED:
    // User purchased subscription
    break;
  case PAYWALL_RESULT.RESTORED:
    // User restored purchases
    break;
  case PAYWALL_RESULT.CANCELLED:
    // User cancelled
    break;
}
```

### **2. Customer Center**

**Location:** `src/screens/VoiceScreen.tsx`

**How it works:**
- Shows "Friday Pro ⚙️" button for subscribed users
- Tap to open native Customer Center
- Users can manage subscriptions, view receipts, cancel

**Code:**
```typescript
const { presentCustomerCenter, isSubscribed } = useSubscription();

const handleManageSubscription = async () => {
  await presentCustomerCenter();
};

// UI
{isSubscribed && user?.id !== 'guest' && (
  <TouchableOpacity onPress={handleManageSubscription}>
    <Text>Friday Pro ⚙️</Text>
  </TouchableOpacity>
)}
```

### **3. Subscription Context**

**Location:** `src/contexts/SubscriptionContext.tsx`

**Features:**
- ✅ SDK initialization with platform-specific config
- ✅ User login to RevenueCat (`Purchases.logIn(userId)`)
- ✅ Subscription status checking (`entitlements.active['pro']`)
- ✅ Package loading from offerings
- ✅ Purchase handling with error management
- ✅ Restore purchases
- ✅ Native Paywall presentation
- ✅ Customer Center presentation

**Exported functions:**
```typescript
{
  isSubscribed: boolean;
  isLoading: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  availablePackages: PurchasesPackage[];
  presentPaywall: () => Promise<PaywallResult>;
  presentCustomerCenter: () => Promise<void>;
}
```

---

## 🛠️ RevenueCat Dashboard Setup

### **Step 1: Create Account**

1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Sign up or log in
3. Create a new project: **"Friday Voice Assistant"**

### **Step 2: Configure App**

1. **App Settings:**
   - iOS: Add Bundle ID (com.yourcompany.friday)
   - Android: Add Package Name (com.yourcompany.friday)

2. **App Store Connect (iOS):**
   - Add In-App Purchase Shared Secret
   - Link App Store Connect account

3. **Google Play (Android):**
   - Upload Service Account JSON
   - Link Google Play Console

### **Step 3: Create Products**

Create 3 products in **App Store Connect** and **Google Play Console**:

| Product ID | Type | Price | Description |
|-----------|------|-------|-------------|
| `monthly` | Auto-renewable subscription | $9.99/month | Friday Pro Monthly |
| `yearly` | Auto-renewable subscription | $79.99/year | Friday Pro Annual (save 33%) |
| `lifetime` | Non-consumable | $199.99 | Friday Pro Lifetime |

### **Step 4: Create Offering**

1. Go to **RevenueCat Dashboard → Offerings**
2. Create offering: **"Default Offering"**
3. Add packages:
   - Monthly Package → `monthly` product
   - Annual Package → `yearly` product
   - Lifetime Package → `lifetime` product
4. Set as **Current Offering**

### **Step 5: Create Entitlement**

1. Go to **RevenueCat Dashboard → Entitlements**
2. Create entitlement: **"pro"**
3. Attach products: `monthly`, `yearly`, `lifetime`

### **Step 6: Get API Keys**

1. Go to **RevenueCat Dashboard → API Keys**
2. Copy **Public App-Specific API Key**
3. Replace in `SubscriptionContext.tsx`:

```typescript
const REVENUECAT_API_KEY = 'YOUR_PRODUCTION_API_KEY_HERE';
```

Currently using: `test_KdrJvaXdhrWRpuZevZlhxTCzjcR` (TEST KEY)

### **Step 7: Configure Paywall**

1. Go to **RevenueCat Dashboard → Paywalls**
2. Create new paywall design
3. Customize:
   - Header image
   - Title: "Unlock Friday Pro"
   - Feature list
   - Colors matching app theme (#D96BFF)
4. Link to "Default Offering"

---

## 🧪 Testing

### **Test Subscription Flow**

1. **Sign Up:**
   - Open app
   - Create account with email/password
   - PaywallScreen appears automatically

2. **Purchase (Test):**
   - Paywall presents native RevenueCat UI
   - Select a package (monthly/yearly/lifetime)
   - Complete test purchase (sandbox)

3. **Access App:**
   - After purchase, app navigates to VoiceScreen
   - See "Friday Pro ⚙️" in header

4. **Manage Subscription:**
   - Tap "Friday Pro ⚙️"
   - Customer Center opens
   - Can view/cancel subscription

5. **Restore Purchases:**
   - Sign out
   - Sign in on different device
   - Tap "Restore Purchases" on paywall
   - Subscription restored

### **Test Guest Mode:**

1. Open app
2. Tap "Continue as Guest"
3. Access VoiceScreen without subscription
4. No Customer Center (guest users don't pay)

### **Test Sandbox Accounts**

**iOS:**
- Settings → App Store → Sandbox Account
- Use test Apple ID

**Android:**
- Google Play Console → Test users
- Add email to test list

---

## 🔒 Production Checklist

Before releasing to App Store / Play Store:

- [ ] Replace test API key with production key
- [ ] Create products in App Store Connect
- [ ] Create products in Google Play Console
- [ ] Configure offerings in RevenueCat Dashboard
- [ ] Create "pro" entitlement
- [ ] Design paywall in RevenueCat Dashboard
- [ ] Test purchase flow with sandbox accounts
- [ ] Test restore purchases
- [ ] Test Customer Center
- [ ] Add privacy policy and terms of service links
- [ ] Configure webhook for backend user sync (optional)
- [ ] Setup analytics (RevenueCat Charts included)

---

## 📊 RevenueCat Dashboard Features

### **Charts (Built-in Analytics)**

RevenueCat automatically tracks:
- Active subscriptions
- Monthly Recurring Revenue (MRR)
- Churn rate
- Conversion rate
- Trial conversion
- Customer lifetime value (LTV)

Access at: **Dashboard → Charts**

### **Customer Lookup**

Search users by:
- Email
- User ID
- Transaction ID

View:
- Subscription status
- Purchase history
- Active entitlements

### **Webhooks (Optional)**

Configure webhooks to sync subscription status to your backend:

**Endpoint:** `https://yourbackend.com/api/revenuecat/webhook`

**Events:**
- Initial purchase
- Renewal
- Cancellation
- Expiration
- Refund

---

## 🐛 Common Issues

### **"No packages available"**

**Cause:** Offering not configured in RevenueCat
**Fix:**
1. Go to RevenueCat Dashboard
2. Create offering with packages
3. Set as "Current Offering"

### **"Purchase failed"**

**Cause:** Products not created in App Store/Play Store
**Fix:**
1. Create products in store consoles
2. Link products in RevenueCat
3. Wait 24 hours for propagation

### **"Customer Center not loading"**

**Cause:** User not logged in to RevenueCat
**Fix:** Check `Purchases.logIn(userId)` is called in SubscriptionContext

### **"Paywall not presenting"**

**Cause:** No paywall designed in dashboard
**Fix:**
1. Go to RevenueCat Dashboard → Paywalls
2. Create and publish paywall
3. Link to offering

---

## 🔗 Useful Links

- **RevenueCat Docs:** https://www.revenuecat.com/docs
- **React Native SDK:** https://www.revenuecat.com/docs/getting-started/installation/reactnative
- **Paywalls Guide:** https://www.revenuecat.com/docs/tools/paywalls
- **Customer Center:** https://www.revenuecat.com/docs/tools/customer-center
- **Dashboard:** https://app.revenuecat.com

---

## 💡 Best Practices

1. **Always use Sandbox for testing:**
   - Don't test with real credit cards
   - Use sandbox accounts only

2. **Log everything during development:**
   - Current logging level: `LOG_LEVEL.VERBOSE`
   - Change to `LOG_LEVEL.INFO` in production

3. **Handle errors gracefully:**
   - All purchase methods wrapped in try-catch
   - User-friendly error messages shown

4. **Refresh subscription status:**
   - After paywall closes
   - After Customer Center closes
   - On app foreground

5. **Keep API key secure:**
   - Use environment variables in production
   - Don't commit production keys to Git

---

## 🎯 Next Steps

1. **Complete RevenueCat Dashboard setup**
   - Create account
   - Configure products
   - Design paywall
   - Replace test API key

2. **App Store Submission**
   - Create app listings
   - Add subscription descriptions
   - Link subscription groups
   - Submit for review

3. **Backend Integration (Optional)**
   - Setup webhook endpoint
   - Sync subscription status to database
   - Grant/revoke user access based on status

4. **Marketing**
   - A/B test paywall designs
   - Test different pricing
   - Monitor conversion rates
   - Optimize based on RevenueCat Charts

---

**Current Status:** ✅ RevenueCat fully integrated and ready for production setup

**Test API Key:** `test_KdrJvaXdhrWRpuZevZlhxTCzjcR`
**Production Key:** _Replace before app store submission_
