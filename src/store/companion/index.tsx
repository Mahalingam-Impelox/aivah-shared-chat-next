/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AVATAR_BG } from '../../common/constants/local-storage.key';
import { Companion } from '../../common/models/chatbot-customization';
import { MessageReponse, WebSearchSourceDetails } from '../../common/models/conversation.model';

interface CompanionState {
  createLoading: boolean;
  createSuccess: boolean;
  companions: object[];
  singleCompanionAvatar: object;
  voiceList: object[];
  storeCompanionFocus: number;
  isStopGenerationVisible: boolean;
  onMessageSend: string;
  stopGeneration: number;
  configureCompanion: object;
  configureVoiceSetup: { voiceEnv: string; voiceSetup: string; voiceId: number };
  configureKnowledgebase: number;
  configureConversation: number;
  configureLlmModal: string;
  configureVoice: string;
  messageResponse: MessageReponse;
  prevChatId: number;
  refreshCompanion: string;
  editCompanion: object;
  dashboardCompanion: Companion;
  closeCallConversation: number;
  openCallConversation: number;
  audioStopped: number;
  configureTalkToOpenAiLlm?: boolean;
  allCompanion: object;
  background: string;
  companionIndex: number;
  isChatTypeComplete: number;
  avatarLogo: any;
  avatarLogoRemoved: boolean;
  muteAvatar: boolean;
  publishCount: number;
  isConversationChanged: boolean;
  companionMessage: object;
  sessionId: number;
  isIframe: boolean;
  scrollLastMessage: boolean;
  highlightMuteButton: boolean;
  printAllMessageAtOnce: boolean;
  companionFocusType: string;
  isAudioPlaying: boolean;
  isListening: boolean;
  chatType: 'normal' | 'vision';
  sceneVideoUrl: string;
  selectedScene: 'videowall' | 'empty' | 'zen' | 'zen2' | 'webresults' | 'orbe' | 'presentation' | 'presentation2';
  webSearchSourceDetails: WebSearchSourceDetails[];
  isWebSearchResultLoading: boolean;
  audioStreamData: string | null;
  audioFrequencyData: number[] | null;
  videoElement: HTMLVideoElement | null;
  currentAnimation: string
  currentFacialExpression: string
  animationUpdate: boolean
  presentationPageNumber: number,
  isTranscriptionEnabled: boolean
  lipsyncData: {
    viseme: string;
    volume: number;
    isActive: boolean;
    lastActiveTime?: number;
    intensity: number;
  } | null
}

const initialState: CompanionState = {
  createLoading: false,
  createSuccess: false,
  companions: [],
  singleCompanionAvatar: {},
  voiceList: [],
  storeCompanionFocus: 1,
  isStopGenerationVisible: false,
  onMessageSend: '',
  stopGeneration: 0,
  configureCompanion: {},
  configureVoiceSetup: { voiceEnv: '', voiceSetup: '', voiceId: 0 },
  configureKnowledgebase: 0,
  configureConversation: 0,
  configureLlmModal: '',
  configureVoice: '',
  messageResponse: { chatId: 0 },
  prevChatId: 0,
  refreshCompanion: '',
  editCompanion: {},
  dashboardCompanion: {},
  closeCallConversation: 0,
  openCallConversation: 0,
  audioStopped: 0,
  configureTalkToOpenAiLlm: false,
  allCompanion: {},
  background: localStorage.getItem(AVATAR_BG) ? localStorage.getItem(AVATAR_BG) : '#4E5481',
  companionIndex: 0,
  isChatTypeComplete: 0,
  avatarLogo: null,
  avatarLogoRemoved: false,
  muteAvatar: false,
  publishCount: 0,
  isConversationChanged: false,
  companionMessage: {},
  sessionId: 0,
  isIframe: false,
  scrollLastMessage: false,
  highlightMuteButton: false,
  printAllMessageAtOnce: false,
  companionFocusType: 'body-focus',
  isAudioPlaying: false,
  isListening: false,
  chatType: 'normal',
  sceneVideoUrl: '',
  selectedScene: 'videowall',
  webSearchSourceDetails: [],
  isWebSearchResultLoading: false,
  audioStreamData: null,
  audioFrequencyData: null,
  videoElement: null,
  currentAnimation: 'Idle0',
  currentFacialExpression: 'Neutral',
  animationUpdate: false,
  presentationPageNumber: 1,
  isTranscriptionEnabled: false,
  lipsyncData: null
};

export const companionSlice = createSlice({
  name: 'companion',
  initialState,
  reducers: {
    // createCompanionSuccess(state: AuthState, action: PayloadAction<Object>) {},
    formatAllState(state: CompanionState) {
      state.createLoading = false;
      state.createSuccess = false;
    },
    startCreateCompanion(state: CompanionState) {
      state.createLoading = true;
    },
    createCompanionSuccess(state: CompanionState) {
      state.createSuccess = true;
      state.createLoading = false;
    },
    createCompanionFailure(state: CompanionState) {
      state.createSuccess = false;
    },
    getCompanions(state: CompanionState, action: PayloadAction<any>) {
      state.companions = action.payload;
    },
    getSingleCompanionAvatar(state: CompanionState, action: PayloadAction<any>) {
      state.singleCompanionAvatar = action.payload;
    },
    removeDeletedCompanion(state: CompanionState, action: PayloadAction<any>) {
      state.companions = state.companions.filter((companion) => companion.avatarId !== action.payload);
    },
    updateAvatarVoice(state: CompanionState, action: PayloadAction<any>) {
      if (state.companions) {
        state.companions.map((companion) => {
          if (companion.avatar_id === action.payload.id) companion.voiceSetup = action.payload.voiceSetup;
        });
      }
    },
    updateCompanionAvatar(state: CompanionState, action: PayloadAction<any>) {
      if (state.companions) {
        state.companions = state.companions.map((companion) => {
          if (companion.id === action.payload.id) {
            return action.payload;
          }
          return companion;
        });
      }
    },
    setVoiceList(state, action: PayloadAction<any>) {
      state.voiceList = [...action.payload];
    },
    setCompanionFocus: (state, action) => {
      state.storeCompanionFocus = Number(action.payload);
    },
    setIsStopGenerationVisible: (state, action) => {
      state.isStopGenerationVisible = action.payload;
    },
    setOnMessageSend: (state, action) => {
      state.onMessageSend = action.payload;
    },
    setStopGeneration: (state, action) => {
      state.stopGeneration = action.payload;
    },
    setConfigureCompanion: (state, action) => {
      state.configureCompanion = action.payload;
    },
    setConfigureKnowledgebase: (state, action) => {
      state.configureKnowledgebase = action.payload;
    },
    setConfigureConversation: (state, action) => {
      state.configureConversation = action.payload;
    },
    setConfigureLlmModal: (state, action) => {
      state.configureLlmModal = action.payload;
    },
    setConfigureVoice: (state, action) => {
      state.configureVoice = action.payload;
    },
    setConfigureVoiceSetup: (state, action) => {
      state.configureVoiceSetup = action.payload;
    },
    setMessageResponse: (state, action) => {
      state.messageResponse = action.payload;
    },
    setPrevChatId: (state, action) => {
      state.prevChatId = action.payload;
    },
    setRefreshCompanion: (state, action) => {
      state.refreshCompanion = action.payload;
    },
    setEditCompanion: (state, action) => {
      state.editCompanion = action.payload;
    },
    setDashboardCompanion: (state, action) => {
      state.dashboardCompanion = action.payload;
      state.background = state.dashboardCompanion.avtarBackground || '#4E5481';
    },
    setCloseCallConversation: (state, action) => {
      state.closeCallConversation = action.payload;
    },
    setOpenCallConversation: (state, action) => {
      state.openCallConversation = action.payload;
    },
    setAudioStopped: (state, action) => {
      state.audioStopped = action.payload;
    },
    setConfigureTalkToOpenAiLlm: (state, action) => {
      state.configureTalkToOpenAiLlm = action.payload;
    },
    setAllCompanion: (state, action) => {
      state.allCompanion = action.payload;
    },
    setAvatarBackground: (state, action) => {
      state.background = action.payload;
    },
    setCompanionIndex: (state, action) => {
      state.companionIndex = action.payload;
    },
    setIsChatTypeComplete: (state, action) => {
      state.isChatTypeComplete = action.payload;
    },
    setAvatarLogo: (state, action) => {
      state.avatarLogo = action.payload;
    },
    setAvatarLogoRemoved: (state, action) => {
      state.avatarLogoRemoved = action.payload;
    },
    setAvatarVoiceMute: (state, action) => {
      state.muteAvatar = action.payload;
    },
    setPublishCount: (state, action) => {
      state.publishCount = action.payload;
    },
    setIsConversationChanged: (state, action) => {
      state.isConversationChanged = action.payload;
    },
    setCompanionMessage: (state, action) => {
      state.companionMessage = action.payload;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setIsIframe: (state, action) => {
      state.isIframe = action.payload;
    },
    setScrollLastMessage: (state, action) => {
      state.scrollLastMessage = action.payload;
    },
    setHighlightMuteButton: (state, action) => {
      state.highlightMuteButton = action.payload;
    },
    setPrintAllMessageAtOnce: (state, action) => {
      state.printAllMessageAtOnce = action.payload;
    },
    setCompanionFocusViewType: (state, action) => {
      state.companionFocusType = action.payload;
    },
    setIsAudioPlaying: (state, action: PayloadAction<boolean>) => {
      state.isAudioPlaying = action.payload;
    },
    setisListening: (state, action: PayloadAction<boolean | string>) => {
      if (action.payload === 'toggle') {
        state.isListening = !state.isListening;
      } else {
        state.isListening = action.payload;
      }
    },
    setChatType: (state, action: PayloadAction<'normal' | 'vision'>) => {
      state.chatType = action.payload;
    },
    setIsLitening: (state, action: PayloadAction<boolean | string>) => {
      if (action.payload === 'toggle') {
        state.isListening = !state.isListening;
      } else {
        state.isListening = action.payload;
      }
    },
    setSceneVideoUrl: (state, action: PayloadAction<string>) => {
      state.sceneVideoUrl = action.payload;
    },
    setWebSearchSourceDetails: (state, action) => {
      state.webSearchSourceDetails = action.payload;
    },
    setIsWebSearchResultLoading: (state, action) => {
      state.isWebSearchResultLoading = action.payload;
    },
    setSelectedScene: (state, action: PayloadAction<'videowall' | 'empty' | 'zen' | 'zen2' | 'webresults' | 'orbe' | 'presentation' | 'presentation2'>) => {
      state.selectedScene = action.payload;
    },
    setAudioStreamData: (state, action: PayloadAction<'streaming' | 'complete' | null>) => {
      state.audioStreamData = action.payload;
    },
    setAudioFrequencyData: (state, action: PayloadAction<number[] | null>) => {
      state.audioFrequencyData = action.payload;
    },
    setVideoElement: (state, action: PayloadAction<HTMLVideoElement | null>) => {
      state.videoElement = action.payload;
    },
    setCurrentAnimation: (state, action: PayloadAction<string>) => {
      state.currentAnimation = action.payload;
    },
    setCurrentFacialExpression: (state, action: PayloadAction<string>) => {
      state.currentFacialExpression = action.payload;
    },
    setAnimationUpdate: (state, action: PayloadAction<boolean>) => {
      state.animationUpdate = action.payload;
    },
    setPresentationPageNumber: (state, action: PayloadAction<number>) => {
      state.presentationPageNumber = action.payload;
    },
    setIsTranscriptionEnabled: (state, action: PayloadAction<boolean>) => {
      state.isTranscriptionEnabled = action.payload;
    },
    setLipsyncData: (state, action: PayloadAction<{
      viseme: string;
      volume: number;
      isActive: boolean;
      lastActiveTime?: number;
      intensity: number;
    }>) => {
      state.lipsyncData = action.payload;
    }
  }
});

export const {
  createCompanionSuccess,
  startCreateCompanion,
  createCompanionFailure,
  formatAllState,
  getCompanions,
  getSingleCompanionAvatar,
  removeDeletedCompanion,
  updateAvatarVoice,
  updateCompanionAvatar,
  setVoiceList,
  setCompanionFocus,
  setIsStopGenerationVisible,
  setOnMessageSend,
  setStopGeneration,
  setConfigureCompanion,
  setConfigureKnowledgebase,
  setConfigureConversation,
  setConfigureLlmModal,
  setConfigureVoice,
  setConfigureVoiceSetup,
  setMessageResponse,
  setPrevChatId,
  setRefreshCompanion,
  setEditCompanion,
  setDashboardCompanion,
  setCloseCallConversation,
  setOpenCallConversation,
  setAudioStopped,
  setConfigureTalkToOpenAiLlm,
  setAllCompanion,
  setAvatarBackground,
  setCompanionIndex,
  setIsChatTypeComplete,
  setAvatarLogo,
  setAvatarLogoRemoved,
  setAvatarVoiceMute,
  setPublishCount,
  setIsConversationChanged,
  setCompanionMessage,
  setSessionId,
  setIsIframe,
  setScrollLastMessage,
  setHighlightMuteButton,
  setPrintAllMessageAtOnce,
  setCompanionFocusViewType,
  setIsAudioPlaying,
  setisListening,
  setChatType,
  setIsLitening,
  setSceneVideoUrl,
  setWebSearchSourceDetails,
  setIsWebSearchResultLoading,
  setSelectedScene,
  setAudioStreamData,
  setAudioFrequencyData,
  setVideoElement,
  setCurrentAnimation,
  setCurrentFacialExpression,
  setAnimationUpdate,
  setPresentationPageNumber,
  setIsTranscriptionEnabled,
  setLipsyncData
} = companionSlice.actions;

export default companionSlice.reducer;
