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
        required: true
    },

    kategori: {
        type: String,
        required: true,
        default: "GALLERY"
    }
}, {
    timestamps: true
});

// 🔹 Middleware untuk auto increment ID sebelum save
gallerySchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate({
                _id: 'galleryId'
            }, {
                $inc: {
                    seq: 1
                }
            }, {
                new: true,
                upsert: true
            });
            this.id = counter.seq;
            console.log(`🎯 Auto increment Gallery id: ${this.id}`);
        } catch (error) {
            console.error('❌ Error auto increment Gallery:', error);
            return next(error);
        }
    }
    next();
});

export const Gallery = mongoose.model("Gallery", gallerySchema);