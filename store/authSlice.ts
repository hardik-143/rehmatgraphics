import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUserAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  firmName?: string;
  address?: AuthUserAddress;
  visitingCardAssetId?: string | null;
  visitingCardAssetUrl?: string | null;
  visitingCardOriginalFilename?: string | null;
  is_admin?: boolean;
  is_approved?: boolean;
}

interface AuthState {
  user: AuthUser | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    clearCredentials(state) {
      state.user = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
