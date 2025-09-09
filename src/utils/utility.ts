import { int16ArrayToWav, setAudio } from "./audio-player";
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import copy from 'copy-to-clipboard';
import { TOAST_STATE, ToasterService } from "@/sharedComponents/toaster/toaster.service";

interface Viseme {
  start: number;
  end: number;
  value: string;
}

interface socketReplyFormat {
  text: string;
  audio: Int16Array;
  animation: string;
  facialExpression: string;
  cues: { message: string, mouthCues: Viseme[] }
  chatType: string
};

/**
 * @description - function to copy chat to clipboard
 * @param chat - string representing the text to be copied
 */
export const copyChat = (chat: string) => {
  const plainText = removeMarkdown(chat);
  const isCopied = copy(plainText);
  if (isCopied) {
    ToasterService.showToast(TOAST_STATE.info, 'Chat copied to clipboard');
  }
};

/**
 * @description - function to remove markdown
 * @param input - text from which markdown has to be removed
 * @returns - text without markdown symbols
 */
export function removeMarkdown(input: string) {
  const processor = unified().use(remarkParse).use(remarkStringify);
  const markdownText = processor.stringify(processor.parse(input));
  const markdownRegex = /([*_~`]|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
  return markdownText.replace(markdownRegex, '');
}


export const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

/**
 * Validates email based on RFC2822 standards
 * @param email string representing user email
 * @returns 
 */
export const checkEmailValidity = (email:string) => {
  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return emailRegex.test(email);
}

export const checkPhoneNumberValidity = (number:string) => {
  const numericNumber = +number
  if (isNaN(numericNumber)) {
    return false
  } else {
    if(number.length >= 5 && number.length <= 15) {
      return true
    } else {
      return false
    }
  }
}


/**
 * @description - format chat received from the socket
 * @param data - data received from socket
 */
export function formatAdminWebSocketChat(data: socketReplyFormat) {
  // audio-processing (converting to wav blob)
  const blob = int16ArrayToWav(data?.audio);
  const blobUrl = window.URL.createObjectURL(blob);
  const audio = setAudio(blobUrl);
  const chatObject = {
    chat: data?.text,
    chatId: 1,
    customerId: 1,
    dateTime: new Date().toISOString(),
    isAttended: false,
    isNewText: true,
    userSessionId: 1,
    isLike: 0,
    animation: data?.animation,
    expression: data?.facialExpression,
    credits: 10,
    audio: audio?.src,
    cues: data?.cues,
    chatType: data?.chatType
  }
  return chatObject;
}