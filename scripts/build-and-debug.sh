#!/bin/bash

# Friday Voice Assistant - Quick Build & Debug Script
# Usage: ./scripts/build-and-debug.sh [development|preview]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROFILE="${1:-development}"  # Default to development

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Friday Voice Assistant Builder${NC}"
echo -e "${BLUE}  Profile: ${PROFILE}${NC}"
echo -e "${BLUE}========================================${NC}"

# Step 1: Pre-build checks
echo -e "\n${YELLOW}[1/6] Running pre-build checks...${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ ERROR: .env file not found${NC}"
    echo -e "${YELLOW}Create .env with: GEMINI_API_KEY=your_key_here${NC}"
    exit 1
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if expo-dev-client is installed
if ! npm list expo-dev-client > /dev/null 2>&1; then
    echo -e "${RED}❌ ERROR: expo-dev-client not installed${NC}"
    echo -e "${YELLOW}Run: npm install${NC}"
    exit 1
else
    echo -e "${GREEN}✅ expo-dev-client installed${NC}"
fi

# Step 2: Clean previous builds
echo -e "\n${YELLOW}[2/6] Cleaning previous builds...${NC}"
rm -rf .expo
rm -rf android/app/build 2>/dev/null || true
echo -e "${GREEN}✅ Build cache cleared${NC}"

# Step 3: Verify EAS CLI
echo -e "\n${YELLOW}[3/6] Verifying EAS CLI...${NC}"
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ ERROR: EAS CLI not installed${NC}"
    echo -e "${YELLOW}Install with: npm install -g eas-cli${NC}"
    exit 1
else
    echo -e "${GREEN}✅ EAS CLI found${NC}"
fi

# Step 4: Show build configuration
echo -e "\n${YELLOW}[4/6] Build configuration:${NC}"
echo -e "  Profile: ${GREEN}${PROFILE}${NC}"
echo -e "  Platform: ${GREEN}android${NC}"
echo -e "  Build Type: ${GREEN}apk${NC}"
echo -e "  Dev Client: ${GREEN}true${NC}"

# Step 5: Start build
echo -e "\n${YELLOW}[5/6] Starting EAS build...${NC}"
echo -e "${BLUE}This may take 10-20 minutes...${NC}\n"

# Ask for build type
read -p "Build locally (L) or on EAS cloud (C)? [L/c]: " BUILD_TYPE
BUILD_TYPE=${BUILD_TYPE:-L}

if [[ "$BUILD_TYPE" =~ ^[Ll]$ ]]; then
    echo -e "${BLUE}Building locally...${NC}"
    eas build --profile "${PROFILE}" --platform android --local
else
    echo -e "${BLUE}Building on EAS cloud...${NC}"
    eas build --profile "${PROFILE}" --platform android
fi

# Step 6: Post-build instructions
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. ${BLUE}Install APK on device:${NC}"
echo -e "   adb install path/to/friday.apk"
echo -e "\n2. ${BLUE}Monitor logs during app launch:${NC}"
echo -e "   adb logcat | grep -i \"friday\\|react\\|error\""
echo -e "\n3. ${BLUE}If app crashes, get full logs:${NC}"
echo -e "   adb logcat -d > crash_log.txt"
echo -e "\n4. ${BLUE}For development builds, start Metro:${NC}"
echo -e "   npx expo start --dev-client"

echo -e "\n${GREEN}✅ Build script completed successfully!${NC}"
echo -e "See BUILD_AND_DEBUG.md for detailed troubleshooting.\n"
