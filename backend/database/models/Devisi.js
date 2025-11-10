import mongoose from "mongoose";
import {
    Counter
} from "./Counter.js"; // 🔹 IMPORT COUNTER

const devisiSchema = new mongoose.Schema({
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
        default: "DEVISI"
    },
}, {
    timestamps: true
});

// 🔹 Middleware untuk auto increment ID sebelum save
devisiSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const counter = await Counter.findByIdAndUpdate({
                    _id: 'devisiId'
                }, // 🔹 Counter berbeda dengan BPH
                {
                    $inc: {
                        seq: 1
                    }
                }, {
                    new: true,
                    upsert: true
                }
            );
            this.id = counter.seq; // Set id menjadi angka increment
            console.log(`🎯 Auto increment devisi id: ${this.id}`);
        } catch (error) {
            console.error('❌ Error auto increment devisi:', error);
            return next(error);
        }
    }
    next();
});

export const Devisi = mongoose.model("devisi", devisiSchema);