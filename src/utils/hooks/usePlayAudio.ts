/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import * as _ from 'lodash';
import { TOAST_STATE, ToasterService } from '@/sharedComponents/toaster/toaster.service';
import { setIsAudioPlaying, setHighlightMuteButton, setAudioStopped } from '@/store/companion';

const usePlayAudio = (): void => {
  const dispatch = useAppDispatch()
  const { messageResponse: storedMessageResponse, stopGeneration: storeStopGeneration, isConversationChanged } = useAppSelector(
    state => state.companion
  );
  const messageResponse = useMemo(() => storedMessageResponse, [storedMessageResponse]);
  const muteAvatar = useAppSelector(state => state.companion.muteAvatar)
  const audio = useRef<HTMLAudioElement | null>(new Audio());
  const [audioError, setAudioError] = useState(false)

  useEffect(() => {
    const audioObject = audio.current
    const audioEvent = (e: Event): void => {
      if (e.type === 'playing') {
        dispatch(setIsAudioPlaying(true));
      } else {
        dispatch(setIsAudioPlaying(false));
      }
    };
    if (audio.current) {
      audio.current.addEventListener('playing', audioEvent);
      audio.current.addEventListener('pause', audioEvent);
    }

    return () => {
      if (audioObject) {
        audioObject.removeEventListener('playing', audioEvent);
        audioObject.removeEventListener('pause', audioEvent);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (storeStopGeneration > 0 && audio.current) {
      audio.current.pause();
    }
  }, [storeStopGeneration]);

  useEffect(() => {
    if (isConversationChanged) {
      if (audio.current) {
        audio.current.pause();
      }
    }
  }, [isConversationChanged]);

  useEffect(() => {
    if (messageResponse?.chatId && messageResponse?.audio) {
      if (audio.current) {
        audio.current.pause();
        audio.current.src = messageResponse.audio
        audio.current.load();
        const promise = audio.current.play();
        if (promise !== undefined) {
          promise
            .then()
            .catch((error) => {
              console.log('Playback error ', error);
              setAudioError(true)
            });
        }
        const onAudioEnded = (): void => {
          if (audio.current) {
            audio.current.removeEventListener('ended', onAudioEnded);
          }
          dispatch(setAudioStopped(messageResponse?.chatId));
        };
        audio.current.addEventListener('ended', onAudioEnded);
      }
    } else {
      if (audio.current) {
        audio.current.remove();
      }
    }
  }, [messageResponse?.chatId, dispatch, messageResponse?.audio]);

  
  useEffect(() => {
    const muteWhenNeeded = (): void => {
      if (audio.current) {
        if (muteAvatar) {
          audio.current.muted = true;
        } else {
          if (audioError && audio.current?.paused) {
            const promise = audio.current.play();
            if (promise !== undefined) {
              promise
                .then(() => {
                  dispatch(setHighlightMuteButton(false));
                  setAudioError(false)
                })
                .catch(() => {
                  setAudioError(true)
                  ToasterService.showToast(
                    TOAST_STATE.warning,
                    'Browser is unable to play audio.'
                  );
                });
            }
          }
          audio.current.muted = false;
        }
      }
    };
    muteWhenNeeded();
  }, [muteAvatar, audioError, dispatch]);
}

export default usePlayAudio
