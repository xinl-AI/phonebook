import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 分组筛选头部组件
 * 横向滚动的分组标签 + 管理按钮
 */
const GroupHeader = ({ groups = [], selectedId, onSelect, onManage }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* "全部"标签 */}
        <TouchableOpacity
          style={[styles.tag, selectedId === null && styles.tagActive]}
          onPress={() => onSelect(null)}
          activeOpacity={0.7}>
          <Text style={[styles.tagText, selectedId === null && styles.tagTextActive]}>
            全部
          </Text>
        </TouchableOpacity>

        {/* 分组标签 */}
        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.tag,
              selectedId === group.id && { backgroundColor: group.color || colors.primary, borderColor: group.color || colors.primary },
            ]}
            onPress={() => onSelect(group.id)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tagText,
                { color: selectedId === group.id ? '#FFFFFF' : (group.color || colors.textSecondary) },
              ]}>
              {group.name}
              <Text style={{ color: selectedId === group.id ? 'rgba(255,255,255,0.7)' : colors.textHint, fontSize: 11 }}>
                {' '}{group.contactCount || 0}
              </Text>
            </Text>
          </TouchableOpacity>
        ))}

        {/* 管理按钮 */}
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={onManage}
          activeOpacity={0.7}>
          <Ionicons name="options-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  manageBtn: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
});

export default GroupHeader;
