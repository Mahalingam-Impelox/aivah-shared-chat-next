import { useState, useEffect, useRef } from 'react';

const useResize = () => {
  const [isRezizing, setIsRezizing] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleResize = () => {
    setIsRezizing(true);
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
        setIsRezizing(false);
    }, 300);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  return isRezizing;
};

export default useResize;