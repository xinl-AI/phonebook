import { useState, useCallback } from 'react';

/**
 * Toast 提示 Hook
 * 封装 CustomToast 的状态管理，消灭 8 个屏幕中的重复代码
 *
 * 用法:
 *   const { toastProps, showToast } = useToast();
 *   showToast('保存成功');
 *   <CustomToast {...toastProps} />
 */
const useToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  const showToast = useCallback((msg, t = 'success') => {
    setMessage(msg);
    setType(t);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  const toastProps = { visible, message, type, onHide: hideToast };

  return { toastProps, showToast };
};

export default useToast;
