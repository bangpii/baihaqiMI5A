import {
    Gallery
} from "../database/models/Gallery.js";
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

// 🔹 Helper: Delete image file (HANYA jika gambar ada)
const deleteImageFile = (imagePath) => {
    if (imagePath && imagePath !== '/gallery/default-gallery.jpg') {
        const filename = path.basename(imagePath);
        const filePath = path.join(__dirname, "../public/gallery", filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted gallery image: ${filename}`);
        }
    }
};

// 🔹 CREATE GALLERY - FIXED VERSION
export const createGallery = async (req, res) => {
    try {
        console.log('🆕 Creating new gallery with body:', req.body);
        console.log('🖼️ File received:', req.file);

        // Manual ID generation
        const lastGallery = await Gallery.findOne().sort({
            id: -1
        });
        let nextId = lastGallery ? lastGallery.id + 1 : 1000;

        console.log(`🎯 Using manual ID: ${nextId}`);

        // 🔹 BUILD DATA - gambar optional
        const galleryData = {
            id: nextId,
            title: req.body.title,
            tanggal: req.body.tanggal,
            kategori: req.body.kategori || 'GALLERY'
        };

        // 🔹 ONLY SET GAMBAR IF FILE EXISTS
        if (req.file) {
            galleryData.gambar = "/public/gallery/" + req.file.filename;
        }
        // 🔹 Jika tidak ada file, biarkan gambar undefined/tidak ada

        console.log('📦 Gallery data to save:', galleryData);

        const newGallery = new Gallery(galleryData);
        await newGallery.save();

        console.log('✅ Gallery created successfully:', newGallery);

        // Real-time update
        const allGallery = await Gallery.find().sort({
            id: 1
        });
        io.to("gallery_updates").emit("gallery_updated", allGallery);

        res.status(201).json(newGallery);
    } catch (err) {
        console.error('❌ Error creating gallery:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update Gallery - FIXED (handle null gambar)
export const updateGallery = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const gallery = await Gallery.findOne({
            id: parseInt(id)
        });

        if (!gallery) {
            return res.status(404).json({
                error: "Gallery tidak ditemukan"
            });
        }

        const updateData = {
            title: req.body.title,
            tanggal: req.body.tanggal,
            kategori: req.body.kategori || 'GALLERY'
        };

        // Jika ada file upload baru, hapus file lama (jika ada)
        if (req.file) {
            deleteImageFile(gallery.gambar);
            updateData.gambar = "/public/gallery/" + req.file.filename;
        } else if (req.body.gambar !== undefined) {
            // Jika gambar dikirim via body (bisa string atau null)
            updateData.gambar = req.body.gambar;
        }

        const updatedGallery = await Gallery.findOneAndUpdate({
                id: parseInt(id)
            },
            updateData, {
                new: true
            }
        );

        // Real-time update
        const allGallery = await Gallery.find().sort({
            id: 1
        });
        io.to("gallery_updates").emit("gallery_updated", allGallery);

        res.json(updatedGallery);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete Gallery - FIXED (handle null gambar)
export const deleteGallery = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const gallery = await Gallery.findOne({
            id: parseInt(id)
        });

        if (!gallery) {
            return res.status(404).json({
                error: "Gallery tidak ditemukan"
            });
        }

        // Hapus file gambar hanya jika ada
        deleteImageFile(gallery.gambar);

        await Gallery.findOneAndDelete({
            id: parseInt(id)
        });

        // Real-time update
        const allGallery = await Gallery.find().sort({
            id: 1
        });
        io.to("gallery_updates").emit("gallery_updated", allGallery);

        res.json({
            message: "Gallery berhasil dihapus",
            deletedGallery: gallery
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Get all Gallery - FIXED (handle null gambar)
export const getGallery = async (req, res) => {
    try {
        const data = await Gallery.find().sort({
            id: 1
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get Gallery by ID - FIXED (handle null gambar)
export const getGalleryById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const gallery = await Gallery.findOne({
            id: parseInt(id)
        });

        if (!gallery) {
            return res.status(404).json({
                error: "Gallery tidak ditemukan"
            });
        }

        res.json(gallery);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Delete all Gallery data - FIXED (handle null gambar)
export const deleteAllGallery = async (req, res) => {
    try {
        // Hapus semua file gambar yang ada
        const allGallery = await Gallery.find();
        allGallery.forEach(gallery => {
            deleteImageFile(gallery.gambar);
        });

        const result = await Gallery.deleteMany({});

        // Real-time update
        io.to("gallery_updates").emit("gallery_updated", []);

        res.json({
            message: "Semua data Gallery berhasil dihapus",
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

        const imageUrl = "/public/gallery/" + req.file.filename;
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