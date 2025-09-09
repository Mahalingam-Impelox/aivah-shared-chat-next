import { CallInteractionMethod } from '@/utils/enums/vision-agent';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface VisionAgentSlice {
  visionMode: 0 | 1 | 2 // 0 --> camera disabled state, 1 --> camera enabled state, 2 --> screen share enabled state
  base64Images: Array<string | ImageData>
  interactionMethod: CallInteractionMethod
  cachedConversationId: number
}

const initialState: VisionAgentSlice = {
  visionMode: 0,
  base64Images: [],
  interactionMethod: CallInteractionMethod.Voice,
  cachedConversationId: 0
};

const visionAgentSlice = createSlice({
  name: 'visionAgent',
  initialState,
  reducers: {
    setVisionMode: (state, action: PayloadAction<0 | 1 | 2>) => {
      state.visionMode = action.payload;
    },
    setBase64Images: (state, action: PayloadAction<Array<string | ImageData> | []>) => {
      state.base64Images = action.payload;
    },
    addBase64Images: (state, action: PayloadAction<Array<string | ImageData> | []>) => {
      if (state.base64Images.length < 10) {
        state.base64Images = [...state.base64Images, ...action.payload]
      }
    },
    setInteractionMethod: (state, action: PayloadAction<CallInteractionMethod>) => {
      state.interactionMethod = action.payload;
    },
    setCachedConversationId: (state, action: PayloadAction<number>) => {
      state.cachedConversationId = action.payload;
    }
  }
});

export const {
  setVisionMode,
  setBase64Images,
  addBase64Images,
  setInteractionMethod,
  setCachedConversationId
} = visionAgentSlice.actions;
export default visionAgentSlice.reducer;
