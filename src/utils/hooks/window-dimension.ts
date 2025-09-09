import { useState, useEffect } from 'react';

interface Dimension {
  width: number;
  height: number;
  isLargeScreen: boolean;
}

const getWindowDimensions = (): Dimension => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
    isLargeScreen: width >= 720
  };
};

const useWindowDimensions = (): Dimension => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    const handleResize = (): void => setWindowDimensions(getWindowDimensions());

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

export default useWindowDimensions;
