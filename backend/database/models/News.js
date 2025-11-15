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
        type: String,
        required: false // 🔹 Biarkan optional seperti article
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

// 🔹 Middleware untuk auto increment ID sebelum save - IMPROVED
newsSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            let counter = await Counter.findOne({
                _id: 'newsId'
            });

            if (!counter) {
                counter = new Counter({
                    _id: 'newsId',
                    seq: 1000
                });
            } else {
                counter.seq += 1;
            }

            await counter.save();
            this.id = counter.seq;
            console.log(`🎯 Auto increment News id: ${this.id}`);
        } catch (error) {
            console.error('❌ Error auto increment News:', error);
            // Fallback manual
            const lastDoc = await mongoose.model('News').findOne().sort({
                id: -1
            });
            this.id = lastDoc ? lastDoc.id + 1 : 1000;
            console.log(`🔄 Using fallback ID: ${this.id}`);
        }
    }
    next();
});

export const News = mongoose.model("News", newsSchema);