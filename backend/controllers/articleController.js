import {
    Article
} from "../database/models/Article.js";
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

// 🔹 Helper: Delete image file - SAMA PERSIS DENGAN NEWS
const deleteImageFile = (imagePath) => {
    if (imagePath && !imagePath.includes('default-article.jpg')) {
        const filename = path.basename(imagePath);
        const filePath = path.join(__dirname, "../public/article", filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted article image: ${filename}`);
        }
    }
};

// 🔹 Get all Articles
export const getArticles = async (req, res) => {
    try {
        const data = await Article.find().sort({
            id: 1
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get Article by ID
export const getArticleById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const article = await Article.findOne({
            id: parseInt(id)
        });

        if (!article) {
            return res.status(404).json({
                error: "Article tidak ditemukan"
            });
        }

        res.json(article);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Create new Article with image upload - FIXED VERSION
export const createArticle = async (req, res) => {
    try {
        console.log('🆕 Creating new article with body:', req.body);
        console.log('🖼️ File received:', req.file);

        // Manual ID generation sebagai fallback
        const lastArticle = await Article.findOne().sort({
            id: -1
        });
        let nextId = lastArticle ? lastArticle.id + 1 : 1000;

        console.log(`🎯 Using manual ID: ${nextId}`);

        // 🔹 BUILD DATA
        const articleData = {
            id: nextId, // Manual ID untuk menghindari auto-increment issues
            title: req.body.title,
            desk: req.body.desk,
            tanggal: req.body.tanggal,
            link: req.body.link,
            kategori: req.body.kategori || 'ARTICLE'
        };

        // 🔹 ONLY SET GAMBAR IF FILE EXISTS
        if (req.file) {
            articleData.gambar = "/public/article/" + req.file.filename;
        }
        // 🔹 Jika tidak ada file, biarkan gambar undefined/tidak ada

        console.log('📦 Article data to save:', articleData);

        const newArticle = new Article(articleData);
        await newArticle.save();

        console.log('✅ Article created successfully:', newArticle);

        // Real-time update
        const allArticles = await Article.find().sort({
            id: 1
        });
        io.to("article_updates").emit("article_updated", allArticles);

        res.status(201).json(newArticle);
    } catch (err) {
        console.error('❌ Error creating article:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update Article - FIXED
export const updateArticle = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const article = await Article.findOne({
            id: parseInt(id)
        });

        if (!article) {
            return res.status(404).json({
                error: "Article tidak ditemukan"
            });
        }

        const updateData = {
            title: req.body.title,
            desk: req.body.desk,
            tanggal: req.body.tanggal,
            link: req.body.link,
            kategori: req.body.kategori || 'ARTICLE'
        };

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            deleteImageFile(article.gambar);
            updateData.gambar = "/public/article/" + req.file.filename;
        } else if (req.body.gambar !== undefined) {
            // Jika gambar dikirim via body (bisa string atau null)
            updateData.gambar = req.body.gambar;
        }

        const updatedArticle = await Article.findOneAndUpdate({
                id: parseInt(id)
            },
            updateData, {
                new: true
            }
        );

        // 🔹 EMIT REAL-TIME UPDATE
        const allArticles = await Article.find().sort({
            id: 1
        });
        io.to("article_updates").emit("article_updated", allArticles);

        res.json(updatedArticle);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete Article by ID
export const deleteArticle = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const article = await Article.findOne({
            id: parseInt(id)
        });

        if (!article) {
            return res.status(404).json({
                error: "Article tidak ditemukan"
            });
        }

        // Hapus file gambar jika ada
        deleteImageFile(article.gambar);

        await Article.findOneAndDelete({
            id: parseInt(id)
        });

        // 🔹 EMIT REAL-TIME UPDATE
        const allArticles = await Article.find().sort({
            id: 1
        });
        io.to("article_updates").emit("article_updated", allArticles);

        res.json({
            message: "Article berhasil dihapus",
            deletedArticle: article
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete all Articles data
export const deleteAllArticles = async (req, res) => {
    try {
        // Hapus semua file gambar (kecuali default)
        const allArticles = await Article.find();
        allArticles.forEach(article => {
            deleteImageFile(article.gambar);
        });

        const result = await Article.deleteMany({});

        // 🔹 EMIT REAL-TIME UPDATE
        io.to("article_updates").emit("article_updated", []);

        res.json({
            message: "Semua data Article berhasil dihapus",
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

        const imageUrl = "/public/article/" + req.file.filename;
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