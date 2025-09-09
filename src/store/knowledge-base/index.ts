import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Theming } from '@/utils/interfaces/chatbot-customization.interface';

interface KnowledgeBaseState {
  knowledgeBaseId?: number;
  theme?: Theming;
  initialMessages: string[];
  basicDetails?: any;
  isPasswordValidate: boolean;
  knowledgeBaseType: 'default' | 'multimodal' | 'realtime' | '';
  isPresentationAgent?: boolean
}

const initialState: KnowledgeBaseState = {
  initialMessages: [],
  isPasswordValidate: false,
  knowledgeBaseType: ''
};

const knowledgeBaseSlice = createSlice({
  name: 'knowledgeBase',
  initialState,
  reducers: {
    storeKnowledgeBaseId: (state, action: any) => {
      state.knowledgeBaseId = action.payload;
    },
    setBasicTheme(state, action: PayloadAction<Theming>) {
      state.theme = action.payload;
    },
    setInitialMessages(state, action: PayloadAction<string[]>) {
      state.initialMessages = action.payload;
    },
    setBasicDetails(state, action: any) {
      state.basicDetails = action?.payload;
    },
    setPasswordValidate(state, action: any) {
      state.isPasswordValidate = action.payload;
    },
    setKnowledgeBaseType(state, action: PayloadAction<'default' | 'multimodal'| 'realtime'>) {
      state.knowledgeBaseType = action.payload;
    },
    setPresentationAgent(state, action: PayloadAction<boolean>) {
      state.isPresentationAgent = action.payload;
    },
  }
});

export const { storeKnowledgeBaseId, setBasicTheme, setInitialMessages, setBasicDetails, setPasswordValidate, setKnowledgeBaseType,  setPresentationAgent } =
  knowledgeBaseSlice.actions;

export default knowledgeBaseSlice.reducer;
