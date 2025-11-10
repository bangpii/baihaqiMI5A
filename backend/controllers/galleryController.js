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

// 🔹 Helper: Delete image file
const deleteImageFile = (imagePath) => {
    if (imagePath) {
        const filename = path.basename(imagePath);
        const filePath = path.join(__dirname, "../public/gallery", filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted gallery image: ${filename}`);
        }
    }
};

// 🔹 Get all Gallery
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

// 🔹 Get Gallery by ID
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

// 🔹 Create new Gallery with image upload - AUTO INCREMENT ID
export const createGallery = async (req, res) => {
    try {
        const galleryData = {
            ...req.body
        };

        if (req.file) {
            galleryData.gambar = "/public/gallery/" + req.file.filename;
        }

        const newGallery = new Gallery(galleryData);
        await newGallery.save();

        // 🔹 EMIT REAL-TIME UPDATE
        const allGallery = await Gallery.find().sort({
            id: 1
        });
        io.to("gallery_updates").emit("gallery_updated", allGallery);

        res.status(201).json(newGallery);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update Gallery
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

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            deleteImageFile(gallery.gambar);
            req.body.gambar = "/public/gallery/" + req.file.filename;
        }

        const updatedGallery = await Gallery.findOneAndUpdate({
                id: parseInt(id)
            },
            req.body, {
                new: true
            }
        );

        // 🔹 EMIT REAL-TIME UPDATE
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

// 🔹 Delete Gallery by ID
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

        // Hapus file gambar jika ada
        deleteImageFile(gallery.gambar);

        await Gallery.findOneAndDelete({
            id: parseInt(id)
        });

        // 🔹 EMIT REAL-TIME UPDATE
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

// 🔹 Delete all Gallery data
export const deleteAllGallery = async (req, res) => {
    try {
        // Hapus semua file gambar
        const allGallery = await Gallery.find();
        allGallery.forEach(gallery => {
            deleteImageFile(gallery.gambar);
        });

        const result = await Gallery.deleteMany({});

        // 🔹 EMIT REAL-TIME UPDATE
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