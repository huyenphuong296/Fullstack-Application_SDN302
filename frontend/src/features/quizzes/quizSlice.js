import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import client, { errorMessage } from "../../api/client";
import { logout } from "../auth/authSlice";
import { deleteQuestion } from "../questions/questionSlice";

const thunk = (type, request) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      const { data } = await request(arg);
      return data;
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  });

export const fetchQuizzes = thunk("quizzes/fetchAll", () =>
  client.get("/quizzes"),
);
export const addQuiz = thunk("quizzes/add", (quiz) =>
  client.post("/quizzes", quiz),
);
export const updateQuiz = thunk("quizzes/update", ({ id, ...quiz }) =>
  client.put(`/quizzes/${id}`, quiz),
);
export const deleteQuiz = thunk("quizzes/delete", (id) =>
  client.delete(`/quizzes/${id}`),
);
export const submitQuiz = thunk("quizzes/submit", ({ quizId, answers }) =>
  client.post(`/quizzes/${quizId}/submit`, { answers }),
);
//tiến trình làm quiz được lưu tại đây
const emptyPlay = {
  quizId: null, // đang làm quiz nào
  current: 0, // đang ở câu thứ mấy (0 = câu 1)
  answers: {}, // các đáp án đã chọn: { idCâuHỏi: indexĐáp án }
  result: null, // kết quả chấm điểm (null = chưa nộp)
  submitting: false, // đang gửi bài lên server?
  error: null,
};

const quizSlice = createSlice({
  name: "quizzes",
  initialState: { items: [], status: "idle", error: null, play: emptyPlay },
  reducers: {
    // Taking a quiz: one question at a time
    startQuiz(state, action) {
      // bắt đầu / làm lại
      state.play = { ...emptyPlay, quizId: action.payload };
    },
    answerQuestion(state, action) {
      //chọn đáp án
      const { questionId, index } = action.payload;
      state.play.answers[questionId] = index;
    },
    nextQuestion(state) {
      //sang câu tiếp theo
      state.play.current += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const i = state.items.findIndex((q) => q._id === action.payload._id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q._id !== action.payload._id);
      })
      // A deleted question disappears from every quiz on the server, mirror that here
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items.forEach((quiz) => {
          quiz.questions = quiz.questions.filter(
            (q) => q._id !== action.payload._id,
          );
        });
      })
      .addCase(submitQuiz.pending, (state) => {
        state.play.submitting = true;
        state.play.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.play.submitting = false;
        state.play.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.play.submitting = false;
        state.play.error = action.payload;
      })
      .addCase(logout, () => ({
        items: [],
        status: "idle",
        error: null,
        play: emptyPlay,
      }));
  },
});

export const { startQuiz, answerQuestion, nextQuestion } = quizSlice.actions;
export default quizSlice.reducer;
