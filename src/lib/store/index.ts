import { configureStore } from '@reduxjs/toolkit';

import applicationsReducer from './applicationsSlice';
import jobsReducer from './jobsSlice';
import listenerMiddleware from './persistence';

export const makeStore = () =>
  configureStore({
    reducer: {
      jobs: jobsReducer,
      applications: applicationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
