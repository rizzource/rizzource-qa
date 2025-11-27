// src/redux/slices/userApiSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CryptoJS from "crypto-js";

// -----------------------------------
// CONFIG
// -----------------------------------
const BASE_URL = "https://rizzource-c2amh0adhpcbgjgx.canadacentral-01.azurewebsites.net/api";
const SECRET_KEY = "33Browntrucks!@#";

// -----------------------------------
// ENCRYPTION HELPERS
// -----------------------------------
const encrypt = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decrypt = (cipher) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
        return null;
    }
};

// -----------------------------------
// RESTORED SESSION
// -----------------------------------
const storedSession = localStorage.getItem("rizzource_session");
const restored = storedSession ? decrypt(storedSession) : null;

// -----------------------------------
// THUNKS
// -----------------------------------

// LOGIN USER
export const loginUser = createAsyncThunk(
    "user/loginUser",
    async ({ Email, Password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/User/login`, {
                Email,
                Password,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Login failed");
        }
    }
);

// REGISTER USER
export const registerUser = createAsyncThunk(
    "user/registerUser",
    async ({ FirstName, LastName, UserName, Email, Password }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/User/Register`, {
                FirstName,
                LastName,
                UserName,
                Email,
                Password,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Registration failed");
        }
    }
);

// SCRAP JOBS
export const scrapJobs = createAsyncThunk(
    "user/scrapJobs",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/Ollama/Scrap`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Scrap failed");
        }
    }
);

// GET SCRAPPED JOBS
export const getScrappedJobs = createAsyncThunk(
    "user/getScrappedJobs",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}/Ollama/GetScrappedJobs`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Fetch failed");
        }
    }
);

// -----------------------------------
// INITIAL STATE
// -----------------------------------
const initialState = {
    loading: false,
    error: null,

    token: restored?.token || null,
    user: restored?.user || null,
    roles: restored?.roles || [],

    scrapResult: null,
    scrappedJobs: [],

    // Selected Job from JobPortal → JobDetails
    selectedJob: null,

    // Temporary per-job CV storage
    tempResume: null
};

// -----------------------------------
// SLICE
// -----------------------------------
const userApiSlice = createSlice({
    name: "userApi",
    initialState,
    reducers: {
        logout(state) {
            state.token = null;
            state.user = null;
            state.roles = [];
            state.selectedJob = null;
            state.tempResume = null;
            localStorage.removeItem("rizzource_session");
        },

        // Store selected job
        setSelectedJob(state, action) {
            state.selectedJob = action.payload;
        },

        // Temporary Resume Storage
        setTempResume(state, action) {
            state.tempResume = action.payload; // { file, url, text }
        },

        clearTempResume(state) {
            state.tempResume = null;
        },
    },

    extraReducers: (builder) => {
        // LOGIN
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;

                state.token = action.payload.token;
                state.user = action.payload.data;
                state.roles = action.payload.data?.roles || [];

                const encrypted = encrypt({
                    token: action.payload.token,
                    user: action.payload.data,
                    roles: action.payload.data?.roles || [],
                });

                localStorage.setItem("rizzource_session", encrypted);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // REGISTER
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // SCRAP
        builder
            .addCase(scrapJobs.pending, (state) => {
                state.loading = true;
            })
            .addCase(scrapJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.scrapResult = action.payload;
            })
            .addCase(scrapJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // GET SCRAPPED JOBS
        builder
            .addCase(getScrappedJobs.pending, (state) => {
                state.loading = true;
            })
            .addCase(getScrappedJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.scrappedJobs = action.payload?.data || [];
            })
            .addCase(getScrappedJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    logout,
    setSelectedJob,
    setTempResume,
    clearTempResume,
} = userApiSlice.actions;

export default userApiSlice.reducer;
