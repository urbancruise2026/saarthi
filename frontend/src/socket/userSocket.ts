import { getSocket } from "./index";

export const listenEmployeeCreated = (callback: any) => {
  getSocket().on("employeeCreated", callback);
};

export const listenEmployeeUpdated = (callback: any) => {
  getSocket().on("employeeUpdated", callback);
};

export const listenEmployeeStatusUpdated = (callback: any) => {
  getSocket().on("employeeStatusUpdated", callback);
};

export const removeUserListeners = () => {
  const s = getSocket();
  s.off("employeeCreated");
  s.off("employeeUpdated");
  s.off("employeeStatusUpdated");
};