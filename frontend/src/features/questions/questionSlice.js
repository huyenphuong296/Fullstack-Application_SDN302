import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import client, { errorMessage } from "../../api/client";
import { logout } from "../auth/authSlice";

const thunk = (type, request) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      const { data } = await request(arg); //gọi API
      return data; //trả về dữ liệu từ API nếu thành công
    } catch (err) {
      return rejectWithValue(errorMessage(err)); //trả về thông báo lỗi nếu có lỗi xảy ra
    }
  });

export const fetchQuestions = thunk("questions/fetchAll", () =>
  client.get("/questions"),
);
export const addQuestion = thunk("questions/add", (question) =>
  client.post("/questions", question),
);
export const updateQuestion = thunk("questions/update", ({ id, ...question }) =>
  client.put(`/questions/${id}`, question),
);
export const deleteQuestion = thunk("questions/delete", (id) =>
  client.delete(`/questions/${id}`),
);

const questionSlice = createSlice({
  name: "questions",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.items.unshift(action.payload); //gọi sever vừa trả về, thêm câu hỏi mới vào đầu danh sách items
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const i = state.items.findIndex((q) => q._id === action.payload._id); //tìm câu có cùng Id và cập nhật câu hỏi trong danh sách items
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q._id !== action.payload._id);
      })
      .addCase(logout, () => ({ items: [], status: "idle", error: null }));
  },
});

export default questionSlice.reducer;
