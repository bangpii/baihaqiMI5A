import mongoose from "mongoose";
import {
    Counter
} from "./Counter.js";

const teamSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
        // required: true DIHAPUS agar auto increment bekerja
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
    divisi: {
        type: String,
        required: true
    },
    kategori: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

// 🔹 Middleware untuk auto increment ID sebelum save
teamSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate({
                _id: 'teamId'
            }, {
                $inc: {
                    seq: 1
                }
            }, {
                new: true,
                upsert: true
            });
            this.id = counter.seq;
            console.log(`🎯 Auto increment Team id: ${this.id}`);
        } catch (error) {
            console.error('❌ Error auto increment Team:', error);
            return next(error);
        }
    }
    next();
});

export const Team = mongoose.model("Team", teamSchema);