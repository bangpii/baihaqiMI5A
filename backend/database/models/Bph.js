import mongoose from "mongoose";
import {
    Counter
} from "./Counter.js";

const bphSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    nomorInduk: {
        type: String,
        required: true
    },
    kelas: {
        type: String,
        required: true
    },
    jk: {
        type: String,
        enum: ["L", "P"],
        required: true
    },
    position: {
        type: String,
        required: true
    },
    prodi: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    kategori: {
        type: String,
        required: true,
        default: "BPH"
    },
}, {
    timestamps: true
});

// 🔹 Middleware untuk auto increment ID sebelum save
bphSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const counter = await Counter.findByIdAndUpdate({
                _id: 'bphId'
            }, {
                $inc: {
                    seq: 1
                }
            }, {
                new: true,
                upsert: true
            });
            this.id = counter.seq;
            console.log(`🎯 Auto increment BPH id: ${this.id}`);
        } catch (error) {
            console.error('❌ Error auto increment BPH:', error);
            return next(error);
        }
    }
    next();
});

export const Bph = mongoose.model("bph", bphSchema);