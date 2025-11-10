import mongoose from "mongoose";
import {
    Counter
} from "./Counter.js";

const visimisiSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: false
    },
    type: {
        type: String,
        required: true,
        enum: ["visi", "misi", "strategi_misi", "gambar", "content"]
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    kategori: {
        type: String,
        required: true,
        default: "VISIMISI"
    }
}, {
    timestamps: true
});

// 🔹 Middleware untuk auto increment ID sebelum save
visimisiSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
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
            this.id = counter.seq;
            console.log(`🎯 Auto increment VisiMisi id: ${this.id}`);
        } catch (error) {
            console.error('❌ Error auto increment VisiMisi:', error);
            return next(error);
        }
    }
    next();
});

export const VisiMisi = mongoose.model("VisiMisi", visimisiSchema);