# 🎁 Free Trial Setup Guide

Complete guide for adding free trials to Friday App subscriptions.

---

## 📋 Overview

Free trials are now **fully integrated** into the Friday app:
- ✅ Trial status detection (TRIAL or INTRO period type)
- ✅ Days remaining countdown in VoiceScreen
- ✅ Visual distinction (green text for trials)
- ✅ Automatic conversion to paid subscription
- ✅ Customer Center access during trial

---

## 🎯 How It Works

### **User Flow with Free Trial**

```
1. User signs up with email/password
   └─> PaywallScreen presents native RevenueCat paywall

2. User selects subscription with free trial
   └─> "Start 7-Day Free Trial" button appears

3. During trial period
   └─> VoiceScreen shows: "Free Trial (7 days left) ⚙️"
   └─> User has full Friday Pro access
   └─> Green color indicates trial status

4. Trial expires
   └─> Automatically converts to paid subscription
   └─> OR user is shown paywall if they cancelled
```

---

## 🛠️ App Store Connect Setup (iOS)

### **Step 1: Create Subscription Product**

1. Go to **App Store Connect** → Your App → **In-App Purchases**
2. Click **+** to create new subscription
3. Fill in details:
   - **Reference Name:** Friday Pro Monthly
   - **Product ID:** `monthly`
   - **Subscription Group:** Friday Pro

### **Step 2: Add Free Trial**

1. In your subscription, go to **Subscription Prices**
2. Click **Add Free Trial**
3. Configure trial:
   - **Duration:** 7 days (or 3 days, 14 days, 1 month, etc.)
   - **Regions:** All regions
   - **Eligibility:** New subscribers only

4. Set subscription price after trial:
   - **Price:** $9.99/month (or your chosen price)

### **Step 3: Trial Configuration Options**

RevenueCat supports multiple trial types:

| Trial Type | Duration | Best For |
|-----------|----------|----------|
| **3 Days** | Short trial | Quick conversion testing |
| **7 Days** | Standard | Most apps (recommended) |
| **14 Days** | Extended | Complex apps needing time |
| **1 Month** | Long trial | Enterprise/premium apps |

**Recommended for Friday:** **7 days** (standard industry practice)

---

## 🤖 Google Play Console Setup (Android)

### **Step 1: Create Subscription**

1. Go to **Google Play Console** → Your App → **Monetize** → **Subscriptions**
2. Click **Create subscription**
3. Fill in details:
   - **Product ID:** `monthly`
   - **Name:** Friday Pro Monthly
   - **Description:** Full access to Friday Pro features

### **Step 2: Add Free Trial**

1. In **Base plans**, create new base plan
2. Enable **Free trial** option
3. Configure:
   - **Free trial period:** 7 days
   - **Grace period:** 3 days (optional)
   - **Subscription price:** $9.99/month

4. Click **Save** and **Activate**

### **Step 3: Eligibility Settings**

- **New subscribers only:** Recommended
- **Upgrade from base plan:** Optional
- **Resubscribe:** Allowed/Not allowed (your choice)

---

## 📱 RevenueCat Dashboard Configuration

### **Step 1: Sync Products**

1. Go to **RevenueCat Dashboard** → **Products**
2. Click **Import from App Store Connect** (iOS)
3. Click **Import from Google Play** (Android)
4. Verify products appear with trial information

### **Step 2: Create Offering with Trials**

1. Go to **Offerings** → **Default Offering**
2. Add your packages:
   - Monthly with 7-day trial
   - Annual with 7-day trial (or different duration)
   - Lifetime (no trial needed)

3. RevenueCat automatically detects trial configuration from stores

### **Step 3: Customize Paywall for Trials**

1. Go to **Paywalls** → Edit your paywall
2. Enable **Show trial duration**
3. Customize trial messaging:
   - "Start Your 7-Day Free Trial"
   - "Cancel Anytime"
   - "Full Access During Trial"

---

## 💻 Code Implementation (Already Done!)

Your app is **already configured** to handle free trials:

### **SubscriptionContext.tsx**

```typescript
interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  isInTrial: boolean;           // ← Trial status
  trialEndDate: Date | null;    // ← When trial expires
  // ... other methods
}

const updateSubscriptionStatus = (customerInfo: CustomerInfo) => {
  const proEntitlement = customerInfo.entitlements.active['pro'];

  if (proEntitlement) {
    const periodType = proEntitlement.periodType;
    const inTrial = periodType === 'TRIAL' || periodType === 'INTRO';

    setIsInTrial(inTrial);
    setTrialEndDate(new Date(proEntitlement.expirationDate));

    if (inTrial) {
      console.log('✅ User is in free trial, expires:', expirationDate);
    }
  }
};
```

### **VoiceScreen.tsx**

```typescript
const { isInTrial, trialEndDate } = useSubscription();

const getTrialDaysRemaining = () => {
  if (!trialEndDate) return 0;
  const now = new Date();
  const diff = trialEndDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getSubscriptionText = () => {
  if (isInTrial && trialEndDate) {
    const daysLeft = getTrialDaysRemaining();
    return `Free Trial (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left) ⚙️`;
  }

  if (isSubscribed) {
    return 'Friday Pro ⚙️';
  }

  return null;
};
```

---

## 🧪 Testing Free Trials

### **iOS Sandbox Testing**

1. **Create Sandbox Account:**
   - App Store Connect → Users and Access → Sandbox Testers
   - Add test Apple ID

2. **Install App on Device:**
   - Sign out of real Apple ID in Settings
   - Open Friday app
   - Sign up and select trial subscription
   - Use sandbox Apple ID when prompted

3. **Speed Up Trial Testing:**
   - Sandbox trials are accelerated:
     - 7-day trial = ~3 minutes
     - 1-month trial = ~5 minutes
   - Perfect for testing conversion flow!

### **Android Sandbox Testing**

1. **Add Test Users:**
   - Google Play Console → Setup → License Testing
   - Add email to test users list

2. **Install App:**
   - Build signed APK/AAB
   - Install on device
   - Sign up and select trial
   - Complete purchase (won't be charged)

3. **Manage Test Subscription:**
   - Google Play app → Subscriptions
   - Can cancel trial to test conversion flow

---

## 📊 Trial Analytics

RevenueCat automatically tracks:

### **Key Metrics**

- **Trial Start Rate:** % of users who start trial
- **Trial Conversion Rate:** % of trials → paid subscribers
- **Trial Cancellation Rate:** % who cancel before conversion
- **Average Trial Duration:** How long users stay in trial

### **View in Dashboard**

1. Go to **RevenueCat Dashboard** → **Charts**
2. Select **Trial Conversion** chart
3. Filter by:
   - Time period
   - Product
   - Country
   - Device type

### **Optimization Tips**

- **High start rate, low conversion?**
  - Trial too long
  - Not enough value demonstrated
  - Add in-app messaging during trial

- **Low start rate?**
  - Trial duration unclear
  - Paywall confusing
  - Test different trial lengths

---

## ⚙️ Trial Period Options

### **Recommended Trial Durations**

| App Type | Recommended | Reason |
|----------|------------|--------|
| **Voice Assistant** | 7 days | Enough time to test multiple features |
| **Productivity** | 7-14 days | Users need time to integrate into workflow |
| **Entertainment** | 3-7 days | Quick engagement, fast decision |
| **Education** | 14-30 days | Learning curve requires time |

**For Friday:** **7 days** is ideal
- Users can test voice commands multiple times
- Long enough to see value
- Short enough to encourage conversion

---

## 🚨 Important Trial Rules

### **Apple App Store**

- ✅ Trials must be offered to **all users** (can't target specific regions only)
- ✅ Trial length: 3 days, 7 days, 14 days, 1 month, 2 months, 3 months, 6 months, 1 year
- ✅ Users can only use trial **once per subscription group**
- ✅ Must clearly display trial terms in paywall
- ⚠️ Users charged automatically after trial unless cancelled

### **Google Play Store**

- ✅ Trial length: Any duration between 3 days and 1 year
- ✅ Can offer trial to new subscribers only
- ✅ Grace period available (3-7 days after trial for payment issues)
- ✅ Must clearly show "Free trial" in subscription details
- ⚠️ Auto-renews unless cancelled 24 hours before trial end

---

## 💡 Best Practices

### **1. Communicate Trial Value**

**Good Paywall Copy:**
```
✅ "Start 7-Day Free Trial"
✅ "Full access to all Friday Pro features"
✅ "Cancel anytime, no commitment"
✅ "$9.99/month after trial ends"
```

**Bad Paywall Copy:**
```
❌ "Try it free"  (How long?)
❌ "Get Pro"  (No mention of trial)
❌ "Subscribe now"  (Sounds like immediate payment)
```

### **2. Remind Users During Trial**

Add in-app notifications:
- **Day 1:** "Welcome! Your 7-day trial has started"
- **Day 5:** "2 days left in your trial"
- **Day 6:** "Trial ends tomorrow"

(Consider implementing push notifications for this)

### **3. Make Cancellation Easy**

- Link to Customer Center in app
- Show "Manage Subscription" button
- Don't hide cancellation option

**Why?** Happy trial users convert better!

### **4. Track Trial Engagement**

Monitor what trial users do:
- Voice queries per day
- Features used most
- Time spent in app

Use this data to:
- Improve onboarding
- Highlight unused features
- Time trial reminders better

---

## 🔄 Trial to Paid Conversion

### **What Happens When Trial Ends**

**If user doesn't cancel:**
1. Trial expires at end date
2. Subscription auto-renews to paid
3. User charged subscription price
4. `isInTrial` becomes `false`
5. `periodType` changes from `TRIAL` to `NORMAL`

**If user cancels trial:**
1. Access continues until trial end date
2. No charge when trial expires
3. `isSubscribed` becomes `false`
4. User sees PaywallScreen again

### **Your App Handles This Automatically**

```typescript
// SubscriptionContext automatically updates:
updateSubscriptionStatus(customerInfo);

// VoiceScreen shows correct status:
- During trial: "Free Trial (3 days left) ⚙️"
- After conversion: "Friday Pro ⚙️"
- After cancellation: Shows PaywallScreen
```

---

## 📋 Production Checklist

Before launching with free trials:

- [ ] Create subscription products in App Store Connect
- [ ] Add 7-day free trial to subscriptions
- [ ] Create products in Google Play Console
- [ ] Configure trial period and price
- [ ] Import products to RevenueCat Dashboard
- [ ] Design paywall with trial messaging
- [ ] Test trial flow in sandbox (iOS + Android)
- [ ] Test trial conversion (let trial expire)
- [ ] Test trial cancellation
- [ ] Verify trial status shows in app
- [ ] Add trial terms to app description
- [ ] Add trial info to privacy policy
- [ ] Test Customer Center during trial
- [ ] Monitor trial analytics in RevenueCat

---

## 🎯 Quick Start: Adding 7-Day Trial

### **1. App Store Connect**
```
1. Products → monthly subscription
2. Add Free Trial → 7 days
3. Save and submit
```

### **2. Google Play Console**
```
1. Subscriptions → monthly
2. Base plan → Enable free trial
3. Duration: 7 days
4. Activate
```

### **3. RevenueCat Dashboard**
```
1. Products → Import from stores
2. Offerings → Verify trial shows
3. Paywalls → Enable "Show trial duration"
```

### **4. Test**
```
1. Use sandbox account
2. Start trial subscription
3. Check VoiceScreen shows: "Free Trial (7 days left) ⚙️"
4. Wait or cancel to test conversion
```

---

## 🔗 Useful Resources

- **Apple Free Trials:** https://developer.apple.com/app-store/subscriptions/#free-trials
- **Google Play Trials:** https://support.google.com/googleplay/android-developer/answer/140504
- **RevenueCat Trials:** https://www.revenuecat.com/docs/subscription-guidance/trials
- **Trial Best Practices:** https://www.revenuecat.com/blog/engineering/trial-best-practices/

---

## 🎉 Summary

Your Friday app is **ready for free trials**:

✅ **Code:** Trial detection and display implemented
✅ **UI:** Shows trial status with days remaining
✅ **Analytics:** RevenueCat tracks all trial metrics
✅ **Testing:** Works with sandbox accounts

**Next Step:** Configure trial duration in App Store Connect and Google Play Console!

**Recommended Setup:**
- **Trial Length:** 7 days
- **Trial Type:** Introductory offer
- **Eligibility:** New subscribers only
- **Price After Trial:** $9.99/month

This maximizes conversion while giving users enough time to experience Friday Pro! 🚀
