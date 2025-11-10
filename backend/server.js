import express from "express";
import cors from "cors";
import connectDB from "./database/db.js";
import path from "path";
import {
    fileURLToPath
} from "url";
import {
    createServer
} from "http";
import {
    Server
} from "socket.io";

// Routes
import bphRoutes from "./routes/bphRoutes.js";
import devisiRoutes from "./routes/devisiRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import visimisiRoutes from "./routes/visimisiRoutes.js";
import articleRoutes from "./routes/articleRoutes.js"; // 🔹 ADD THIS LINE

const app = express();
const PORT = 5000;

// 🔹 Create HTTP server for Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Fix __dirname untuk ES modules
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// 🔹 Serve static files dari folder public
app.use("/public", express.static(path.join(__dirname, "public")));

// 🔹 Koneksi MongoDB
connectDB();

// 🔹 Socket.io Connection
io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join room untuk realtime updates BPH
    socket.on("join_bph_room", () => {
        socket.join("bph_updates");
        console.log(`👥 User ${socket.id} joined bph_updates room`);
    });

    // Join room untuk realtime updates Devisi
    socket.on("join_devisi_room", () => {
        socket.join("devisi_updates");
        console.log(`👥 User ${socket.id} joined devisi_updates room`);
    });

    // Join room untuk realtime updates Team
    socket.on("join_team_room", () => {
        socket.join("team_updates");
        console.log(`👥 User ${socket.id} joined team_updates room`);
    });

    // Join room untuk realtime updates News
    socket.on("join_news_room", () => {
        socket.join("news_updates");
        console.log(`👥 User ${socket.id} joined news_updates room`);
    });

    // Join room untuk realtime updates Gallery
    socket.on("join_gallery_room", () => {
        socket.join("gallery_updates");
        console.log(`👥 User ${socket.id} joined gallery_updates room`);
    });

    // Join room untuk realtime updates VisiMisi
    socket.on("join_visimisi_room", () => {
        socket.join("visimisi_updates");
        console.log(`👥 User ${socket.id} joined visimisi_updates room`);
    });

    // 🔹 ADD THIS: Join room untuk realtime updates Article
    socket.on("join_article_room", () => {
        socket.join("article_updates");
        console.log(`👥 User ${socket.id} joined article_updates room`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// 🔹 Export io untuk digunakan di controller
export {
    io
};

// 🔹 Routes
app.use("/api/bph", bphRoutes);
app.use("/api/devisi", devisiRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/visimisi", visimisiRoutes);
app.use("/api/articles", articleRoutes); // 🔹 ADD THIS LINE

// 🔹 Route test backend
app.get("/api/test", (req, res) => {
    res.json({
        message: "Hello backend dari server!",
        timestamp: new Date().toISOString(),
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready for realtime updates`);
    console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`👥 BPH endpoints: http://localhost:${PORT}/api/bph`);
    console.log(`🏢 Devisi endpoints: http://localhost:${PORT}/api/devisi`);
    console.log(`👨‍💼 Team endpoints: http://localhost:${PORT}/api/team`);
    console.log(`📰 News endpoints: http://localhost:${PORT}/api/news`);
    console.log(`🖼️  Gallery endpoints: http://localhost:${PORT}/api/gallery`);
    console.log(`🎯 VisiMisi endpoints: http://localhost:${PORT}/api/visimisi`);
    console.log(`📝 Article endpoints: http://localhost:${PORT}/api/articles`); // 🔹 ADD THIS LINE
});