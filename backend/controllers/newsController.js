import {
    News
} from "../database/models/News.js";
import {
    io
} from "../server.js";
import fs from "fs";
import path from "path";
import {
    fileURLToPath
} from "url";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Helper: Delete image file
const deleteImageFile = (imagePath) => {
    if (imagePath && !imagePath.includes('default-news.jpg')) {
        const filename = path.basename(imagePath);
        const filePath = path.join(__dirname, "../public/news", filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted news image: ${filename}`);
        }
    }
};

// 🔹 Get all News
export const getNews = async (req, res) => {
    try {
        const data = await News.find().sort({
            id: 1
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get News by ID
export const getNewsById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const news = await News.findOne({
            id: parseInt(id)
        });

        if (!news) {
            return res.status(404).json({
                error: "News tidak ditemukan"
            });
        }

        res.json(news);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Create new News with image upload - FIXED VERSION
export const createNews = async (req, res) => {
    try {
        console.log('🆕 Creating new news with body:', req.body);
        console.log('🖼️ File received:', req.file);

        // Manual ID generation sebagai fallback
        const lastNews = await News.findOne().sort({
            id: -1
        });
        let nextId = lastNews ? lastNews.id + 1 : 1000;

        console.log(`🎯 Using manual ID: ${nextId}`);

        // 🔹 BUILD DATA
        const newsData = {
            id: nextId, // Manual ID untuk menghindari auto-increment issues
            title: req.body.title,
            desk: req.body.desk,
            tanggal: req.body.tanggal,
            link: req.body.link,
            kategori: req.body.kategori || 'NEWS'
        };

        // 🔹 ONLY SET GAMBAR IF FILE EXISTS
        if (req.file) {
            newsData.gambar = "/public/news/" + req.file.filename;
        }
        // 🔹 Jika tidak ada file, biarkan gambar undefined/tidak ada

        console.log('📦 News data to save:', newsData);

        const newNews = new News(newsData);
        await newNews.save();

        console.log('✅ News created successfully:', newNews);

        // Real-time update
        const allNews = await News.find().sort({
            id: 1
        });
        io.to("news_updates").emit("news_updated", allNews);

        res.status(201).json(newNews);
    } catch (err) {
        console.error('❌ Error creating news:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update News - FIXED
export const updateNews = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const news = await News.findOne({
            id: parseInt(id)
        });

        if (!news) {
            return res.status(404).json({
                error: "News tidak ditemukan"
            });
        }

        const updateData = {
            title: req.body.title,
            desk: req.body.desk,
            tanggal: req.body.tanggal,
            link: req.body.link,
            kategori: req.body.kategori || 'NEWS'
        };

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            deleteImageFile(news.gambar);
            updateData.gambar = "/public/news/" + req.file.filename;
        } else if (req.body.gambar !== undefined) {
            // Jika gambar dikirim via body (bisa string atau null)
            updateData.gambar = req.body.gambar;
        }

        const updatedNews = await News.findOneAndUpdate({
                id: parseInt(id)
            },
            updateData, {
                new: true
            }
        );

        // 🔹 EMIT REAL-TIME UPDATE
        const allNews = await News.find().sort({
            id: 1
        });
        io.to("news_updates").emit("news_updated", allNews);

        res.json(updatedNews);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete News by ID
export const deleteNews = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const news = await News.findOne({
            id: parseInt(id)
        });

        if (!news) {
            return res.status(404).json({
                error: "News tidak ditemukan"
            });
        }

        // Hapus file gambar jika ada
        deleteImageFile(news.gambar);

        await News.findOneAndDelete({
            id: parseInt(id)
        });

        // 🔹 EMIT REAL-TIME UPDATE
        const allNews = await News.find().sort({
            id: 1
        });
        io.to("news_updates").emit("news_updated", allNews);

        res.json({
            message: "News berhasil dihapus",
            deletedNews: news
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete all News data
export const deleteAllNews = async (req, res) => {
    try {
        // Hapus semua file gambar (kecuali default)
        const allNews = await News.find();
        allNews.forEach(news => {
            deleteImageFile(news.gambar);
        });

        const result = await News.deleteMany({});

        // 🔹 EMIT REAL-TIME UPDATE
        io.to("news_updates").emit("news_updated", []);

        res.json({
            message: "Semua data News berhasil dihapus",
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Upload image only
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Tidak ada file yang diupload"
            });
        }

        const imageUrl = "/public/news/" + req.file.filename;
        res.json({
            message: "Gambar berhasil diupload",
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};