import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  employeeCreatedRealtime,
  employeeStatusUpdatedRealtime,
  employeeUpdatedRealtime,
} from "@/redux/features/userSlice";
import {
  listenEmployeeCreated,
  listenEmployeeStatusUpdated,
  listenEmployeeUpdated,
} from "@/socket/userSocket";

export const useSocketEvents = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    listenEmployeeCreated((data: any) => {
      dispatch(employeeCreatedRealtime(data));
    });

    listenEmployeeUpdated((data: any) => {
      dispatch(employeeUpdatedRealtime(data));
    });

    listenEmployeeStatusUpdated((data: any) => {
      dispatch(employeeStatusUpdatedRealtime(data));
    });
  }, []);
};
