import mongoose from "mongoose";
import {
    Counter
} from "./Counter.js";

const newsSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desk: {
        type: String,
        required: true
    },
    tanggal: {
        type: String,
        required: true
    },
    gambar: {
        type: String
    },
    link: {
        type: String,
        required: true
    },

    kategori: {
        type: String,
        required: true,
        default: "NEWS"
    }
}, {
    timestamps: true
});

// 🔹 Middleware untuk auto increment ID sebelum save
newsSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate({
                _id: 'newsId'
            }, {
                $inc: {
                    seq: 1
                }
            }, {
                new: true,
                upsert: true
            });
            this.id = counter.seq;
            console.log(`🎯 Auto increment News id: ${this.id}`);
        } catch (error) {
            console.error('❌ Error auto increment News:', error);
            return next(error);
        }
    }
    next();
});

export const News = mongoose.model("News", newsSchema);