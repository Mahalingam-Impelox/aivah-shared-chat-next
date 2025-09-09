'use client';

import { ToastOptions, toast } from 'react-toastify';

export enum TOAST_STATE {
  success = 'SUCCESS',
  warning = 'WARNING',
  info = 'INFO',
  danger = 'DANGER'
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ToasterService {
  public static showToast(toastState: TOAST_STATE, message: string): void {
    // Only show toasts on the client side
    if (typeof window === 'undefined') {
      return;
    }

    const config: ToastOptions = {
      position: 'top-center',
      autoClose: 2500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored'
    };

    try {
      if (toastState === TOAST_STATE.success) {
        toast.success(message, {
          ...config
        });
      } else if (toastState === TOAST_STATE.danger) {
        toast.error(message, {
          ...config
        });
      } else if (toastState === TOAST_STATE.warning) {
        toast.warning(message, {
          ...config
        });
      } else {
        toast.info(message, {
          ...config
        });
      }
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  }
}
