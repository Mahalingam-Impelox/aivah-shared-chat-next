import { useState } from 'react';
import {
  setAvatarVoiceMute, setIsStopGenerationVisible,
  setMessageResponse, setScrollLastMessage
} from '@/store/companion';
import { AppDispatch, useAppDispatch } from '@/store/store';

interface useChatFooterHelperType {
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  recognizingTranscript: string;
  setRecognizingTranscript: React.Dispatch<React.SetStateAction<string>>;
  messageInputValue: string;
  setMessageInputValue: React.Dispatch<React.SetStateAction<string>>;
  handleListenEnd: (text: string) => void;
  listening: (text: string) => void;
  stopAudioAndAnimation: () => void
}

const useChatFooterHelper = (): useChatFooterHelperType => {
    const dispatch: AppDispatch = useAppDispatch();
    const [isListening, setIsListening] = useState(false);
    const [recognizingTranscript, setRecognizingTranscript] =
      useState<string>('');
    const [messageInputValue, setMessageInputValue] = useState<string>('');

    const stopAudioAndAnimation = (): void => {
      dispatch(setMessageResponse(null));
      dispatch(setAvatarVoiceMute(false));
      dispatch(setIsStopGenerationVisible(false));
      dispatch(setScrollLastMessage(true));
    };

    const handleListenEnd = (): void => {
      if (recognizingTranscript) {
        setMessageInputValue(recognizingTranscript);
        setIsListening(false);
      }
    };

    const listening = (text: string): void => {
      setRecognizingTranscript(text);
    };

    return {
      isListening,
      setIsListening,
      recognizingTranscript,
      setRecognizingTranscript,
      messageInputValue,
      setMessageInputValue,
      handleListenEnd,
      listening,
      stopAudioAndAnimation
    };
}

export default useChatFooterHelper;
