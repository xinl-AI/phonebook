import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import colors from '../styles/colors';
import spacing from '../styles/spacing';

/**
 * 联系人列表项组件
 * 显示头像、姓名、电话，支持收藏标记
 * @param {object} contact - 联系人数据
 * @param {function} onPress - 点击回调
 * @param {function} onLongPress - 长按回调
 */
const ContactItem = ({ contact, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.6}>
      <Avatar name={contact.name} uri={contact.avatar} size={44} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          {contact.isFavorite === 1 && (
            <Text style={styles.favoriteIcon}>★</Text>
          )}
        </View>
        <Text style={styles.phone} numberOfLines={1}>
          {contact.phone}
          {contact.secondPhone ? ` | ${contact.secondPhone}` : ''}
        </Text>
        {/* 显示分组标签 */}
        {contact.groups && contact.groups.length > 0 && (
          <View style={styles.groupRow}>
            {contact.groups.slice(0, 3).map((g) => (
              <View
                key={g.id}
                style={[styles.groupTag, { backgroundColor: g.color + '20' }]}>
                <Text style={[styles.groupTagText, { color: g.color }]}>
                  {g.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  favoriteIcon: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  phone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  groupRow: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  groupTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginTop: 2,
  },
  groupTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: colors.textHint,
    marginLeft: spacing.sm,
  },
});

export default React.memo(ContactItem);
