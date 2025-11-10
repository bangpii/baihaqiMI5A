import mongoose from "mongoose";
import dotenv from "dotenv";
import {
    Devisi
} from "./models/Devisi.js";

dotenv.config();

const dataDevisi = [{
        id: 1,
        name: "Zaky Farhan Sitorus",
        nomorInduk: "2405102038",
        kelas: "MI-3B",
        jk: "L",
        position: "Kepala Devisi Internal",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        kategori: "DEVISI",
    },
    {
        id: 2,
        name: "Bima Shakti",
        nomorInduk: "2305102134",
        kelas: "MI-5D",
        jk: "L",
        position: "Kepala Devisi Eksternal",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        kategori: "DEVISI",
    },
    {
        id: 3,
        name: "Rendy Krisna",
        nomorInduk: "2305102004",
        kelas: "MI-5D",
        jk: "L",
        position: "Kepala Devisi IPTEK",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        kategori: "DEVISI",
    },
    {
        id: 4,
        name: "Gilbert Tamba",
        nomorInduk: "2405102149",
        kelas: "MI-3E",
        jk: "L",
        position: "Kepala Devisi PSDM",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        kategori: "DEVISI",
    },
    {
        id: 5,
        name: "Riah Ulina H.",
        nomorInduk: "2405102007",
        kelas: "MI-5A",
        jk: "P",
        position: "Kepala Devisi Business",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        kategori: "DEVISI",
    },
    {
        id: 6,
        name: "Putri Anggreini",
        nomorInduk: "2405102073",
        kelas: "MI-3E",
        jk: "P",
        position: "Manager",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        kategori: "DEVISI",
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🔹 Reset counter mulai dari 6
        await mongoose.connection.collection('counters').deleteOne({
            _id: 'devisiId'
        });
        await mongoose.connection.collection('counters').insertOne({
            _id: 'devisiId',
            seq: 6
        });

        await Devisi.deleteMany();
        console.log("🗑️ Data devisi lama dihapus");

        await Devisi.insertMany(dataDevisi);
        console.log("🌱 6 Data Devisi berhasil dimasukkan!");

        mongoose.connection.close();
        console.log("🔌 Koneksi MongoDB ditutup");
    } catch (err) {
        console.error("❌ Error saat seeding devisi:", err.message);
        mongoose.connection.close();
    }
};

seedDatabase();