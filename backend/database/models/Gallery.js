import mongoose from "mongoose";
import {
    Counter
} from "./Counter.js";

const gallerySchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    tanggal: {
        type: String,
        required: true
    },
    gambar: {
        type: String,
        required: false // 🔹 UBAH MENJADI FALSE - biarkan optional
    },
    kategori: {
        type: String,
        required: true,
        default: "GALLERY"
    }
}, {
    timestamps: true
});

// Middleware untuk auto increment ID
gallerySchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            let counter = await Counter.findOne({
                _id: 'galleryId'
            });

            if (!counter) {
                counter = new Counter({
                    _id: 'galleryId',
                    seq: 1000
                });
            } else {
                counter.seq += 1;
            }

            await counter.save();
            this.id = counter.seq;
        } catch (error) {
            // Fallback manual
            const lastDoc = await mongoose.model('Gallery').findOne().sort({
                id: -1
            });
            this.id = lastDoc ? lastDoc.id + 1 : 1000;
        }
    }
    next();
});

export const Gallery = mongoose.model("Gallery", gallerySchema);