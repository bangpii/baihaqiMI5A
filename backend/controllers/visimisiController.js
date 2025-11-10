import {
    VisiMisi
} from "../database/models/VisiMisi.js";
import {
    Counter
} from "../database/models/Counter.js";
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
    if (imagePath && !imagePath.includes('default.png')) {
        const filename = path.basename(imagePath);
        const filePath = path.join(__dirname, "../public/visimisi", filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted visimisi image: ${filename}`);
        }
    }
};

// 🔹 Helper: Get next ID manually
const getNextVisiMisiId = async () => {
    try {
        const counter = await Counter.findByIdAndUpdate({
            _id: 'visimisiId'
        }, {
            $inc: {
                seq: 1
            }
        }, {
            new: true,
            upsert: true
        });
        console.log(`🎯 Next VisiMisi ID: ${counter.seq}`);
        return counter.seq;
    } catch (error) {
        console.error('❌ Error getting next VisiMisi ID:', error);
        // Fallback: cari ID tertinggi + 1
        const highest = await VisiMisi.findOne().sort({
            id: -1
        });
        return highest ? highest.id + 1 : 1;
    }
};

// 🔹 Helper: Emit realtime update
const emitVisiMisiUpdate = async () => {
    try {
        const allVisiMisi = await VisiMisi.find().sort({
            id: 1
        });
        console.log(`📢 Emitting visimisi_updated with ${allVisiMisi.length} items`);
        io.to("visimisi_updates").emit("visimisi_updated", allVisiMisi);
        return allVisiMisi;
    } catch (error) {
        console.error('❌ Error emitting visimisi update:', error);
    }
};

// 🔹 Get all VisiMisi
export const getVisiMisi = async (req, res) => {
    try {
        console.log('📥 Fetching all VisiMisi data...');
        const data = await VisiMisi.find().sort({
            id: 1
        });
        console.log(`✅ Found ${data.length} VisiMisi items`);
        res.json(data);
    } catch (err) {
        console.error('❌ Error fetching VisiMisi:', err);
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get VisiMisi by ID
export const getVisiMisiById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        console.log(`📥 Fetching VisiMisi with ID: ${id}`);
        const visimisi = await VisiMisi.findOne({
            id: parseInt(id)
        });

        if (!visimisi) {
            console.log(`❌ VisiMisi ${id} not found`);
            return res.status(404).json({
                error: "VisiMisi tidak ditemukan"
            });
        }

        console.log(`✅ Found VisiMisi: ${visimisi.type}`);
        res.json(visimisi);
    } catch (err) {
        console.error('❌ Error fetching VisiMisi by ID:', err);
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Get VisiMisi by Type - TAMBAHKAN INI
export const getVisiMisiByType = async (req, res) => {
    try {
        const {
            type
        } = req.params;
        console.log(`📥 Fetching VisiMisi with type: ${type}`);
        const visimisi = await VisiMisi.find({
            type
        }).sort({
            id: 1
        });

        if (!visimisi || visimisi.length === 0) {
            console.log(`❌ No VisiMisi found with type: ${type}`);
            return res.status(404).json({
                error: "VisiMisi dengan type tersebut tidak ditemukan"
            });
        }

        console.log(`✅ Found ${visimisi.length} VisiMisi with type: ${type}`);
        res.json(visimisi);
    } catch (err) {
        console.error('❌ Error fetching VisiMisi by type:', err);
        res.status(500).json({
            error: err.message
        });
    }
};

// 🔹 Create new VisiMisi - MANUAL AUTO INCREMENT
export const createVisiMisi = async (req, res) => {
    try {
        console.log('🆕 Creating new VisiMisi...');
        console.log('📦 Request body:', req.body);
        console.log('🖼️ Request file:', req.file ? `Yes - ${req.file.filename}` : 'No');

        let visimisiData = {
            ...req.body
        };

        // Parse data field jika berupa string JSON
        if (typeof visimisiData.data === 'string') {
            try {
                visimisiData.data = JSON.parse(visimisiData.data);
                console.log('✅ Parsed data field:', visimisiData.data);
            } catch (parseError) {
                console.error('❌ Error parsing data field:', parseError);
                return res.status(400).json({
                    error: "Invalid data format"
                });
            }
        }

        // Dapatkan ID berikutnya secara manual
        const nextId = await getNextVisiMisiId();
        visimisiData.id = nextId;

        // Handle image upload
        if (req.file) {
            const imagePath = "/public/visimisi/" + req.file.filename;

            if (visimisiData.type === 'gambar') {
                if (!visimisiData.data) {
                    visimisiData.data = {};
                }
                visimisiData.data.item = imagePath;
                console.log(`📸 Set image for gambar type: ${visimisiData.data.item}`);
            } else if (visimisiData.type === 'content') {
                if (!visimisiData.data) {
                    visimisiData.data = {};
                }
                visimisiData.data.gambar = imagePath;
                console.log(`📸 Set image for content type: ${visimisiData.data.gambar}`);
            }
        }

        console.log('📝 Final data to save:', visimisiData);

        const newVisiMisi = new VisiMisi(visimisiData);
        await newVisiMisi.save();
        console.log(`✅ VisiMisi created: ${newVisiMisi.type} (ID: ${newVisiMisi.id})`);

        // 🔹 EMIT REAL-TIME UPDATE
        await emitVisiMisiUpdate();

        res.status(201).json(newVisiMisi);
    } catch (err) {
        console.error('❌ Error creating VisiMisi:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Update VisiMisi
export const updateVisiMisi = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        console.log(`✏️ Updating VisiMisi ID: ${id}`);
        console.log('📦 Update body:', req.body);
        console.log('🖼️ Update file:', req.file ? `Yes - ${req.file.filename}` : 'No');

        const visimisi = await VisiMisi.findOne({
            id: parseInt(id)
        });

        if (!visimisi) {
            console.log(`❌ VisiMisi ${id} not found for update`);
            return res.status(404).json({
                error: "VisiMisi tidak ditemukan"
            });
        }

        console.log(`📝 Found VisiMisi to update: ${visimisi.type}`, visimisi.data);

        let updateData = {
            ...req.body
        };

        // Parse data field jika berupa string JSON
        if (typeof updateData.data === 'string') {
            try {
                updateData.data = JSON.parse(updateData.data);
                console.log('✅ Parsed update data field:', updateData.data);
            } catch (parseError) {
                console.error('❌ Error parsing update data field:', parseError);
                return res.status(400).json({
                    error: "Invalid data format"
                });
            }
        }

        // Jika ada file upload baru, hapus file lama
        if (req.file) {
            const imagePath = "/public/visimisi/" + req.file.filename;

            if (visimisi.type === 'gambar' && visimisi.data && visimisi.data.item) {
                console.log(`🔄 Replacing old image: ${visimisi.data.item}`);
                deleteImageFile(visimisi.data.item);
                if (!updateData.data) {
                    updateData.data = {};
                }
                updateData.data.item = imagePath;
                console.log(`🆕 New image path: ${updateData.data.item}`);
            } else if (visimisi.type === 'content' && visimisi.data && visimisi.data.gambar) {
                console.log(`🔄 Replacing old image: ${visimisi.data.gambar}`);
                deleteImageFile(visimisi.data.gambar);
                if (!updateData.data) {
                    updateData.data = {};
                }
                updateData.data.gambar = imagePath;
                console.log(`🆕 New image path: ${updateData.data.gambar}`);
            } else {
                // Jika type berubah atau data tidak ada
                if (!updateData.data) {
                    updateData.data = {};
                }
                if (updateData.type === 'gambar') {
                    updateData.data.item = imagePath;
                } else if (updateData.type === 'content') {
                    updateData.data.gambar = imagePath;
                }
            }
        }

        const updatedVisiMisi = await VisiMisi.findOneAndUpdate({
                id: parseInt(id)
            },
            updateData, {
                new: true,
                runValidators: true
            }
        );

        console.log(`✅ VisiMisi updated: ${updatedVisiMisi.type}`);

        // 🔹 EMIT REAL-TIME UPDATE
        await emitVisiMisiUpdate();

        res.json(updatedVisiMisi);
    } catch (err) {
        console.error('❌ Error updating VisiMisi:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete VisiMisi by ID
export const deleteVisiMisi = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        console.log(`🗑️ Deleting VisiMisi ID: ${id}`);

        const visimisi = await VisiMisi.findOne({
            id: parseInt(id)
        });

        if (!visimisi) {
            console.log(`❌ VisiMisi ${id} not found for deletion`);
            return res.status(404).json({
                error: "VisiMisi tidak ditemukan"
            });
        }

        console.log(`📝 Found VisiMisi to delete: ${visimisi.type}`);

        // Hapus file gambar jika ada
        if (visimisi.type === 'gambar' && visimisi.data && visimisi.data.item) {
            deleteImageFile(visimisi.data.item);
        }
        if (visimisi.type === 'content' && visimisi.data && visimisi.data.gambar) {
            deleteImageFile(visimisi.data.gambar);
        }

        await VisiMisi.findOneAndDelete({
            id: parseInt(id)
        });
        console.log(`✅ VisiMisi deleted: ${visimisi.type}`);

        // 🔹 EMIT REAL-TIME UPDATE
        await emitVisiMisiUpdate();

        res.json({
            message: "VisiMisi berhasil dihapus",
            deletedVisiMisi: visimisi
        });
    } catch (err) {
        console.error('❌ Error deleting VisiMisi:', err);
        res.status(400).json({
            error: err.message
        });
    }
};

// 🔹 Delete all VisiMisi data
export const deleteAllVisiMisi = async (req, res) => {
    try {
        // Hapus semua file gambar
        const allVisiMisi = await VisiMisi.find();
        allVisiMisi.forEach(visimisi => {
            if (visimisi.type === 'gambar' && visimisi.data && visimisi.data.item) {
                deleteImageFile(visimisi.data.item);
            }
            if (visimisi.type === 'content' && visimisi.data && visimisi.data.gambar) {
                deleteImageFile(visimisi.data.gambar);
            }
        });

        const result = await VisiMisi.deleteMany({});

        // Reset counter
        await Counter.findByIdAndUpdate({
            _id: 'visimisiId'
        }, {
            seq: 0
        }, {
            upsert: true
        });

        // 🔹 EMIT REAL-TIME UPDATE
        await emitVisiMisiUpdate();

        res.json({
            message: "Semua data VisiMisi berhasil dihapus",
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('❌ Error deleting all VisiMisi:', err);
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

        const imageUrl = "/public/visimisi/" + req.file.filename;
        res.json({
            message: "Gambar berhasil diupload",
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (err) {
        console.error('❌ Error uploading image:', err);
        res.status(500).json({
            error: err.message
        });
    }
};