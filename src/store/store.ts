import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import conversation from './conversation';
import knowledgeBase from './knowledge-base';
import companion from './companion';
import visionAgent from './vision-agent';
import avatar from './avatar-walk'

const rootReducer = combineReducers({
  companion,
  conversation,
  knowledgeBase,
  visionAgent,
  avatar,
});

const store = configureStore({ reducer: rootReducer });

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
