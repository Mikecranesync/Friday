#!/bin/bash

# Friday Android Debug Script
# Helps diagnose and fix common Android issues

echo "========================================="
echo "🔧 FRIDAY ANDROID DEBUG HELPER"
echo "========================================="

# Function to clear caches
clear_caches() {
    echo "📦 Clearing all caches..."

    # Clear Metro cache
    echo "  → Clearing Metro bundler cache..."
    npx expo start --clear

    # Clear React Native cache
    echo "  → Clearing React Native cache..."
    npx react-native start --reset-cache

    # Clear Gradle cache (if on Android)
    if [ -d "android" ]; then
        echo "  → Clearing Gradle cache..."
        cd android && ./gradlew clean && cd ..
    fi

    # Clear node modules and reinstall
    echo "  → Reinstalling node modules..."
    rm -rf node_modules
    rm -rf .expo
    npm install

    echo "✅ Caches cleared!"
}

# Function to start with Android-specific options
start_android_optimized() {
    echo "🚀 Starting Friday with Android optimizations..."

    # Export Android-specific environment variables
    export EXPO_ANDROID_KEYSTORE_PASSWORD=""
    export EXPO_ANDROID_KEY_PASSWORD=""
    export NODE_OPTIONS="--max-old-space-size=4096"

    # Start with clear cache
    npx expo start --android --clear --no-dev --minify
}

# Function to run diagnostics
run_diagnostics() {
    echo "🔍 Running diagnostics..."

    # Check Expo version
    echo "  → Expo CLI version:"
    npx expo --version

    # Check React Native version
    echo "  → React Native version:"
    npm list react-native | head -n 2

    # Check Reanimated version
    echo "  → Reanimated version:"
    npm list react-native-reanimated | head -n 2

    # Check for common issues in app.json
    echo "  → Checking app.json configuration..."
    if grep -q '"newArchEnabled": true' app.json; then
        echo "    ⚠️  WARNING: newArchEnabled is true (incompatible with Expo Go)"
    else
        echo "    ✓ newArchEnabled is false (good)"
    fi

    # Check for EAS configuration
    if [ -f "eas.json" ]; then
        echo "    ✓ EAS configuration found"
    else
        echo "    ⚠️  No eas.json found"
    fi
}

# Function to create development build
create_dev_build() {
    echo "📱 Creating Android development build..."

    # Install EAS CLI if not present
    if ! command -v eas &> /dev/null; then
        echo "  → Installing EAS CLI..."
        npm install -g eas-cli
    fi

    # Build for Android
    eas build --platform android --profile development --local
}

# Main menu
echo ""
echo "Select an option:"
echo "1) Clear all caches"
echo "2) Start with Android optimizations"
echo "3) Run diagnostics"
echo "4) Create development build"
echo "5) All of the above (except build)"
echo ""
read -p "Enter option (1-5): " option

case $option in
    1)
        clear_caches
        ;;
    2)
        start_android_optimized
        ;;
    3)
        run_diagnostics
        ;;
    4)
        create_dev_build
        ;;
    5)
        clear_caches
        run_diagnostics
        start_android_optimized
        ;;
    *)
        echo "Invalid option"
        ;;
esac

echo ""
echo "========================================="
echo "✨ Done!"
echo "========================================="