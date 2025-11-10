import mongoose from "mongoose";
import dotenv from "dotenv";
import {
    Gallery
} from "./models/Gallery.js";

dotenv.config();

const dataGallery = [{
        id: 1,
        title: "Foto Kegiatan 1",
        tanggal: "2024-01-15 10:30:00",
        gambar: "/public/gallery/01.jpg"
    },
    {
        id: 2,
        title: "Seminar Teknologi",
        tanggal: "2024-01-16 14:20:00",
        gambar: "/public/gallery/02.jpg"
    },
    {
        id: 3,
        title: "Workshop Programming",
        tanggal: "2024-01-17 09:15:00",
        gambar: "/public/gallery/03.jpg"
    },
    {
        id: 4,
        title: "Pelatihan Git",
        tanggal: "2024-01-18 16:45:00",
        gambar: "/public/gallery/04.jpg"
    },
    {
        id: 5,
        title: "Lomba Website",
        tanggal: "2024-01-19 11:00:00",
        gambar: "/public/gallery/05.jpg"
    },
    {
        id: 6,
        title: "Open Recruitment",
        tanggal: "2024-01-20 13:30:00",
        gambar: "/public/gallery/06.jpg"
    },
    {
        id: 7,
        title: "Kunjungan Industri",
        tanggal: "2024-01-21 15:20:00",
        gambar: "/public/gallery/07.jpg"
    },
    {
        id: 8,
        title: "Presentasi Project",
        tanggal: "2024-01-22 08:45:00",
        gambar: "/public/gallery/08.jpg"
    },
    {
        id: 9,
        title: "Diskusi Kelompok",
        tanggal: "2024-01-23 12:10:00",
        gambar: "/public/gallery/09.jpg"
    },
    {
        id: 10,
        title: "Demo Aplikasi",
        tanggal: "2024-01-24 17:30:00",
        gambar: "/public/gallery/10.jpg"
    },
    {
        id: 11,
        title: "Graduation Ceremony",
        tanggal: "2024-01-25 14:00:00",
        gambar: "/public/gallery/11.jpg"
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🔹 Reset counter mulai dari dataGallery.length
        await mongoose.connection.collection('counters').deleteOne({
            _id: 'galleryId'
        });
        await mongoose.connection.collection('counters').insertOne({
            _id: 'galleryId',
            seq: dataGallery.length
        });

        await Gallery.deleteMany();
        console.log("🗑️ Data Gallery lama dihapus");

        await Gallery.insertMany(dataGallery);
        console.log(`🌱 ${dataGallery.length} Data Gallery berhasil dimasukkan!`);

        mongoose.connection.close();
        console.log("🔌 Koneksi MongoDB ditutup");
    } catch (err) {
        console.error("❌ Error saat seeding Gallery:", err.message);
        mongoose.connection.close();
    }
};

seedDatabase();