import { configureStore } from "@reduxjs/toolkit";
import userApiReducer from "./slices/userApiSlice";

export const store = configureStore({
    reducer: {
        userApi: userApiReducer,
    },
});
