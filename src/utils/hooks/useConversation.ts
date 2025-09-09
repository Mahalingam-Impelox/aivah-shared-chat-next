import { setConfigureConversation, setStopGeneration } from '@/store/companion';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setCachedConversationId } from '@/store/vision-agent';
import CommonAPI from '@/utils/api/common-api';
import { CONVERSATION_ID } from '@/utils/constants/local-storage.key';
import axios from 'axios';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface UseConversation {
  createAndSetNewConversation: () => Promise<void>
  deleteAndClearConversation: () => Promise<void>
}

/**
 * Use this Hook to call ready to use functions for conversation in any component
 */

const useConversation = (): UseConversation => {
  const { configureKnowledgebase: knowledgeBaseId, configureConversation: conversationId } = useAppSelector(state => state.companion)
  const { cachedConversationId, visionMode } = useAppSelector(state => state.visionAgent)
  const dispatch = useAppDispatch()

  const createAndSetNewConversation = async (): Promise<void> => {
    try {
      const getIpAddress = await axios.create({ baseURL: 'https://api64.ipify.org/' }).get('?format=json');
      const ipAddress = getIpAddress.data?.ip;
      const sessionId = uuidv4();
      const conversationDetails = await CommonAPI.createConversation(
        {
          deliveryType: 'vision',
          ipAddress,
          sessionId
        }
      );

     const conversationIdResponseId = conversationDetails.conversationId
     dispatch(setCachedConversationId(knowledgeBaseId))
     dispatch(setConfigureConversation(conversationIdResponseId));
   } catch (error) {
     console.error('Conversation couldn\'t be created')
   }
  }

  const deleteAndClearConversation = async (): Promise<void> => {
    try {
      await CommonAPI.deleteConversation(knowledgeBaseId, conversationId.toString());
      dispatch(setConfigureConversation(Number(sessionStorage.getItem(CONVERSATION_ID))))
      dispatch(setCachedConversationId(0))
    } catch (error) {
      console.error('Conversation couldn\'t be deleted')
    }
  }

  useEffect(() => {
    if (visionMode && !cachedConversationId) {
      dispatch(setStopGeneration(Math.random()))
      createAndSetNewConversation()
    } else if (!visionMode) {
      dispatch(setStopGeneration(Math.random()))
      if (cachedConversationId) deleteAndClearConversation()
    }
  }, [visionMode, cachedConversationId, createAndSetNewConversation, deleteAndClearConversation, dispatch]);

  return { createAndSetNewConversation, deleteAndClearConversation };
}

export default useConversation
