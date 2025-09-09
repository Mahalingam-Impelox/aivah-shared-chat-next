import { GetChatList, GetConversation, SendChatResponse, SendChatResponseExp, WebChatSource } from '../interfaces/conversation.interface';
import { BaseApi } from './base-api';

export default class CommonAPI {
  public static async getBasicInformation(knowledgeBaseId: number): Promise<any> {
    return await BaseApi.get(`embed-share/${knowledgeBaseId}`);
  }

  public static async getKbDetails(): Promise<any> {
    return await BaseApi.get(`embed-share/chatbot`);
  }

  public static async validateUUID(uuid: string, data?: any): Promise<any> {
    return await BaseApi.get(`embed-share/validate/${uuid}`, data);
  }

  public static createConversation = async (payload: {
    sessionId: string;
    ipAddress: string;
    deliveryType: 'text' | 'companion' | 'vision';
  }, token?: string): Promise<any> => {
    return await BaseApi.post(`embed-share/conversation`, {
      ...payload
    }, undefined, token);
  };

  public static deleteConversation = async (_knowledgeBaseId: number, conversationIds: string): Promise<GetConversation> => {
    return await BaseApi.delete(`embed-share/conversation`, {
      params: { conversationIds }
    });
  };

  public static getFollowup = async (knowledgeBaseId: number, conversationId: number, chatId: number): Promise<GetConversation> => {
    return await BaseApi.get(`/embed-share/${knowledgeBaseId}/conversation/${conversationId}/chat/${chatId}/followup`);
  };

  public static followups = async (conversationId: number, chatId: number): Promise<GetConversation> => {
    return await BaseApi.get(`/embed-share/conversation/${conversationId}/chat/${chatId}/followup`);
  };

  public static getChats = async (conversationId: number, page?: number): Promise<GetChatList> => {
    return await BaseApi.get(`embed-share/conversation/${conversationId}/chat`, { page });
  };

  public static initialFollowups = async (conversationId: number): Promise<any> => {
    return await BaseApi.get(`/embed-share/conversation/${conversationId}/chat/initial-followup`);
  };

  public static createChat = async (
    conversationId: number,
    chat: string,
    llmModel: string,
    userSessionId: number,
    signal: any
  ): Promise<SendChatResponse> => {
    return await BaseApi.postWithCancel(`embed-share/conversation/${conversationId}/chat`, { chat, llmModel, userSessionId }, signal);
  };

  public static validatePassword = async (password: string): Promise<any> => {
    return await BaseApi.post(`embed-share/validate-password`, { password });
  };

  public static submitUserLead = async (payload: any): Promise<any> => {
    return await BaseApi.post(`embed-share/user-lead`, payload);
  };

  public static checkUserLead = async (userSessionId: number): Promise<any> => {
    return await BaseApi.get(`/embed-share/user-lead`, {
      userSession: userSessionId
    });
  };

  public static deleteChat = async (conversationId: number, chatId: number[]): Promise<SendChatResponse> => {
    return await BaseApi.post(`embed-share/conversation/${conversationId}/chat/delete`, {
      chatIds: chatId
    });
  };

  public static likeableChat = async (conversationId: number, chatId: number, userSessionId: number, likeable: number): Promise<any> => {
    return await BaseApi.post(`/embed-share/conversation/${conversationId}/chat/${chatId}`, {
      userSessionId,
      likeable
    });
  };

  public static sendChatExp = async (
    conversationId: number,
    chat: string,
    questionId: string,
    llmModel: string,
    signal: any,
    userSessionId: number,
    frames?: Array<string | ImageData>,
    chatType: 'normal' | 'vision' | 'websearch' | 'smalltalk' = 'normal',
    isTalkToLlm: boolean = false,
    webSearchTools?: string[]
  ): Promise<SendChatResponseExp> => {
    return await BaseApi.postWithCancel(
      `embed-share/conversation/${conversationId}/chat`,
      { chat, llmModel, userSessionId, frames, chatType, webSearchTools, questionId, isTalkToLlm },
      signal
    );
  };

  public static deleteChatExp = async (conversationId: number, chatId: number[]): Promise<SendChatResponse> => {
    return await BaseApi.post(`embed-share/conversation/${conversationId}/chat/delete`, {
      chatIds: chatId
    });
  };

  public static getAvatarDetails = async (avatarId: number): Promise<any> => {
    return BaseApi.get(`/embed-share/avatar/${avatarId}`);
  };

  public static getBaseAvatarDetails = async (avatarId: number): Promise<any> => {
    return BaseApi.get(`/embed-share/avatar-detail/${avatarId}`);
  };

  public static validateParams = async (knowledgeBaseId: number, avatarId: number): Promise<any> => {
    return BaseApi.get('/embed-share/params/validate', {
      avatarId,
      chatbotId: knowledgeBaseId
    });
  };

  public static async getKnowledgeBaseDetails(): Promise<any> {
    return BaseApi.get(`embed-share/knowledge-base`);
  }

  public static async getIsIframeLoaded(iframeUrl: string): Promise<any> {
    return BaseApi.get(`embed-share/iframe?iframeUrl=${iframeUrl}`);
  }

  public static getWebSearchSource = async (
    conversationId: number,
    chatId: number
  ): Promise<WebChatSource> => {
    return await BaseApi.get(`/embed-share/conversation/${conversationId}/chat/${chatId}/web-search-source`);
  };


  public static async fetchSourceUrlDetails(
    sourceUrls: string[]
  ): Promise<void> {
    try {
      const response = await BaseApi.post('miscellaneous/source-url', {
        sourceUrl: sourceUrls
      });
      return response;
    } catch (error) {
      console.error('Error fetching source URL details:', error);
    }
  }


  public static async syncChatMessage(
    chat: string,
    conversationId: number,
    chatType: string
  ): Promise<void> {
    try {
      const response = await BaseApi.post('lk-session/sync-chat', {
        chat,
        conversationId,
        chatType
      });
      return response;
    } catch (error) {
      console.error('Error fetching source URL details:', error);
    }
  }

}
