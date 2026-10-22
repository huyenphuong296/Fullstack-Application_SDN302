import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client, { errorMessage } from '../../api/client';

const loadSaved = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('auth'));
    if (saved?.token && saved?.user) return saved;
  } catch { /* ignore broken data */ }
  return { token: null, user: null };
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/users/login', credentials);
    return { token: data.token, user: data.user };
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

export const register = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await client.post('/users/signup', credentials);
    return data.user;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { ...loadSaved(), status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => { state.status = 'idle'; state.error = action.payload; })
      .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(register.fulfilled, (state) => { state.status = 'idle'; })
      .addCase(register.rejected, (state, action) => { state.status = 'idle'; state.error = action.payload; });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
