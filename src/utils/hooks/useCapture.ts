import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { addBase64Images, setBase64Images } from '@/store/vision-agent';

type CaptureFunction = (
  type?: ('base64url' | 'imgData') | undefined
) => string | ImageData;

const useCapture = (
  capture?: CaptureFunction,
  captureType?: 'screenshot' | 'photo'
): void => {
  const { isListening } = useAppSelector((state) => state.companion);
  const dispatch = useAppDispatch();
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const intervalTimeRef = useRef<number>(1000);

  const storeImage = (): void => {
    if (capture !== undefined) {
      const image = capture('base64url');
      if (image === null || image === '') return;
      dispatch(addBase64Images([image]))
    }
  }

  useEffect(() => {
    if (isListening) {
      dispatch(setBase64Images([]))
      const captureImages = (): void => {
        storeImage();
        intervalRef.current = setInterval(() => {
          storeImage();
        }, intervalTimeRef.current);
      };
      captureImages();
    }

    return () => {
      intervalTimeRef.current = 1000;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current as unknown as number);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, dispatch]);
};

export default useCapture
