import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 搜索栏组件
 */
const SearchBar = ({ value, onChangeText, onClear, placeholder = '搜索姓名、电话、邮箱' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.textHint} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textHint}
          returnKeyType="search"
        />
        {value !== '' && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textHint} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 38,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: spacing.xs,
  },
});

export default SearchBar;
