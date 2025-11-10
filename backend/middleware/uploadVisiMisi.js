import multer from "multer";
import path from "path";
import {
    fileURLToPath
} from "url";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "../public/visimisi"));
    },
    filename: function(req, file, cb) {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);

        // Format: timestamp-random.extension
        const filename = `${timestamp}-${random}${extension}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diizinkan!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 🔹 PERBAIKAN: 10MB max (dari 5MB)
    }
});

export default upload;