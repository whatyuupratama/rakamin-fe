import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  type ApplicationEntry,
  loadApplications,
} from '@/lib/applicationStorage';

export type ApplicationsState = {
  entries: ApplicationEntry[];
};

const initialState: ApplicationsState = {
  entries: loadApplications(),
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setApplications(state, action: PayloadAction<ApplicationEntry[]>) {
      state.entries = action.payload;
    },
    addApplication(state, action: PayloadAction<ApplicationEntry>) {
      state.entries = [...state.entries, action.payload];
    },
  },
});

export const { setApplications, addApplication } = applicationsSlice.actions;

export default applicationsSlice.reducer;
