import mongoose from "mongoose";
import dotenv from "dotenv";
import {
    Article
} from "./models/Article.js";

dotenv.config();

const dataArticle = [{
        id: 1,
        title: "Persiapan Memasuki Perkulliahan",
        desk: "Sebelum memasuki Perkuliahan Informatika Kamu harus mmperiapka banyak hal ......",
        tanggal: "2024-01-15 10:30:00",
        gambar: "/public/article/01.jpg",
        link: "https://example.com/article1",
    },
    {
        id: 2,
        title: "Tool Website Modern",
        desk: "Brikut macam macam tool modern yang sering digunakan developer untuk membuat Website....",
        tanggal: "2024-01-16 14:20:00",
        gambar: "/public/article/02.jpg",
        link: "https://example.com/article2",
    },
    {
        id: 3,
        title: "Tips Menggunakkan CSS",
        desk: "Style yang sring diggunakan developer adalah css, css adalah salah satu .. ....",
        tanggal: "2024-01-17 09:15:00",
        gambar: "/public/article/03.jpg",
        link: "https://example.com/article3",
    },
    {
        id: 4,
        title: "Pilih css atau tailwind ??",
        desk: "Sekarang tampilan wbsti bisa sangat modern dengan adanya tailwind membantu developer dalam .. ....",
        tanggal: "2024-01-18 16:45:00",
        gambar: "/public/article/04.jpg",
        link: "https://example.com/article4",
    },
    {
        id: 5,
        title: "5 Langkah Kuliah Terarah",
        desk: "Mahasiswa di zaman era sekarang sangat sulit untuk menentukan sesuatu berikut tips yang dapat membantu.. ....",
        tanggal: "2024-01-19 11:00:00",
        gambar: "/public/article/05.jpg",
        link: "https://example.com/article5",
    },
    {
        id: 6,
        title: "Kuliah Jurusan IT?",
        desk: "Ngaku jurusan IT tapi tidak tau , tool yang keren yang dapat membantu project anda menjadi luar biasa  .. ....",
        tanggal: "2024-01-20 13:30:00",
        gambar: "/public/article/06.jpg",
        link: "https://example.com/article6",
    },
    {
        id: 7,
        title: "Kuliah di Era AI!",
        desk: "Dengan adanya AI sekarang, apakah mahasiswa harus slalu berfikir keritis? .. ....",
        tanggal: "2024-01-21 15:20:00",
        gambar: "/public/article/07.jpg",
        link: "https://example.com/article7",
    },
    {
        id: 8,
        title: "VPS Vs Shared Hosting ",
        desk: "Pilih salah satu yang ingin kamu gunakan  VPS atau Shared Hosting.. ....",
        tanggal: "2024-01-22 08:45:00",
        gambar: "/public/article/08.jpg",
        link: "https://example.com/article8",
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🔹 Reset counter mulai dari dataArticle.length
        await mongoose.connection.collection('counters').deleteOne({
            _id: 'articleId'
        });
        await mongoose.connection.collection('counters').insertOne({
            _id: 'articleId',
            seq: dataArticle.length
        });

        await Article.deleteMany();
        console.log("🗑️ Data Article lama dihapus");

        await Article.insertMany(dataArticle);
        console.log(`🌱 ${dataArticle.length} Data Article berhasil dimasukkan!`);

        mongoose.connection.close();
        console.log("🔌 Koneksi MongoDB ditutup");
    } catch (err) {
        console.error("❌ Error saat seeding Article:", err.message);
        mongoose.connection.close();
    }
};

seedDatabase();