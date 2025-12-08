import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CryptoJS from "crypto-js";

// -----------------------------------
// CONFIG
// -----------------------------------
import { identifyUser, track } from "@/lib/analytics";
import { useEffect } from "react";

const BASE_URL =
    "https://rizzource-c2amh0adhpcbgjgx.canadacentral-01.azurewebsites.net/api";
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
// EXISTING THUNKS
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
    async (
        { FirstName, LastName, UserName, Email, Password },
        { rejectWithValue }
    ) => {
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

// FILE UPLOAD
export const fileUpload = createAsyncThunk(
    "resume/upload",
    async ({ file }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(
                `${BASE_URL}/ResumeParser/upload`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "File upload failed");
        }
    }
);


/* -----------------------------------
   GOOGLE LOGIN (NEW)
----------------------------------- */
export const googleLogin = createAsyncThunk(
    "user/google-code-login",
    async ({ code }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/User/google-code-login`, {
                code,
            });

            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Google login failed"
            );
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
            const res = await axios({
                url: `${BASE_URL}/Ollama/GetScrappedJobs`,
                method: "GET",
                // headers: {
                //     Authorization: `Bearer ${restored?.token}`,
                //     // "Content-Type": "application/json",
                // },
                // // withCredentials: true, // same as fetch: credentials: "include"
            });

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Fetch failed");
        }
    }
);


export const getFavoriteJobs = createAsyncThunk(
    "user/getFavoriteJobs",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token"); // same here
            const res = await axios.get(`${BASE_URL}/Ollama/GetFavoriteJobs`, {
                // headers: {
                //     Authorization: `Bearer ${restored?.token}`,
                // },
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Fetch failed");
        }
    }
);


export const saveFavoriteJob = createAsyncThunk(
    "user/saveFavoriteJob",
    async ({ jobId }, { rejectWithValue }) => {
        try {
            const res = await axios({
                url: `${BASE_URL}/Ollama/scrapped-jobs/${jobId}/favorite`,
                method: "POST",
                data: null, // since POST body is empty
                // headers: {
                //     Authorization: `Bearer ${restored?.token}`,
                //     // "Content-Type": "application/json",
                // },
                // withCredentials: true, // equivalent to fetch `credentials: "include"`
            });

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Post failed");
        }
    }
);

export const RemoveFavoriteJob = createAsyncThunk(
    "user/saveFavoriteJob",
    async ({ jobId }, { rejectWithValue }) => {
        try {
            const res = await axios({
                url: `${BASE_URL}/Ollama/scrapped-jobs/${jobId}/favorite`,
                method: "DELETE",
                data: null, // since POST body is empty
                // headers: {
                //     Authorization: `Bearer ${restored?.token}`,
                //     // "Content-Type": "application/json",
                // },
                // withCredentials: true, // equivalent to fetch `credentials: "include"`
            });

            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Post failed");
        }
    }
);

// -----------------------------------
// AI THUNKS
// -----------------------------------
export const generateCoverLetterThunk = createAsyncThunk(
    "ai/generateCoverLetter",
    async (
        { resumeText, jobDescription, jobTitle, company, selectedTone },
        { rejectWithValue }
    ) => {
        try {
            const res = await axios.post(
                `${BASE_URL}/ai/generate-cover-letter`,
                {
                    resumeText,
                    jobDescription,
                    jobTitle,
                    company,
                    tone: selectedTone,
                }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to generate cover letter"
            );
        }
    }
);

export const reGenerateCoverLetterThunk = createAsyncThunk(
    "ai/reGenerateCoverLetter",
    async (
        { resumeText, jobDescription, jobTitle, company, selectedTone },
        { rejectWithValue }
    ) => {
        try {
            const res = await axios.post(
                `${BASE_URL}/ai/regenerate-cover-letter`,
                {
                    resumeText,
                    jobDescription,
                    jobTitle,
                    company,
                    tone: selectedTone,
                }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to regenerate"
            );
        }
    }
);

export const improveBulletThunk = createAsyncThunk(
    "ai/improveBullet",
    async ({ bulletText, jobTitle }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}/ai/improve-bullet`, {
                bulletText,
                jobTitle,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to improve bullet"
            );
        }
    }
);

export const generateNewBulletThunk = createAsyncThunk(
    "ai/generateNewBullet",
    async ({ jobTitle, company }, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                `${BASE_URL}/ai/generate-new-bullet`,
                {
                    jobTitle,
                    company,
                }
            );
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data || "Failed to generate bullet"
            );
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
    favoriteJobs: [],
    selectedJob: null,
    tempResume: null,

    coverLetter: "",
    improvedBullets: [],
    newBullets: [],
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

        setSelectedJob(state, action) {
            state.selectedJob = action.payload;
        },

        setTempResume(state, action) {
            state.tempResume = action.payload;
        },

        clearTempResume(state) {
            state.tempResume = null;
        },
    },

    extraReducers: (builder) => {
        // EXISTING REDUCERS (unchanged)
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
                track("UserLoggedIn", {
                    userId: action.payload.data?.id,
                    email: action.payload.data?.email,
                    method: "manual",
                });

                identifyUser({
                    id: action.payload.data?.id,
                    email: action.payload.data?.email,
                    name: action.payload.data?.firstName + " " + action.payload.data?.lastName
                });
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

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

        builder
            .addCase(saveFavoriteJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveFavoriteJob.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(saveFavoriteJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /* -------------------------
           GOOGLE LOGIN (NEW)
        ------------------------- */
        builder
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
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
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        /* -------------------------
           SCRAP JOBS
        ------------------------- */
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

        builder
            .addCase(getFavoriteJobs.pending, (state) => {
                state.loading = true;
            })
            .addCase(getFavoriteJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.favoriteJobs = action.payload?.data || [];
            })
            .addCase(getFavoriteJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // AI REDUCERS
        builder
            .addCase(generateCoverLetterThunk.fulfilled, (state, action) => {
                state.coverLetter = action.payload.coverLetter;
            })
            .addCase(reGenerateCoverLetterThunk.fulfilled, (state, action) => {
                state.coverLetter = action.payload.coverLetter;
            })
            .addCase(improveBulletThunk.fulfilled, (state, action) => {
                state.improvedBullets = action.payload.improvements || [];
            })
            .addCase(generateNewBulletThunk.fulfilled, (state, action) => {
                state.newBullets = action.payload.newBullets || [];
            });

        // Loading & Errors for AI
        builder
            .addMatcher(
                (a) => a.type.startsWith("ai/") && a.type.endsWith("/pending"),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (a) =>
                    a.type.startsWith("ai/") &&
                    a.type.endsWith("/fulfilled"),
                (state) => {
                    state.loading = false;
                }
            )
            .addMatcher(
                (a) =>
                    a.type.startsWith("ai/") && a.type.endsWith("/rejected"),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    },
});

export const { logout, setSelectedJob, setTempResume, clearTempResume } =
    userApiSlice.actions;

export default userApiSlice.reducer;
