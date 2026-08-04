import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  isMobileNavOpen: boolean;
}

const initialState: UiState = {
  isMobileNavOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setIsMobileNavOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.isMobileNavOpen = payload;
    },
  },
});

export const { setIsMobileNavOpen } = uiSlice.actions;
export const selectUi = (state: { ui: UiState }) => state.ui;
