import {
    Devisi
} from "../database/models/Devisi.js";
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
    if (imagePath && !imagePath.includes('cowo.png') && !imagePath.includes('cewe.png')) {
        const filename = path.basename(imagePath);
        const filePath = path.join(__dirname, "../public/profile", filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted devisi image: ${filename}`);
        }
    }
};

// 🔹 Get all Devisi members
export const getDevisi = async (req, res) => {
    try {
        const data = await Devisi.find().sort({
            id: 1
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get Devisi member by ID
export const getDevisiById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const member = await Devisi.findOne({
            id: parseInt(id)
        });

        if (!member) {
            return res.status(404).json({
                error: "Member devisi tidak ditemukan"
            });
        }

        res.json(member);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Create new Devisi member with image upload
export const createDevisi = async (req, res) => {
    try {
        const memberData = {
            ...req.body
        };

        if (req.file) {
            memberData.image = "/public/profile/" + req.file.filename;
        }

        const newMember = new Devisi(memberData);
        await newMember.save();

        // 🔹 EMIT REAL-TIME UPDATE untuk devisi
        const allMembers = await Devisi.find().sort({
            id: 1
        });
        io.to("devisi_updates").emit("devisi_updated", allMembers);

        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update Devisi member
export const updateDevisi = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const member = await Devisi.findOne({
            id: parseInt(id)
        });

        if (!member) {
            return res.status(404).json({
                error: "Member devisi tidak ditemukan"
            });
        }

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            deleteImageFile(member.image);
            req.body.image = "/public/profile/" + req.file.filename;
        }

        const updatedMember = await Devisi.findOneAndUpdate({
                id: parseInt(id)
            },
            req.body, {
                new: true
            }
        );

        // 🔹 EMIT REAL-TIME UPDATE untuk devisi
        const allMembers = await Devisi.find().sort({
            id: 1
        });
        io.to("devisi_updates").emit("devisi_updated", allMembers);

        res.json(updatedMember);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete Devisi member by ID
export const deleteDevisi = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const member = await Devisi.findOne({
            id: parseInt(id)
        });

        if (!member) {
            return res.status(404).json({
                error: "Member devisi tidak ditemukan"
            });
        }

        // Hapus file gambar jika ada
        deleteImageFile(member.image);

        await Devisi.findOneAndDelete({
            id: parseInt(id)
        });

        // 🔹 EMIT REAL-TIME UPDATE untuk devisi
        const allMembers = await Devisi.find().sort({
            id: 1
        });
        io.to("devisi_updates").emit("devisi_updated", allMembers);

        res.json({
            message: "Member devisi berhasil dihapus",
            deletedMember: member
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete all Devisi data
export const deleteAllDevisi = async (req, res) => {
    try {
        // Hapus semua file gambar (kecuali default)
        const allMembers = await Devisi.find();
        allMembers.forEach(member => {
            deleteImageFile(member.image);
        });

        const result = await Devisi.deleteMany({});

        // 🔹 EMIT REAL-TIME UPDATE untuk devisi
        io.to("devisi_updates").emit("devisi_updated", []);

        res.json({
            message: "Semua data devisi berhasil dihapus",
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Upload image only untuk devisi
export const uploadImageDevisi = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Tidak ada file yang diupload"
            });
        }

        const imageUrl = "/public/profile/" + req.file.filename;
        res.json({
            message: "Gambar devisi berhasil diupload",
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};