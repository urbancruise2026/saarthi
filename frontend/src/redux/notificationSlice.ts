import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "@/types";
import { mockNotifications } from "@/utils/mockData";

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: mockNotifications,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },
  },
});

export const { addNotification, markAsRead, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
