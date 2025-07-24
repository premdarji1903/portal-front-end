import axios, { AxiosRequestConfig } from "axios";
import { VITE_APP_URL } from "../common";

export const callAPI = async (query: string, headers: any, url?: string) => {
    const response = await axios.post(url ? url : VITE_APP_URL, { query }, {
        headers,
    });

    return response
}

export const callRestAPI = async (url: string, method: string, data?: any, headers?: any) => {
    const config: AxiosRequestConfig = {
        method,
        url,
        headers,
        ...(method === 'get' || method === 'delete' ? { params: data } : { data }),
    };
    try {
        const response = await axios.request(config);
        return response;
    } catch (error: any) {
        console.error('API error:', error?.response || error?.message);
        throw error;
    }
}