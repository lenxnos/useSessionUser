import { useIdleTimer } from 'react-idle-timer';
import { useRef, useState, useEffect } from 'react';

interface USESESSIONUSERPROPS {
  expirationTimeout: number;
  onPrompt?: () => void;
  onContinue: () => void;
  onIdle: () => void;
  promptTimeout: number;
  isAuthenticated: boolean;
}

const DELAY = 1000;
const COUNTDOWN = 0;
const TIMEOUT_DEFAULT = 60000;

export const useSessionUser = (props: USESESSIONUSERPROPS) => {
  const {
    isAuthenticated,
    promptTimeout = COUNTDOWN,
    onPrompt,
    onIdle,
    expirationTimeout = TIMEOUT_DEFAULT,
    onContinue,
  } = props;
  const [isPrompted, setIsPromted] = useState<boolean>(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState<number>(0);
  const localTimeout = useRef();
  const localInterval = useRef();

  if (expirationTimeout < 0) {
    throw new Error('expirationTimeout cannot be a negative number');
  }

  if (promptTimeout < 0) {
    throw new Error('promptTimeout cannot be a negative number');
  }

  const clearLocalInterval = () => {
    clearInterval(localInterval.current);
  };

  const clearLocalTimeout = () => {
    clearTimeout(localTimeout.current);
  };

  const idle = () => {
    const delay = DELAY * 1;
    if (isAuthenticated) {
      localTimeout.current = setTimeout(() => {
        let countDown = promptTimeout / 1000;
        promptTimeout && setIsPromted(true);
        setTimeoutCountdown(countDown);
        if (onPrompt) {
          onPrompt();
        }
        localInterval.current = setInterval(() => {
          if (countDown > 0) {
            countDown -= 1;
            setTimeoutCountdown(countDown);
          } else {
            handleLogout();
          }
        }, 1000);
      }, delay);
    }
  };

  const { reset: resetTimeout, getRemainingTime } = useIdleTimer({
    timeout: expirationTimeout - promptTimeout,
    onIdle: idle,
    events: [],
    debounce: 250,
  });

  useEffect(() => {
    if (isAuthenticated) {
      clearLocalInterval();
      clearLocalTimeout();
      resetTimeout();
    }
  }, [expirationTimeout, isAuthenticated]);

  const handleLogout = () => {
    clearLocalInterval();
    clearLocalTimeout();
    setIsPromted(false);
    resetTimeout();
    onIdle();
  };

  const handleContinue = () => {
    clearLocalInterval();
    clearLocalTimeout();
    setIsPromted(false);
    resetTimeout();
    onContinue();
  };

  return {
    timeoutCountdown,
    isPrompted,
    getRemainingTime,
    handleContinue,
  };
};
