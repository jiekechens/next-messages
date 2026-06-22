import { useState, useRef, forwardRef, useImperativeHandle, useEffect ,useId} from 'react';
import styles from './index.module.scss';
interface ToastColorProps {
  /** 背景颜色，支持任意 CSS 颜色值，如 '#7d35ff' */
  color?: string;
  /** 显示持续时间（毫秒），默认 3000 */
  time?: number;
  /** 唯一标识（用于 DOM id），如果不传则自动生成一个，但仍建议保留 */
  id?: string;
  /** 要显示的文本内容 */
  toastContent?: string;
  /** 多语言对象（如果父组件传了语言，可用于扩展，但本组件未使用） */
  lang?: any;
  language?: string;
}

// 定义暴露给父组件的方法
export interface ToastColorRef {
  hideRule: (status: boolean) => Promise<void>;
}

const ToastColor = forwardRef<ToastColorRef, ToastColorProps>((props, ref) => {
  const {
    color = 'rgba(0,0,0,.6)',
    time = 3000,
    id: propId,
    toastContent = '',
  } = props;

  // 内部状态
  const [toastStatus, setToastStatus] = useState(false);
  const [flag, setFlag] = useState(false);
const uniqueId = useId();
  // 用于操作 DOM 元素的 ref
  const toastRef = useRef<HTMLDivElement>(null);

  // 生成唯一 id（如果父组件没传 id）
  const id = propId || uniqueId;

  // 核心方法：显示/隐藏 toast，并自动隐藏
  const hideRule = (status: boolean): Promise<void> => {
    return new Promise((resolve) => {
      // 防抖：如果正在执行动画，忽略后续调用
      if (flag && status === true) {
        resolve();
        return;
      }

      // 如果已经显示，再次调用 show 不重复触发
      if (toastStatus && status === true) {
        resolve();
        return;
      }

      // 更新状态
      setFlag(true);
      setToastStatus(status);

      // 直接操作 DOM 添加/移除类名
      const el = toastRef.current;
      if (!el) {
        setFlag(false);
        resolve();
        return;
      }

      // 显示时加 block 和 toastHide（触发动画）
      if (status) {
        el.className = `${styles['toast']} ${styles['block']} ${styles['toastHide']}`;
      } else {
        el.className = `${styles['toast']} ${styles['hide']}`;
        // 如果手动关闭，不需要延迟
        setFlag(false);
        resolve();
        return;
      }

      // 自动隐藏
      const timer = setTimeout(() => {
        if (el) {
          el.className = `${styles['toast']} ${styles['hide']}`;
        }
        setToastStatus(false);
        setFlag(false);
        resolve();
      }, time);

      // 如果父组件在隐藏过程中卸载了组件，清除定时器（但这里没法清除，可以在 useEffect cleanup 中做）
      // 存储 timer 以便清理
      (el as any).__timer = timer;
    });
  };

  // 暴露 hideRule 给父组件
  useImperativeHandle(ref, () => ({
    hideRule,
  }));

  // 清理定时器（组件卸载时）
  useEffect(() => {
    return () => {
      const el = toastRef.current;
      if (el && (el as any).__timer) {
        clearTimeout((el as any).__timer);
        delete (el as any).__timer;
      }
    };
  }, []);

  // 设置初始类名（隐藏）
  const initialClassName = `${styles['toast']} ${styles['hide']}`;

  return (
    <div
      ref={toastRef}
      id={`${styles['toast']} toast-${uniqueId}`}
      className={initialClassName}
      onClick={() => hideRule(false)}
    >
      <span className={styles['toastContent']} style={{ backgroundColor: color }}>
        {toastContent}
      </span>
    </div>
  );
});

ToastColor.displayName = 'ToastColor';

export default ToastColor;