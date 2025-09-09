import { LeadMessage, LeadReply } from '@/utils/interfaces/conversation.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface ConversationState {
  storeConversationId?: number;
  storeKnowledgeBaseId?: number;
  storeLlmModelId?: number;
  storeLeadFormFulfilled: boolean;
  storeCurrentLeadFormField: LeadMessage;
  storeLeadFormFields: LeadMessage[],
  storeLeadFormReplies: LeadReply[],
  storeErrorMessage: string
}

const initialState: ConversationState = {
  storeConversationId: 0,
  storeKnowledgeBaseId: 0,
  storeLlmModelId: 0,
  storeLeadFormFulfilled: false,
  storeCurrentLeadFormField: {fieldName: "", isMandatory: 1, isReplied: false},
  storeLeadFormFields: [],
  storeLeadFormReplies: [],
  storeErrorMessage: ""
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setStoreConversationId: (state, action: any) => {
      state.storeConversationId = Number(action.payload === 'new' ? 0 : action?.payload);
    },
    setStoreKnowledgeBaseId: (state, action: any) => {
      state.storeKnowledgeBaseId = Number(action.payload);
    },
    setStoreLlmModelId: (state, action: any) => {
      state.storeLlmModelId = Number(action.payload);
    },
    setStoreLeadFormFulfilled: (state, action: PayloadAction<boolean>) => {
      state.storeLeadFormFulfilled = action.payload
    },
    setStoreCurrentLeadFormField: (state, action: PayloadAction<{value:LeadMessage, isUpdate?: boolean}>) => {
      if (action?.payload?.isUpdate) {
        state.storeCurrentLeadFormField = {...state.storeCurrentLeadFormField, isReplied: true}
      }
      state.storeCurrentLeadFormField = action.payload.value
    },
    setStoreLeadFormReplies: (state, action: PayloadAction<{reply:string, fieldName:string}>) => {
      state.storeLeadFormReplies = [...state.storeLeadFormReplies, {label:action.payload.fieldName, reply:action.payload.reply}]
    },
    setStoreErrorMessage: (state, action:PayloadAction<string>) => {
      state.storeErrorMessage = action.payload
    },
    setStoreLeadFormFields: (state, action: PayloadAction<{value?:LeadMessage[], isUpdate?: boolean, currentLeadFormField?: LeadMessage}>) => {
      if (action?.payload?.isUpdate && action.payload.currentLeadFormField) {
        const updatedState = state.storeLeadFormFields.map((field) => {
          if (field?.fieldName === action.payload.currentLeadFormField?.fieldName) { 
            return action.payload.currentLeadFormField  
          } else {
            return field
          }
        })
        state.storeLeadFormFields = updatedState
      }
      if (action?.payload?.value) {
        state.storeLeadFormFields = action.payload.value
      }
    }
  },
});

export const { setStoreConversationId, setStoreKnowledgeBaseId, setStoreLlmModelId , setStoreLeadFormFulfilled, setStoreCurrentLeadFormField, setStoreLeadFormFields, setStoreLeadFormReplies, setStoreErrorMessage} = conversationSlice.actions;

export default conversationSlice.reducer;
