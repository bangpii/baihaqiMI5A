import mongoose from "mongoose";
import dotenv from "dotenv";
import {
    VisiMisi
} from "./models/VisiMisi.js";

dotenv.config();

const dataVisiMisi = [
    // 🔹 Visi
    {
        id: 1,
        type: "visi",
        data: {
            desk: "Menjadikan HMPS MI sebagai organisasi yang berkomitmen untuk mengembangkan potensi setiap bidang, menciptakan suasana inklusif yang mempererat hubungan antara mahasiswa/i, memperluas cakupan eksternal melalui bidang non-informatika sebagai bisnis usaha faktor utamanya, serta mengoptimalkan peran mahasiswa/i untuk berkontribusi aktif dalam mencapai tujuan bersama dan prestasi yang membanggakan"
        }
    },

    // 🔹 Misi
    {
        id: 2,
        type: "misi",
        data: {
            desk: "Membangun program-program pengembangan diri bagi mahasiswa/i dalam berbagai bidang, baik di dalam maupun di luar lingkup prodi, sehingga setiap mahasiswa/i memiliki kesempatan untuk memaksimalkan keterampilan, potensi, dan kontribusi mereka guna mencapai tujuan bersama HMPS MI"
        }
    },
    {
        id: 3,
        type: "misi",
        data: {
            desk: "Meningkatkan kesadaran dan pemahaman seluruh mahasiswa/i mengenai pentingnya peran HMPS dalam mendukung prestasi akademik dan non-akademik melalui sosialisasi yang efektif"
        }
    },
    {
        id: 4,
        type: "misi",
        data: {
            desk: "Memanfaatkan platform komunikasi yang efektif bagi mahasiswa/i aktif Program Studi untuk berbagai masukkan, ide, dan umpan balik terkait pengembangan HMPS, platform ini akan memastikan keterlibatan mahasiswa/i dalam menanggapi hal yang terjadi pada lingkungan sekitar pembelajaran mereka"
        }
    },

    // 🔹 Strategi Misi
    {
        id: 5,
        type: "strategi_misi",
        data: {
            title: "Strategi Misi 1",
            items: [
                "Mengumpulkan data prioritas mahasiswa",
                "Menyusun agenda kegiatan",
                "Pengembangan keterampilan melalui ahli"
            ]
        }
    },
    {
        id: 6,
        type: "strategi_misi",
        data: {
            title: "Strategi Misi 2",
            items: [
                "Gerakan Informatif",
                "Keterlibatan anggota"
            ]
        }
    },
    {
        id: 7,
        type: "strategi_misi",
        data: {
            title: "Strategi Misi 3",
            items: [
                "Pembuatan forum diskusi",
                "Survei dan kuesioner"
            ]
        }
    },

    // 🔹 Gambar
    {
        id: 8,
        type: "gambar",
        data: {
            title: "Internal",
            item: "/public/visimisi/internal.png"
        }
    },
    {
        id: 9,
        type: "gambar",
        data: {
            title: "Eksternal",
            item: "/public/visimisi/eksternal.png"
        }
    },
    {
        id: 10,
        type: "gambar",
        data: {
            title: "IPTEK",
            item: "/public/visimisi/iptek.png"
        }
    },
    {
        id: 11,
        type: "gambar",
        data: {
            title: "PSDM",
            item: "/public/visimisi/sdm.png"
        }
    },
    {
        id: 12,
        type: "gambar",
        data: {
            title: "Business",
            item: "/public/visimisi/businessdevelop.png"
        }
    },

    // 🔹 Content
    {
        id: 13,
        type: "content",
        data: {
            title: "Internal",
            visi: "Menjadikan Divisi Internal yang solid, efesien, dan inovatif, dengat tata kelola yang baik, sehingga mampu mendukung tercapainya tujuan organisasi secara optimal",
            strategi: [
                "Mengadakan kegiatan sosialisasi dan Team Building",
                "Menyusun program kerja yang jelas dan terstruktur",
            ],
            target: [
                "Menciptakan lingkungan organisasi yang ingklusif",
                "Meningkatkan Keterlanjutan dan Efektivitas kegiatan internal"
            ],
            gambar: "/public/visimisi/internal.png",
        }
    },
    {
        id: 14,
        type: "content",
        data: {
            title: "Eksternal",
            visi: "Menjadikan Divisi eksternal yang dinamis, profosional dan terhubung baik dengan pihak luar, untuk memperluas peluang kerjasama yang mendukung perkmbangan mahasiswa/i",
            strategi: [
                "Menjalin kemitraan dengan berbagai instansi dan organisasi",
                "Meningkatkan keterlibatan mahasiswa/i dalam kegiatan eksternal",
            ],
            target: [
                "Memperluas kerjasama dengan pihak eksternal",
                "Mengembangkan platfrom untuk mahasiswa/i cakupan luar prodi"
            ],
            gambar: "/public/visimisi/eksternal.png",
        }
    },
    {
        id: 15,
        type: "content",
        data: {
            title: "IPTEK",
            visi: "Menjadi devisi yang mampu menghasilkan konten kreatif dan inovatif di bidang ilmu pengetahuan dan teknologi, yang menginspirasi dan memberikan nilai tambah bagi mahasiswa/i",
            strategi: [
                "Mengoganisir webinar dan seminar dengan narasumber proposional",
                "Menyelenggarakkan pelatihan teknologi",
            ],
            target: [
                "Meningkatkan pemahaman dan penerapan teknologi oleh mahasiswa"
            ],
            gambar: "/public/visimisi/iptek.png",
        }
    },
    {
        id: 16,
        type: "content",
        data: {
            title: "PSDM",
            visi: "Menjadi pusat inovasi dalam pengembangan program yang relavan dan berdampak, guna mengoptimalkan potnsi setiap mahasiswa/i",
            strategi: [
                "Meningkatkan kualitas pengurus dan panitia",
                "Mengoptimalkan Komunikasi dan Promosi Program",
            ],
            target: [
                "Meningkatkan Kualtas Program Kerja unggulan kabinet"
            ],
            gambar: "/public/visimisi/sdm.png",
        }
    },
    {
        id: 17,
        type: "content",
        data: {
            title: "Business",
            visi: "Menjadi devisi Business Development sebagai penggerak utama kewirausahaan mahasiswa/i di luar bidang informatika, mendukung peningkatan usaha mereka melalui promosi dan penjualan, serta menciptakan peluang produk baru bagi mahasiswa/i",
            strategi: [
                "Memfalitasi promosi dan pemasaran",
                "Menjalin kerjasama bisnis dengan mahasiswa/i",
                "Pengembangan produk sendiri",
            ],
            target: [
                "Meningkatkan Penjualan produk mahasiswa/i",
                "menciptakan produk mandiri dari HMPS MI",
                "Mengembangkan kolaborasi dengan mahasiswa/i yang memiliki usaha"
            ],
            gambar: "/public/visimisi/businessdevelop.png"
        }
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // 🔹 Reset counter mulai dari dataVisiMisi.length
        await mongoose.connection.collection('counters').deleteOne({
            _id: 'visimisiId'
        });
        await mongoose.connection.collection('counters').insertOne({
            _id: 'visimisiId',
            seq: dataVisiMisi.length
        });

        await VisiMisi.deleteMany();
        console.log("🗑️ Data VisiMisi lama dihapus");

        await VisiMisi.insertMany(dataVisiMisi);
        console.log(`🌱 ${dataVisiMisi.length} Data VisiMisi berhasil dimasukkan!`);

        mongoose.connection.close();
        console.log("🔌 Koneksi MongoDB ditutup");
    } catch (err) {
        console.error("❌ Error saat seeding VisiMisi:", err.message);
        mongoose.connection.close();
    }
};

seedDatabase();