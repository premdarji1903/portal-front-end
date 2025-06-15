import axios from "axios";
import { VITE_APP_URL } from "../common";

export const callAPI = async (query: string, headers: any, url?: string) => {
    const response = await axios.post(url ? url : VITE_APP_URL, { query }, {
        headers,
    });

    return response
}