import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
  PurchasesError,
} from 'react-native-purchases';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  isInTrial: boolean;
  trialEndDate: Date | null;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  availablePackages: PurchasesPackage[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// RevenueCat API Keys (same for iOS and Android)
const REVENUECAT_API_KEY = 'test_KdrJvaXdhrWRpuZevZlhxTCzjcR';
const ENTITLEMENT_ID = 'pro';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePackages, setAvailablePackages] = useState<PurchasesPackage[]>([]);
  const [isInTrial, setIsInTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);

  // Initialize RevenueCat on mount
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Login to RevenueCat when user changes
  useEffect(() => {
    if (user && user.id !== 'guest') {
      loginToRevenueCat(user.id);
    }
  }, [user]);

  /**
   * Initialize RevenueCat SDK
   */
  const initializeRevenueCat = async () => {
    try {
      console.log('🔍 Initializing RevenueCat...');

      // Set debug logging (wrapped in try-catch for safety)
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
      } catch (logError) {
        console.warn('⚠️ Could not set RevenueCat log level:', logError);
      }

      // Configure SDK with platform-specific API key
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        console.log('✅ RevenueCat configured for iOS');
      } else if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        console.log('✅ RevenueCat configured for Android');
      } else {
        console.log('⚠️ RevenueCat not configured - unsupported platform:', Platform.OS);
        setIsLoading(false);
        setIsSubscribed(false); // Default to not subscribed
        return;
      }

      // Load available packages (non-blocking)
      await loadPackages().catch(err => {
        console.warn('⚠️ Could not load packages:', err);
      });

      // Check initial subscription status (non-blocking)
      await checkSubscriptionStatus().catch(err => {
        console.warn('⚠️ Could not check subscription status:', err);
        setIsSubscribed(false);
        setIsLoading(false);
      });

      console.log('✅ RevenueCat initialization complete');
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      // Fail gracefully - allow app to continue without subscription features
      setIsSubscribed(false);
      setIsLoading(false);
    }
  };

  /**
   * Login user to RevenueCat
   */
  const loginToRevenueCat = async (userId: string) => {
    try {
      console.log('🔍 Logging in to RevenueCat with user ID:', userId);
      const { customerInfo } = await Purchases.logIn(userId);
      console.log('✅ Logged in to RevenueCat successfully');

      // Check subscription status after login
      updateSubscriptionStatus(customerInfo);
    } catch (error) {
      console.error('❌ RevenueCat login failed:', error);
    }
  };

  /**
   * Load available subscription packages
   */
  const loadPackages = async () => {
    try {
      console.log('🔍 Loading available subscription packages...');
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        setAvailablePackages(offerings.current.availablePackages);
        console.log('✅ Loaded packages:', offerings.current.availablePackages.length);
      } else {
        console.log('⚠️ No available packages found');
        setAvailablePackages([]);
      }
    } catch (error) {
      console.error('❌ Failed to load packages:', error);
      setAvailablePackages([]);
    }
  };

  /**
   * Check current subscription status
   */
  const checkSubscriptionStatus = async () => {
    try {
      console.log('🔍 Checking subscription status...');
      const customerInfo = await Purchases.getCustomerInfo();
      updateSubscriptionStatus(customerInfo);
    } catch (error) {
      console.error('❌ Failed to check subscription status:', error);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update subscription status from customer info
   */
  const updateSubscriptionStatus = (customerInfo: CustomerInfo) => {
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    const hasProEntitlement = proEntitlement !== undefined;
    setIsSubscribed(hasProEntitlement);

    // Check if user is in trial period
    if (hasProEntitlement && proEntitlement) {
      const willRenew = proEntitlement.willRenew;
      const expirationDate = proEntitlement.expirationDate;
      const periodType = proEntitlement.periodType;

      // User is in trial if period type is 'TRIAL' or if it's an intro offer
      const inTrial = periodType === 'TRIAL' || periodType === 'INTRO';
      setIsInTrial(inTrial);

      if (expirationDate) {
        setTrialEndDate(new Date(expirationDate));

        if (inTrial) {
          console.log('✅ User is in free trial, expires:', expirationDate);
        } else {
          console.log('✅ User has active pro subscription, renews:', willRenew);
        }
      }
    } else {
      setIsInTrial(false);
      setTrialEndDate(null);
      console.log('ℹ️ User does not have active subscription');
    }
  };

  /**
   * Purchase a subscription package
   */
  const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
    try {
      console.log('🔵 Starting purchase for package:', packageToPurchase.identifier);
      setIsLoading(true);

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

      console.log('✅ Purchase successful!');
      updateSubscriptionStatus(customerInfo);

    } catch (error) {
      const purchaseError = error as PurchasesError;

      // Handle user cancellation gracefully (not an error)
      if (purchaseError.userCancelled) {
        console.log('ℹ️ User cancelled purchase');
      } else {
        console.error('❌ Purchase failed:', purchaseError.message);
        throw new Error(purchaseError.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Restore previous purchases
   */
  const restorePurchases = async () => {
    try {
      console.log('🔵 Restoring purchases...');
      setIsLoading(true);

      const customerInfo = await Purchases.restorePurchases();

      console.log('✅ Purchases restored successfully');
      updateSubscriptionStatus(customerInfo);

    } catch (error) {
      const restoreError = error as PurchasesError;
      console.error('❌ Restore failed:', restoreError.message);
      throw new Error(restoreError.message || 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed,
        isLoading,
        isInTrial,
        trialEndDate,
        purchasePackage,
        restorePurchases,
        availablePackages,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
