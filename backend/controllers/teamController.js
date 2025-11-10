import {
    Team
} from "../database/models/Team.js";
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
            console.log(`🗑️ Deleted image: ${filename}`);
        }
    }
};

// 🔹 Get all Team members
export const getTeam = async (req, res) => {
    try {
        const data = await Team.find().sort({
            id: 1
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get Team member by ID
export const getTeamById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const member = await Team.findOne({
            id: parseInt(id)
        });

        if (!member) {
            return res.status(404).json({
                error: "Member tidak ditemukan"
            });
        }

        res.json(member);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get Team members by divisi
export const getTeamByDivisi = async (req, res) => {
    try {
        const {
            divisi
        } = req.params;
        const members = await Team.find({
            divisi
        }).sort({
            id: 1
        });

        res.json(members);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Create new Team member with image upload - AUTO INCREMENT ID
export const createTeam = async (req, res) => {
    try {
        const memberData = {
            ...req.body
        };

        if (req.file) {
            memberData.image = "/public/profile/" + req.file.filename;
        }

        const newMember = new Team(memberData);
        await newMember.save();

        // 🔹 EMIT REAL-TIME UPDATE
        const allMembers = await Team.find().sort({
            id: 1
        });
        io.to("team_updates").emit("team_updated", allMembers);

        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update Team member
export const updateTeam = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const member = await Team.findOne({
            id: parseInt(id)
        });

        if (!member) {
            return res.status(404).json({
                error: "Member tidak ditemukan"
            });
        }

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            deleteImageFile(member.image);
            req.body.image = "/public/profile/" + req.file.filename;
        }

        const updatedMember = await Team.findOneAndUpdate({
                id: parseInt(id)
            },
            req.body, {
                new: true
            }
        );

        // 🔹 EMIT REAL-TIME UPDATE
        const allMembers = await Team.find().sort({
            id: 1
        });
        io.to("team_updates").emit("team_updated", allMembers);

        res.json(updatedMember);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete Team member by ID
export const deleteTeam = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const member = await Team.findOne({
            id: parseInt(id)
        });

        if (!member) {
            return res.status(404).json({
                error: "Member tidak ditemukan"
            });
        }

        // Hapus file gambar jika ada
        deleteImageFile(member.image);

        await Team.findOneAndDelete({
            id: parseInt(id)
        });

        // 🔹 EMIT REAL-TIME UPDATE
        const allMembers = await Team.find().sort({
            id: 1
        });
        io.to("team_updates").emit("team_updated", allMembers);

        res.json({
            message: "Member berhasil dihapus",
            deletedMember: member
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete all Team data
export const deleteAllTeam = async (req, res) => {
    try {
        // Hapus semua file gambar (kecuali default)
        const allMembers = await Team.find();
        allMembers.forEach(member => {
            deleteImageFile(member.image);
        });

        const result = await Team.deleteMany({});

        // 🔹 EMIT REAL-TIME UPDATE
        io.to("team_updates").emit("team_updated", []);

        res.json({
            message: "Semua data Team berhasil dihapus",
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

        const imageUrl = "/public/profile/" + req.file.filename;
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