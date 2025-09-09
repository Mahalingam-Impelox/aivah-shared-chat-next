export interface GetConversation {
  message: string;
  conversations: Conversations[];
}

export interface Conversations {
  conversationId: number;
  conversationName: string;
  isActive?: boolean;
  isEdit?: boolean;
  chatList?: Chat[];
}

export interface GetChatList {
  message: string;
  chats: Chat[];
}

export interface Chat {
  chatId: number;
  chat: string;
  chatType?: 'normal' | 'smalltalk' | 'websearch' | 'vision';
  customerId: number;
  userSessionId: number;
  isAttended: any;
  dateTime: string;
  isNewText: boolean;
  isLike: number;
}

export interface SendChatResponse {
  message: string;
  chat: {
    followUpChatId: number;
    conversationName: string;
    credits: number;
    chatDetails: Array<{
      chat: string;
      chatId: number;
      customerId: number;
      dateTime: string;
      isAttended: boolean;
      isNewText: boolean;
      userSessionId: number;
      isLike: number;
      animation: string;
      expression: string;
      credits: number;
    }>;
  };
}

export interface GetChatSource {
  message: string;
  chatSource: ChatSource[];
}

export interface ChatSource {
  chatBotContentType: string;
  storagePath: string;
  url: string;
}

export interface SendChatResponseExp {
  message: string;
  chat: {
    followUpChatId: number;
    conversationName: string;
    credits: number;
    chatDetails: Array<{
      chat: string;
      chatId: number;
      customerId: number;
      dateTime: string;
      isAttended: boolean;
      isNewText: boolean;
      userSessionId: number;
      isLike: number;
      animation: string;
      expression: string;
      credits: number;
      audio?: any;
      cues?: any;
      duration?: any;
      chatType?: 'normal' | 'websearch' | 'smalltalk' | 'vision';
    }>;
  };
}

export interface MessageReponse {
  chatId: number
  chat: string
  chatType: 'normal' | 'websearch' | 'smalltalk' | 'vision'
  animation: string
  expression: string
  customerId: any
  isAttended: number
  dateTime: string
  credits: number
  audio: string
  cues: Cues
  duration: number
  isNewText: boolean
}

export interface Cues {
  message: string
  mouthCues: MouthCue[]
}

export interface MouthCue {
  start: number
  end: number
  time: number
  value: string
}
export interface LeadMessage {
    fieldName: string;
    isMandatory: number;
    isReplied: boolean;
}

export interface LeadReply  {
  label : string,
  reply: string
}

export interface WebSearchSourceDetails {
  url: string;
  title: string;
  imageUrl: string;
}
export interface Companion {
  id: number
  avatarId: string
  url: string
  animation: string
  animationName: string
  avatarName: string
  avtarBackground: string
  status: number
  createdDatetime: string
  voiceId: number
  voiceSetup: string
  avatarType: 'system' | 'custom' | 'orbe'
}

export interface WebChatSource {
  message: string
  urlDetails?: WebSearchSourceDetails[]
}