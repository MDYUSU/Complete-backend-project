import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";

const store = configureStore({
    reducer: {
        auth: authSlice,
        // Add more slices like 'video' or 'comment' here later
    }
});

export default store;