import mongoose from "mongoose";
import dotenv from "dotenv";
import {
    News
} from "./models/News.js";

dotenv.config();

const dataNews = [{
        id: 1,
        title: "Terima Kasih Dosen",
        desk: "Kami seluruh mahasiswa Management Informatika berterima kasih atas bimbingan selama ini......",
        tanggal: "2024-01-15 10:30:00",
        gambar: "/public/news/01.jpg",
        link: "https://example.com/news/1",
    },
    {
        id: 2,
        title: "WIREGIT MI",
        desk: "Pelatihan pemakaian github dan juga gitlab....",
        tanggal: "2024-01-16 14:20:00",
        gambar: "/public/news/02.jpg",
        link: "https://example.com/news/2",
    },
    {
        id: 3,
        title: "Lomba Website",
        desk: "Open Registrasi untuk developer muda Management Informatika....",
        tanggal: "2024-01-17 09:15:00",
        gambar: "/public/news/03.jpg",
        link: "https://example.com/news/3",
    },
    {
        id: 4,
        title: "Penghargaan HMPS MI",
        desk: "Wow HMPS MI menjadi HMPS terunggul 2025....",
        tanggal: "2024-01-18 16:45:00",
        gambar: "/public/news/04.jpg",
        link: "https://example.com/news/4",
    },
    {
        id: 5,
        title: "Workshop Programming",
        desk: "Workshop programming untuk meningkatkan skill mahasiswa MI....",
        tanggal: "2024-01-19 11:00:00",
        gambar: "/public/news/05.jpg",
        link: "https://example.com/news/5",
    },
    {
        id: 6,
        title: "Open Recruitment Ketua HMPS MI 2025!",
        desk: "Ada apa nih! Open Recruitment Ketua Umum!....",
        tanggal: "2024-01-20 13:30:00",
        gambar: "/public/news/06.jpg",
        link: "https://example.com/news/6",
    },
    {
        id: 7,
        title: "Seminar Teknologi Terkini",
        desk: "Seminar tentang perkembangan teknologi terkini di dunia IT....",
        tanggal: "2024-01-21 15:20:00",
        gambar: "/public/news/07.jpg",
        link: "https://example.com/news/7",
    },
    {
        id: 8,
        title: "Kunjungan Industri",
        desk: "Kunjungan industri ke perusahaan teknologi ternama....",
        tanggal: "2024-01-22 08:45:00",
        gambar: "/public/news/08.jpg",
        link: "https://example.com/news/8",
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🔹 Reset counter mulai dari dataNews.length
        await mongoose.connection.collection('counters').deleteOne({
            _id: 'newsId'
        });
        await mongoose.connection.collection('counters').insertOne({
            _id: 'newsId',
            seq: dataNews.length
        });

        await News.deleteMany();
        console.log("🗑️ Data News lama dihapus");

        await News.insertMany(dataNews);
        console.log(`🌱 ${dataNews.length} Data News berhasil dimasukkan!`);

        mongoose.connection.close();
        console.log("🔌 Koneksi MongoDB ditutup");
    } catch (err) {
        console.error("❌ Error saat seeding News:", err.message);
        mongoose.connection.close();
    }
};

seedDatabase();