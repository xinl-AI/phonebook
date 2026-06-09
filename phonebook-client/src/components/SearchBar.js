import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 搜索栏组件
 * 支持实时搜索输入
 * @param {string} value - 搜索关键词
 * @param {function} onChangeText - 输入回调
 * @param {function} onClear - 清除回调
 * @param {string} placeholder - 占位文本
 */
const SearchBar = ({ value, onChangeText, onClear, placeholder = '搜索姓名、电话、邮箱' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textHint}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {value !== '' && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
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
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearText: {
    fontSize: 14,
    color: colors.textHint,
  },
});

export default SearchBar;
