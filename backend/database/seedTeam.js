import mongoose from "mongoose";
import dotenv from "dotenv";
import {
    Team
} from "./models/Team.js";

dotenv.config();

const dataTeam = [
    // 🔹 Ketua Tim Internal
    {
        id: 1,
        name: "Chrisandy Hutabarat",
        nomorInduk: "2305102047",
        kelas: "MI-4B",
        jk: "L",
        position: "Ketua Tim Advokasi",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "internal",
        kategori: "TIM",
    },
    {
        id: 2,
        name: "Letticiya Laura S",
        nomorInduk: "2305102066",
        kelas: "MI-5A",
        jk: "P",
        position: "Ketua Tim Keagamaan",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "internal",
        kategori: "TIM",
    },

    // 🔹 Ketua Tim Eksternal
    {
        id: 3,
        name: "Tongku Guru S.",
        nomorInduk: "2405102134",
        kelas: "MI-3B",
        jk: "L",
        position: "Ketua Tim Eksternal",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "eksternal",
        kategori: "TIM",
    },
    {
        id: 4,
        name: "Dita Liana",
        nomorInduk: "2405102055",
        kelas: "MI-2Aa",
        jk: "P",
        position: "Ketua Tim Riset Analisis",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "eksternal",
        kategori: "TIM",
    },

    // 🔹 Ketua Tim IPTEK
    {
        id: 5,
        name: "Randy Karna",
        nomorInduk: "2305102005",
        kelas: "MI-5E",
        jk: "L",
        position: "Ketua Tim Multimedia",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "iptek",
        kategori: "TIM",
    },
    {
        id: 6,
        name: "Hatta Fahriza",
        nomorInduk: "2305102105",
        kelas: "MI-5E",
        jk: "L",
        position: "Ketua Tim Content Creator",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "iptek",
        kategori: "TIM",
    },

    // 🔹 Ketua Tim SDM
    {
        id: 7,
        name: "Hanna Pati Lopian",
        nomorInduk: "2405102001",
        kelas: "MI-3A",
        jk: "P",
        position: "Ketua Tim Quality Assurance",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "sdm",
        kategori: "TIM",
    },
    {
        id: 8,
        name: "Valencia Anbarina",
        nomorInduk: "2405102087",
        kelas: "MI-3C",
        jk: "P",
        position: "Ketua Tim Program",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "sdm",
        kategori: "TIM",
    },
    {
        id: 9,
        name: "Mutiara Sianturi",
        nomorInduk: "2405102004",
        kelas: "MI-3D",
        jk: "P",
        position: "Ketua Tim HRD",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "sdm",
        kategori: "TIM",
    },

    // 🔹 Ketua Tim Business Development
    {
        id: 10,
        name: "Hepyana Daulay",
        nomorInduk: "2305102124",
        kelas: "MI-5D",
        jk: "P",
        position: "Ketua Tim Product Development",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "business",
        kategori: "TIM",
    },
    {
        id: 11,
        name: "Yohana Fransiska",
        nomorInduk: "2305102016",
        kelas: "MI-5B",
        jk: "P",
        position: "Ketua Tim Sales Executive",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "business",
        kategori: "TIM",
    },

    // 🔹 Anggota Internal
    {
        id: 12,
        name: "Tr Septian Tarigan",
        nomorInduk: "2905102082",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Advokasi",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "internal",
        kategori: "ANGGOTA",
    },
    {
        id: 13,
        name: "Johanes Mario Rafael S.",
        nomorInduk: "2905102083",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Advokasi",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "internal",
        kategori: "ANGGOTA",
    },
    {
        id: 14,
        name: "Holikristin BR Ginting",
        nomorInduk: "2905102084",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Advokasi",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "internal",
        kategori: "ANGGOTA",
    },
    {
        id: 15,
        name: "Sarah Khairina",
        nomorInduk: "2905102085",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Advokasi",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "internal",
        kategori: "ANGGOTA",
    },
    {
        id: 16,
        name: "Egi Syahputra",
        nomorInduk: "2905102086",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Keagamaan",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "internal",
        kategori: "ANGGOTA",
    },

    // 🔹 Anggota Eksternal
    {
        id: 17,
        name: "M.Hilmi Syuhada",
        nomorInduk: "2905102087",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Eksternal",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "eksternal",
        kategori: "ANGGOTA",
    },
    {
        id: 18,
        name: "Dwika Br Naibaho",
        nomorInduk: "2905102088",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Eksternal",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "eksternal",
        kategori: "ANGGOTA",
    },
    {
        id: 19,
        name: "M. Rizky Ramadhan",
        nomorInduk: "2905102089",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Eksternal",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "eksternal",
        kategori: "ANGGOTA",
    },
    {
        id: 20,
        name: "Sindi Syahfitri",
        nomorInduk: "2905102090",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Riset Analisis",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "eksternal",
        kategori: "ANGGOTA",
    },

    // 🔹 Anggota IPTEK
    {
        id: 21,
        name: "Dedy Hutahean P",
        nomorInduk: "2305102091",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Multimedia",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "iptek",
        kategori: "ANGGOTA",
    },
    {
        id: 22,
        name: "Sekarissa Ramashani",
        nomorInduk: "2305102092",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Multimedia",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "iptek",
        kategori: "ANGGOTA",
    },
    {
        id: 23,
        name: "May Helena Tamba",
        nomorInduk: "2305102093",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Multimedia",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "iptek",
        kategori: "ANGGOTA",
    },
    {
        id: 24,
        name: "Silvika Zachry",
        nomorInduk: "2305102094",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Content Creator",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "iptek",
        kategori: "ANGGOTA",
    },
    {
        id: 25,
        name: "Sukma Andini",
        nomorInduk: "2305102095",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Content Creator",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "iptek",
        kategori: "ANGGOTA",
    },

    // 🔹 Anggota SDM
    {
        id: 26,
        name: "Rachel Sagita Sibarani",
        nomorInduk: "2305102096",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Quality Assurance",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "sdm",
        kategori: "ANGGOTA",
    },
    {
        id: 27,
        name: "Shindy Aprilia",
        nomorInduk: "2305102097",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Quality Assurance",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "sdm",
        kategori: "ANGGOTA",
    },
    {
        id: 28,
        name: "Rakhmadsyah Irawan",
        nomorInduk: "2305102098",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Tim Program",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "sdm",
        kategori: "ANGGOTA",
    },
    {
        id: 29,
        name: "Clara Sinta Limbong",
        nomorInduk: "2305102099",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Tim Program",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "sdm",
        kategori: "ANGGOTA",
    },
    {
        id: 30,
        name: "Rara Triya Amanda",
        nomorInduk: "2305102100",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Tim HRD",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "sdm",
        kategori: "ANGGOTA",
    },

    // 🔹 Anggota Business Development
    {
        id: 31,
        name: "Kayla Hulwani",
        nomorInduk: "2305102101",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Product Development",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "business",
        kategori: "ANGGOTA",
    },
    {
        id: 32,
        name: "Musbar Muliansyah",
        nomorInduk: "2305102102",
        kelas: "MI-5B",
        jk: "L",
        position: "Anggota Product Development",
        prodi: "Management Informatika",
        image: "/public/profile/cowo.png",
        divisi: "business",
        kategori: "ANGGOTA",
    },
    {
        id: 33,
        name: "Fensia Emanuela",
        nomorInduk: "2305102103",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Product Development",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "business",
        kategori: "ANGGOTA",
    },
    {
        id: 34,
        name: "Nurul Inayah",
        nomorInduk: "2305102104",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Sales Executive",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "business",
        kategori: "ANGGOTA",
    },
    {
        id: 35,
        name: "Nabila Azzahro",
        nomorInduk: "2305102105",
        kelas: "MI-5B",
        jk: "P",
        position: "Anggota Sales Executive",
        prodi: "Management Informatika",
        image: "/public/profile/cewe.png",
        divisi: "business",
        kategori: "ANGGOTA",
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🔹 Hapus data lama
        await Team.deleteMany();
        console.log("🗑️ Data Team lama dihapus");

        // 🔹 Reset counter
        await mongoose.connection.collection('counters').deleteOne({
            _id: 'teamId'
        });
        await mongoose.connection.collection('counters').insertOne({
            _id: 'teamId',
            seq: dataTeam.length
        });

        // 🔹 Insert data baru dengan ID manual
        await Team.insertMany(dataTeam);
        console.log(`🌱 ${dataTeam.length} Data Team berhasil dimasukkan!`);

        mongoose.connection.close();
        console.log("🔌 Koneksi MongoDB ditutup");
    } catch (err) {
        console.error("❌ Error saat seeding Team:", err.message);
        mongoose.connection.close();
    }
};

seedDatabase();