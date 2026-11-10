import axios from "axios";
import { baseApiURL } from "@/utils/commonApi";

export interface ICountry {
  id: number;
  country_name: string;
  name?: string;
  is_active?: boolean;
}

export const getAllCountries = async (): Promise<ICountry[]> => {
  const response = await axios.get(`${baseApiURL}/country`);
  return response.data;
};