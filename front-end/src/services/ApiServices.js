import axios from 'axios';

const API_URL = "https://decentralized-storage.onrender.com/api";

export const register = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, { email, password });
        console.log("response ", response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        console.log("response ", response.data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await axios.post(`${API_URL}/files/upload`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const downloadFile = async (ipHash) => {
    try {
        const response = await axios.get(`${API_URL}/files/download/${ipHash}`, { responseType: 'blob' });
        return response;
    } catch (error) {
        throw error;
    }
};

export const shareFile = async (fileId, sharedWith) => {
    try {
        const response = await axios.post(`${API_URL}/files/share`, { fileId, sharedWith });
        return response.data;
    } catch (error) {
        throw error;
    }
};
