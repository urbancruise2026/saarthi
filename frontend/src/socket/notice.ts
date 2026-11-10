import { getSocket } from "./index";

export const listenNoticeCreated = (callback: any) => {
  getSocket().on("noticeCreated", callback);
};

export const listenNoticeUpdated = (callback: any) => {
  getSocket().on("noticeUpdated", callback);
};

export const listenNoticeDeleted = (callback: any) => {
  getSocket().on("noticeDeleted", callback);
};

export const removeNoticeListeners = () => {
  const s = getSocket();
  s.off("noticeCreated");
  s.off("noticeUpdated");
  s.off("noticeDeleted");
};
