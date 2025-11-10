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

// 🔹 Create new News with image upload - AUTO INCREMENT ID
export const createNews = async (req, res) => {
    try {
        const newsData = {
            ...req.body
        };

        if (req.file) {
            newsData.gambar = "/public/news/" + req.file.filename;
        }

        const newNews = new News(newsData);
        await newNews.save();

        // 🔹 EMIT REAL-TIME UPDATE
        const allNews = await News.find().sort({
            id: 1
        });
        io.to("news_updates").emit("news_updated", allNews);

        res.status(201).json(newNews);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update News
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

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            deleteImageFile(news.gambar);
            req.body.gambar = "/public/news/" + req.file.filename;
        }

        const updatedNews = await News.findOneAndUpdate({
                id: parseInt(id)
            },
            req.body, {
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