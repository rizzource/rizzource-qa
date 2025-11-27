import axios from "axios";
import CryptoJS from "crypto-js";

const SECRET_KEY = "rizzource-encryption-key-please-change-this";

const decrypt = (cipher) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
        return null;
    }
};

const axiosClient = axios.create({
    baseURL: "https://192.168.100.49:45458/api",
});

// Add token to all requests
axiosClient.interceptors.request.use((config) => {
    const stored = localStorage.getItem("rizzource_session");
    const session = stored ? decrypt(stored) : null;

    if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
});

export default axiosClient;
