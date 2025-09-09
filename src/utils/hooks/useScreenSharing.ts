import { TOAST_STATE, ToasterService } from '@/sharedComponents/toaster/toaster.service';
import { useAppDispatch } from '@/store/store';
import { setBase64Images } from '@/store/vision-agent';
import { useEffect, useState } from 'react';

const useScreenSharing = (): {
  isSharing: boolean
  screenStream: MediaStream | null
  startScreenSharing: () => Promise<void>
  stopScreenSharing: () => void
} => {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const dispatch = useAppDispatch()

  const startScreenSharing = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      setScreenStream(stream);
      setIsSharing(true);
    } catch (err: any) {
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        ToasterService.showToast(
          TOAST_STATE.warning,
          'Screen share permission denied.'
        );
      } else {
        ToasterService.showToast(
          TOAST_STATE.danger,
          'Unable to share your screen. Compatibility error.'
        );
        console.error('Error starting screen sharing:', err);
      }
    }
  };

  const stopScreenSharing = (): void => {
    if (screenStream !== null) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsSharing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (screenStream !== null) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [screenStream]);

  useEffect(() => {
    return () => {
      dispatch(setBase64Images([]))
    }
  }, [dispatch])

  return { isSharing, screenStream, startScreenSharing, stopScreenSharing };
};

export default useScreenSharing;
