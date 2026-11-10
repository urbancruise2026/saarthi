"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  noticeAddedRealtime,
  noticeDeletedRealtime,
  noticeUpdatedRealtime,
} from "@/redux/features/Notice/noticeSlice";
import {
  listenNoticeCreated,
  listenNoticeDeleted,
  listenNoticeUpdated,
  removeNoticeListeners,
} from "@/socket/notice";

export const useNoticeSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleCreated = (notice: any) => {
      dispatch(noticeAddedRealtime(notice));
    };

    const handleUpdated = (notice: any) => {
      dispatch(noticeUpdatedRealtime(notice));
    };

    const handleDeleted = (payload: any) => {
      // payload can be { id } or direct id
      const id = payload?.id ?? payload;
      dispatch(noticeDeletedRealtime(id));
    };

    listenNoticeCreated(handleCreated);
    listenNoticeUpdated(handleUpdated);
    listenNoticeDeleted(handleDeleted);

    return () => {
      removeNoticeListeners();
    };
  }, [dispatch]);
};
