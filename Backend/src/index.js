import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    // We go back to 'app.listen' - No more http.createServer or Socket.io hurdles
    app.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 VisionTube Server running at port: ${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.log("Mongo db connection failed !!!", err);
});