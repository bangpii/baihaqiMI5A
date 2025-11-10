import mongoose from "mongoose";
import dotenv from "dotenv";
import {
    Bph
} from "./models/Bph.js";

dotenv.config();

const dataBph = [{
        id: 1,
        name: "Alifa Qadri",
        nomorInduk: "2305102132",
        kelas: "MI-5B",
        jk: "L",
        position: "Ketua Himpunan",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",

        kategori: "BPH",
    },
    {
        id: 2,
        name: "M Hafizh BB",
        nomorInduk: "2305102002",
        kelas: "MI-5B",
        jk: "L",
        position: "Wakil Ketua",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        kategori: "BPH",
    },
    {
        id: 3,
        name: "Mauliza Azizah",
        nomorInduk: "2305102054",
        kelas: "MI-5D",
        jk: "P",
        position: "Sekertaris Umum",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        kategori: "BPH",
    },
    {
        id: 4,
        name: "Syafitri Uswatun",
        nomorInduk: "2405102025",
        kelas: "MI-3A",
        jk: "P",
        position: "Wakil Sekertaris",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        kategori: "BPH",
    },
    {
        id: 5,
        name: "Amira Nadhifa N",
        nomorInduk: "2305102096",
        kelas: "MI-5A",
        jk: "P",
        position: "Bendahara Umum",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        kategori: "BPH",
    },
    {
        id: 6,
        name: "Umi Nurfadhilah S",
        nomorInduk: "2405102125",
        kelas: "MI-3E",
        jk: "P",
        position: "Wakil Bendahara",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        kategori: "BPH",
    },
    {
        id: 7,
        name: "M. Ibnu Tawakal",
        nomorInduk: "2305102108",
        kelas: "MI-EA",
        jk: "L",
        position: "Kontrol Internal",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        kategori: "BPH",
    },
    {
        id: 8,
        name: "Mariska Siagian",
        nomorInduk: "2305102042",
        kelas: "MI-5B",
        jk: "P",
        position: "Kontrol Internal",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        kategori: "BPH",
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🔹 Reset counter mulai dari 8
        await mongoose.connection.collection('counters').deleteOne({
            _id: 'bphId'
        });
        await mongoose.connection.collection('counters').insertOne({
            _id: 'bphId',
            seq: 8
        });

        await Bph.deleteMany();
        console.log("🗑️ Data BPH lama dihapus");

        await Bph.insertMany(dataBph);
        console.log("🌱 8 Data BPH berhasil dimasukkan!");

        mongoose.connection.close();
        console.log("🔌 Koneksi MongoDB ditutup");
    } catch (err) {
        console.error("❌ Error saat seeding BPH:", err.message);
        mongoose.connection.close();
    }
};

seedDatabase();