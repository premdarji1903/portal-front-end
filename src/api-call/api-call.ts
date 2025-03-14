import axios from "axios";
import { VITE_APP_URL } from "../common";

export const callAPI = async (query: string, headers: any) => {
    console.log(VITE_APP_URL)
    const response = await axios.post(VITE_APP_URL, { query }, {
        headers,
    });

    return response
}