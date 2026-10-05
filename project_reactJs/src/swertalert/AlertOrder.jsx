import { useCallback, useEffect } from 'react';
import { ConfigProvider, notification } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { createStyles } from 'antd-style';

const COLOR_BG = 'linear-gradient(135deg,#6253e1, #04befe)';

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      position: relative;
      overflow: hidden;
      border: none;

      > span {
        position: relative;
        z-index: 1;
      }

      &::before {
        content: '';
        background: ${COLOR_BG};
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: opacity 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0.85;
      }
    }
  `,
}));

const AlertOrder = () => {
  const { styles } = useStyle();

  const [api, contextHolder] = notification.useNotification();

  const openNotification = useCallback(() => {
    api.open({
      message: 'Order placed successfully',
      description: 'You can view detail in your order page now.',
      duration: 5,
      showProgress: true,
      pauseOnHover: true,
      placement: 'topRight',

      icon: (
        <CheckCircleFilled
          style={{
            color: '#52c41a',
            fontSize: 24,
          }}
        />
      ),

      style: {
        borderRadius: 16,
      },
    });
  }, [api]);

  useEffect(() => {
    openNotification();
  }, [openNotification]);

  return (
    <ConfigProvider
      button={{
        className: styles.linearGradientButton,
      }}
      theme={{
        components: {
          Notification: {
            progressBg: COLOR_BG,
          },
        },
      }}
    >
      {contextHolder}
    </ConfigProvider>
  );
};

export default AlertOrder;