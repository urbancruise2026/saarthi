import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
