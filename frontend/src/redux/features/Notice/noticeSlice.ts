import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notice } from "@/types";
import {
  createNotice,
  deleteNotice,
  getAllNotices,
  getSingleNotice,
  updateNotice,
} from "./noticeApi";

interface NoticeState {
  notices: Notice[];
  singleNotice: Notice | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: NoticeState = {
  notices: [],
  singleNotice: null,
  loading: false,
  actionLoading: false,
  error: null,
};

// Fetch all
export const fetchNotices = createAsyncThunk(
  "notice/fetchNotices",
  async (category?: string, thunkAPI) => {
    try {
      return await getAllNotices(category);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to fetch notices",
      );
    }
  },
);

// Fetch single
export const fetchSingleNotice = createAsyncThunk(
  "notice/fetchSingleNotice",
  async (id: number | string, thunkAPI) => {
    try {
      return await getSingleNotice(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to fetch notice",
      );
    }
  },
);

// Create
export const addNotice = createAsyncThunk(
  "notice/addNotice",
  async (data: Partial<Notice>, thunkAPI) => {
    try {
      return await createNotice(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to create notice",
      );
    }
  },
);

// Update
export const editNotice = createAsyncThunk(
  "notice/editNotice",
  async (
    { id, data }: { id: number | string; data: Partial<Notice> },
    thunkAPI,
  ) => {
    try {
      return await updateNotice(id, data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to update notice",
      );
    }
  },
);

// Delete
export const removeNotice = createAsyncThunk(
  "notice/removeNotice",
  async (id: number | string, thunkAPI) => {
    try {
      return await deleteNotice(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to delete notice",
      );
    }
  },
);

const noticeSlice = createSlice({
  name: "notice",
  initialState,
  reducers: {
    // socket: create
    noticeAddedRealtime: (state, action: PayloadAction<Notice>) => {
      const exists = state.notices.find(
        (n: any) => n.id === (action.payload as any).id,
      );
      if (!exists) {
        state.notices.unshift(action.payload);
      }
    },

    // socket: update
    noticeUpdatedRealtime: (state, action: PayloadAction<Notice>) => {
      const index = state.notices.findIndex(
        (n: any) => n.id === (action.payload as any).id,
      );
      if (index !== -1) {
        state.notices[index] = action.payload;
      }

      if (
        state.singleNotice &&
        (state.singleNotice as any).id === (action.payload as any).id
      ) {
        state.singleNotice = action.payload;
      }
    },

    // socket: delete
    noticeDeletedRealtime: (state, action: PayloadAction<number | string>) => {
      state.notices = state.notices.filter((n: any) => n.id !== action.payload);

      if (
        state.singleNotice &&
        (state.singleNotice as any).id === action.payload
      ) {
        state.singleNotice = null;
      }
    },

    clearSingleNotice: (state) => {
      state.singleNotice = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // fetch notices
      .addCase(fetchNotices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = action.payload;
      })
      .addCase(fetchNotices.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetch single notice
      .addCase(fetchSingleNotice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleNotice.fulfilled, (state, action) => {
        state.loading = false;
        state.singleNotice = action.payload;
      })
      .addCase(fetchSingleNotice.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // add notice
      .addCase(addNotice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addNotice.fulfilled, (state, action) => {
        state.actionLoading = false;

        const exists = state.notices.find(
          (n: any) => n.id === (action.payload as any).id,
        );
        if (!exists) {
          state.notices.unshift(action.payload);
        }
      })
      .addCase(addNotice.rejected, (state, action: any) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // edit notice
      .addCase(editNotice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(editNotice.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.notices.findIndex(
          (n: any) => n.id === (action.payload as any).id,
        );
        if (index !== -1) {
          state.notices[index] = action.payload;
        }

        if (
          state.singleNotice &&
          (state.singleNotice as any).id === (action.payload as any).id
        ) {
          state.singleNotice = action.payload;
        }
      })
      .addCase(editNotice.rejected, (state, action: any) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // remove notice
      .addCase(removeNotice.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeNotice.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.notices = state.notices.filter(
          (n: any) => n.id !== action.payload,
        );

        if (
          state.singleNotice &&
          (state.singleNotice as any).id === action.payload
        ) {
          state.singleNotice = null;
        }
      })
      .addCase(removeNotice.rejected, (state, action: any) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  noticeAddedRealtime,
  noticeUpdatedRealtime,
  noticeDeletedRealtime,
  clearSingleNotice,
} = noticeSlice.actions;

export default noticeSlice.reducer;
