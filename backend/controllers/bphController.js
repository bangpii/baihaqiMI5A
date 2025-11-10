import {
    Bph
} from "../database/models/Bph.js";
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

// 🔹 Helper: Emit realtime update
const emitBphUpdate = async () => {
    try {
        const allMembers = await Bph.find().sort({
            id: 1
        });
        console.log('🔔 Emitting bph_updated event with data:', allMembers.length, 'items');
        io.emit("bph_updated", allMembers);
    } catch (error) {
        console.error('❌ Error emitting bph update:', error);
    }
};

// 🔹 Get all BPH members
export const getBph = async (req, res) => {
    try {
        console.log('📥 Fetching BPH data from database...');
        const data = await Bph.find().sort({
            id: 1
        });
        console.log('✅ BPH data fetched:', data.length, 'items');
        res.json(data);
    } catch (err) {
        console.error('❌ Error fetching BPH:', err);
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get BPH member by ID - FIXED: Use id field, not _id
export const getBphById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        console.log('📥 Fetching BPH member with id:', id);

        // 🔹 FIX: Use id field, convert to number
        const member = await Bph.findOne({
            id: parseInt(id)
        });

        if (!member) {
            console.log('❌ BPH member not found:', id);
            return res.status(404).json({
                error: "Member tidak ditemukan"
            });
        }

        console.log('✅ BPH member found:', member.name);
        res.json(member);
    } catch (err) {
        console.error('❌ Error fetching BPH by ID:', err);
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Create new BPH member with image upload
export const createBph = async (req, res) => {
    try {
        console.log('🆕 Creating new BPH member...');
        console.log('📦 Request body:', req.body);
        console.log('🖼️ Request file:', req.file);

        const memberData = {
            ...req.body
        };

        if (req.file) {
            memberData.image = "/public/profile/" + req.file.filename;
            console.log('✅ Image uploaded:', memberData.image);
        }

        // 🔹 ID akan auto increment di middleware
        const newMember = new Bph(memberData);
        await newMember.save();

        console.log('✅ BPH member created:', newMember);

        // 🔹 EMIT REAL-TIME UPDATE
        await emitBphUpdate();

        res.status(201).json(newMember);
    } catch (err) {
        console.error('❌ Error creating BPH:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update BPH member - FIXED: Use id field, not _id
export const updateBph = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        console.log('✏️ Updating BPH member with id:', id);
        console.log('📦 Update data:', req.body);
        console.log('🖼️ Update file:', req.file);

        // 🔹 FIX: Use id field, convert to number
        const member = await Bph.findOne({
            id: parseInt(id)
        });

        if (!member) {
            console.log('❌ BPH member not found for update:', id);
            return res.status(404).json({
                error: "Member tidak ditemukan"
            });
        }

        console.log('📋 Current member data:', member);

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            console.log('🔄 Replacing old image...');
            deleteImageFile(member.image);
            req.body.image = "/public/profile/" + req.file.filename;
            console.log('✅ New image set:', req.body.image);
        }

        // 🔹 FIX: Update by id field
        const updatedMember = await Bph.findOneAndUpdate({
                id: parseInt(id)
            },
            req.body, {
                new: true,
                runValidators: true
            }
        );

        console.log('✅ BPH member updated:', updatedMember);

        // 🔹 EMIT REAL-TIME UPDATE
        await emitBphUpdate();

        res.json(updatedMember);
    } catch (err) {
        console.error('❌ Error updating BPH:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete BPH member by ID - FIXED: Use id field, not _id
export const deleteBph = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        console.log('🗑️ Deleting BPH member with id:', id);

        // 🔹 FIX: Use id field, convert to number
        const member = await Bph.findOne({
            id: parseInt(id)
        });

        if (!member) {
            console.log('❌ BPH member not found for deletion:', id);
            return res.status(404).json({
                error: "Member tidak ditemukan"
            });
        }

        console.log('📋 Member to delete:', member);

        // Hapus file gambar jika ada
        deleteImageFile(member.image);

        // 🔹 FIX: Delete by id field
        await Bph.findOneAndDelete({
            id: parseInt(id)
        });
        console.log('✅ BPH member deleted');

        // 🔹 EMIT REAL-TIME UPDATE
        await emitBphUpdate();

        res.json({
            message: "Member berhasil dihapus",
            deletedMember: member
        });
    } catch (err) {
        console.error('❌ Error deleting BPH:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete all BPH data
export const deleteAllBph = async (req, res) => {
    try {
        console.log('🗑️ Deleting all BPH data...');

        // Hapus semua file gambar (kecuali default)
        const allMembers = await Bph.find();
        allMembers.forEach(member => {
            deleteImageFile(member.image);
        });

        const result = await Bph.deleteMany({});
        console.log('✅ All BPH data deleted:', result.deletedCount, 'items');

        // 🔹 EMIT REAL-TIME UPDATE
        await emitBphUpdate();

        res.json({
            message: "Semua data BPH berhasil dihapus",
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('❌ Error deleting all BPH:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Upload image only - TAMBAHKAN INI
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