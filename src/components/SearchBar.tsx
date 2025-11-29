import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/spacing';
import { borders, shadows } from '../theme/shadows';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onVoicePress?: () => void;
  showVoiceButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search emails...',
  onSearch,
  onVoicePress,
  showVoiceButton = true,
}) => {
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch?.(text);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary,
          borderColor: colors.border.light,
          ...shadows.small,
        },
      ]}
    >
      {/* Search Icon */}
      <View style={styles.iconContainer}>
        <SearchIcon color={colors.text.tertiary} />
      </View>

      {/* Text Input */}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text.primary,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        value={query}
        onChangeText={handleChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {/* Voice Button */}
      {showVoiceButton && (
        <TouchableOpacity
          style={[
            styles.voiceButton,
            {
              backgroundColor: colors.primary[500],
            },
          ]}
          onPress={onVoicePress}
          activeOpacity={0.8}
        >
          <MicIcon color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Search Icon SVG Component
const SearchIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: color,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 2,
        height: 6,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
        bottom: -1,
        right: -1,
      }}
    />
  </View>
);

// Microphone Icon SVG Component
const MicIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
    {/* Mic Body */}
    <View
      style={{
        width: 8,
        height: 12,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: color,
        marginTop: -2,
      }}
    />
    {/* Mic Stand */}
    <View
      style={{
        position: 'absolute',
        width: 2,
        height: 4,
        backgroundColor: color,
        bottom: 1,
      }}
    />
    {/* Mic Base */}
    <View
      style={{
        position: 'absolute',
        width: 8,
        height: 2,
        backgroundColor: color,
        bottom: 0,
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borders.radius.xl, // 24px for pill shape
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    ...Platform.select({
      ios: {
        paddingVertical: 0,
      },
      android: {
        paddingVertical: 8,
      },
    }),
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: borders.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});
