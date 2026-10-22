import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import questionReducer from '../features/questions/questionSlice';
import quizReducer from '../features/quizzes/quizSlice';
import { injectStore } from '../api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questions: questionReducer,
    quizzes: quizReducer
  }
});

injectStore(store);

// Keep the session across page reloads
store.subscribe(() => {
  const { token, user } = store.getState().auth;
  if (token) {
    localStorage.setItem('auth', JSON.stringify({ token, user }));
  } else {
    localStorage.removeItem('auth');
  }
});
