import { StyleSheet } from 'react-native';

/**
 * 全局字体样式
 */
export default StyleSheet.create({
  // 大标题（页面标题）
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  // 中标题（区块标题）
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  // 小标题（卡片标题）
  h3: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  // 正文
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  // 辅助文字
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  // 小字
  small: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
});
