import { SetStateAction, useRef, useState } from 'react';
 
import { useAppSelector } from '@/store/store';
import CommonAPI from '@/utils/api/common-api';
import { atom, PrimitiveAtom, useAtom } from 'jotai';
import { Chat, GetChatList } from '../interfaces/conversation.interface';

type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;
declare interface WithInitialValue<Value> {
  init: Value;
};


interface useChatHelperInterface {
  chatContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  scrollToBottom: boolean;
  setScrollToBottom: React.Dispatch<React.SetStateAction<boolean>>;
  refreshing: boolean;
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  chatLength: number;
  setChatLength: React.Dispatch<React.SetStateAction<number>>;
  totalCount: number;
  setTotalCount: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  isChatLoading: boolean;
  setIsChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
  chats: Chat[];
  setChats: SetAtom<[SetStateAction<Chat[]>], void>;
  bottomContentRef: React.MutableRefObject<HTMLDivElement | null>;
  chatsAtom: PrimitiveAtom<Chat[]> & WithInitialValue<Chat[]>;
  handleScroll: () => void;
  getChatList: (page: number) => Promise<number | undefined>;
}


const useChatHelper = (): useChatHelperInterface => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollToBottom, setScrollToBottom] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatLength, setChatLength] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { configureConversation } = useAppSelector(
    (state) => state.companion
    );
  const chatsAtom = atom<Chat[]>([]); 
  const [chats, setChats] = useAtom(chatsAtom);
  const bottomContentRef = useRef<HTMLDivElement | null>(null);

  const getChatList = async (page: number): Promise<number | undefined> => {
    try {
      setIsChatLoading(true);
      const response: GetChatList = await CommonAPI.getChats(
        configureConversation || 0,
        page
      );
      setTotalCount(response.chats?.length);
      setChats(response.chats.reverse());
      setRefreshing(false);
      setChatLength((value) => value + response.chats.length);

      setTimeout(() => {
        if (bottomContentRef.current && scrollToBottom) {
          bottomContentRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      return response.chats?.length || 0;
    } catch (exception) {
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleScroll = (): void => {
    if (chatContainerRef.current) {
      const scrollTop = chatContainerRef.current.scrollTop;
      if (scrollTop === 0 && !refreshing && chatLength < totalCount) {
        setScrollToBottom(false);
        setRefreshing(true);
        getChatList(currentPage + 1);
        setCurrentPage((value) => value + 1);
      }
    }
  };

  return {
    chatContainerRef,
    scrollToBottom,
    setScrollToBottom,
    refreshing,
    setRefreshing,
    chatLength,
    setChatLength,
    totalCount,
    setTotalCount,
    currentPage,
    setCurrentPage,
    isChatLoading,
    setIsChatLoading,
    chats,
    setChats,
    bottomContentRef,
    chatsAtom,
    handleScroll,
    getChatList
  };
}

export { useChatHelper };

