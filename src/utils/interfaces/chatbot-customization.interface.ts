export interface Theming {
  chatBotThemeId: number;
  chatBotId: number;
  fontFamily: string;
  fontSize: string;
  backgroundColor: string;
  inputBackground: string;
  fontColor: string;
  promptsFontColor: string;
  scrollBarColor: string;
  productFontColor: string;
  logoRedirectLink: string;
  botMessageBackgroundColor: string;
  suggestedPromptBackground: string;
  userMessageBackground: string;
  timeFontColor: string;
  logoLink: string;
  customCss: string;
  dataForm: LeadForm;
}

export interface BasicInfo {
  initialMessages: string[];
  basicDetails: any[];
}

export interface InitialMessage {
  chatInitialChatbotMessageId: number;
  chatBotId: number;
  message: string;
}

export interface InitialSuggestedPrompt {
  chatInitialSuggestedPromptId: number;
  chatBotId: number;
  prompts: string;
}

export interface LeadForm {
  chatBotLeadFormId: number;
  title: string;
  userConsentText: string;
  fields: Field[];
}

export interface Field {
  chatBotLeadInputFieldId: number;
  placeholder: string;
  label: string;
  isMandatory: number;
  type: string;
}

export interface Companion {
  id: number;
  avatarId: string;
  url: string;
  animation: string;
  animationName: string;
  avatarName: string;
  avatarBackground: string;
  status: number;
  createdDatetime: string;
  voiceId: number;
  voiceSetup: string;
  avatarType: 'system' | 'custom' | 'orbe'
  scene: 'empty' | 'zen' | 'zen2' | 'videowall' | 'presentation' | 'presentation2';
  color: string;
}
