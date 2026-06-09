import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 分组筛选头部组件
 * 横向滚动的分组标签，点击切换筛选
 * @param {Array} groups - 分组列表
 * @param {number|null} selectedId - 当前选中的分组ID（null=全部）
 * @param {function} onSelect - 选择回调
 * @param {function} onManage - 管理分组回调
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
          <Text
            style={[
              styles.tagText,
              selectedId === null && styles.tagTextActive,
            ]}>
            全部
          </Text>
        </TouchableOpacity>

        {/* 分组标签 */}
        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.tag,
              selectedId === group.id && styles.tagActive,
              { borderColor: group.color || colors.primary },
              selectedId === group.id && {
                backgroundColor: group.color || colors.primary,
              },
            ]}
            onPress={() => onSelect(group.id)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tagText,
                { color: group.color || colors.textSecondary },
                selectedId === group.id && styles.tagTextActive,
              ]}>
              {group.name}
              <Text style={[styles.count, selectedId === group.id && { color: '#FFFFFF' }]}>
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
          <Text style={styles.manageText}>+ 管理</Text>
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
  count: {
    fontSize: 11,
    color: colors.textHint,
  },
  manageBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  manageText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default GroupHeader;
