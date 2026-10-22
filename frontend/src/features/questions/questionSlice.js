import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client, { errorMessage } from '../../api/client';
import { logout } from '../auth/authSlice';

const thunk = (type, request) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      const { data } = await request(arg);
      return data;
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  });

export const fetchQuestions = thunk('questions/fetchAll', () => client.get('/questions'));
export const addQuestion = thunk('questions/add', (question) => client.post('/questions', question));
export const updateQuestion = thunk('questions/update', ({ id, ...question }) => client.put(`/questions/${id}`, question));
export const deleteQuestion = thunk('questions/delete', (id) => client.delete(`/questions/${id}`));

const questionSlice = createSlice({
  name: 'questions',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchQuestions.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
      .addCase(fetchQuestions.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload; })
      .addCase(addQuestion.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const i = state.items.findIndex((q) => q._id === action.payload._id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q._id !== action.payload._id);
      })
      .addCase(logout, () => ({ items: [], status: 'idle', error: null }));
  }
});

export default questionSlice.reducer;
