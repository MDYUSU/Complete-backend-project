import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
    path: './.env'
});

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

// 3. Handshake: Attach io to Express 'app'
// This is what prevents the 500 error in your controller!
app.set("io", io);

// 4. Basic Socket Connection Logic (Optional for now)
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room`);
    }

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// 5. Connect DB and Start Server
connectDB()
    .then(() => {
        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️  Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });