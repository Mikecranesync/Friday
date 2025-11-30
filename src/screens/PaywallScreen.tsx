import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaywallScreen() {
  const { availablePackages, purchasePackage, restorePurchases, isLoading } = useSubscription();
  const { signOut } = useAuth();
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const handlePurchase = async (pkg: any) => {
    try {
      setPurchasingPackageId(pkg.identifier);
      await purchasePackage(pkg);
      Alert.alert('Success!', 'Welcome to Friday Pro! 🎉');
    } catch (error: any) {
      Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setPurchasingPackageId(null);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      await restorePurchases();
      Alert.alert('Success!', 'Your purchases have been restored! 🎉');
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'No purchases found to restore.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const features = [
    { icon: '🎤', title: 'Unlimited Voice Queries', description: 'Ask Friday anything, anytime' },
    { icon: '📧', title: 'Email Integration', description: 'Manage your inbox with voice commands' },
    { icon: '⚡', title: 'Priority Support', description: 'Get help when you need it' },
    { icon: '🎯', title: 'Advanced AI', description: 'Access to latest AI models' },
    { icon: '🔒', title: 'Privacy First', description: 'Your data stays secure' },
    { icon: '🌟', title: 'Early Access', description: 'Try new features first' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Friday</Text>
          <Text style={styles.proTag}>PRO</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Unlock the Full Friday Experience</Text>
        <Text style={styles.subtitle}>
          Get unlimited access to all features and premium support
        </Text>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Subscription Packages */}
        <View style={styles.packagesContainer}>
          <Text style={styles.packagesTitle}>Choose Your Plan</Text>

          {isLoading && availablePackages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D96BFF" />
              <Text style={styles.loadingText}>Loading subscription plans...</Text>
            </View>
          ) : availablePackages.length > 0 ? (
            availablePackages.map((pkg, index) => {
              const isPurchasing = purchasingPackageId === pkg.identifier;
              const isMonthly = pkg.identifier.toLowerCase().includes('monthly');
              const isAnnual = pkg.identifier.toLowerCase().includes('annual') || pkg.identifier.toLowerCase().includes('yearly');

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    isAnnual && styles.packageCardPopular,
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={isPurchasing || isRestoring}
                >
                  {isAnnual && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>BEST VALUE</Text>
                    </View>
                  )}

                  <View style={styles.packageHeader}>
                    <Text style={styles.packageTitle}>
                      {isMonthly ? '📅 Monthly' : isAnnual ? '🎯 Annual' : pkg.identifier}
                    </Text>
                    <Text style={styles.packagePrice}>
                      {pkg.product.priceString}
                      {isMonthly && <Text style={styles.packagePeriod}>/month</Text>}
                      {isAnnual && <Text style={styles.packagePeriod}>/year</Text>}
                    </Text>
                  </View>

                  {isAnnual && (
                    <Text style={styles.packageSavings}>Save up to 40% vs monthly</Text>
                  )}

                  {isPurchasing ? (
                    <ActivityIndicator size="small" color="#D96BFF" style={styles.packageLoader} />
                  ) : (
                    <LinearGradient
                      colors={['#D96BFF', '#8B5CF6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.packageButton}
                    >
                      <Text style={styles.packageButtonText}>Subscribe Now</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.noPackagesContainer}>
              <Text style={styles.noPackagesText}>
                No subscription plans available at the moment.
              </Text>
              <Text style={styles.noPackagesSubtext}>
                Please check back later or contact support.
              </Text>
            </View>
          )}
        </View>

        {/* Restore Purchases Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isRestoring || purchasingPackageId !== null}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color="#9CA3AF" />
          ) : (
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Fine Print */}
        <Text style={styles.finePrint}>
          Subscription automatically renews unless auto-renew is turned off at least 24-hours
          before the end of the current period.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0118',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 12,
    letterSpacing: 2,
  },
  proTag: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0118',
    backgroundColor: '#D96BFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  packagesContainer: {
    marginBottom: 24,
  },
  packagesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  packageCard: {
    backgroundColor: '#1F1333',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardPopular: {
    borderColor: '#D96BFF',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#D96BFF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0A0118',
  },
  packageHeader: {
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D96BFF',
  },
  packagePeriod: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  packageSavings: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 16,
    fontWeight: '600',
  },
  packageButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  packageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  packageLoader: {
    paddingVertical: 14,
  },
  noPackagesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPackagesText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  noPackagesSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  restoreButtonText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  signOutButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  signOutButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  finePrint: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
