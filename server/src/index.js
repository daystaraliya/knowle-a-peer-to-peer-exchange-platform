import 'ignore-styles'; // Add this line to handle CSS imports on the server for SSR
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
import http from 'http';
import { Server } from 'socket.io';
import { initializeSocketIO } from './socket/index.js';
import { seedAchievements } from './db/seed.js';

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

app.set('io', io); // Make io accessible in controllers

initializeSocketIO(io);

connectDB()
.then(() => {
    // Seed the database with achievements on startup
    seedAchievements().catch(err => console.error("Achievement seeding failed:", err));

    server.on("error", (error) => {
        console.error("HTTP Server Error: ", error);
        throw error;
    });

    server.listen(PORT, () => {
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
})
.catch((err) => {
    console.error("MONGO DB connection failed !!! ", err);
});