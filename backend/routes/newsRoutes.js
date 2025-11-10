import express from "express";
import {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    deleteAllNews,
    uploadImage
} from "../controllers/newsController.js";
import upload from "../middleware/uploadNews.js";

const router = express.Router();

// 🔹 Routes for News
router.get("/", getNews); // GET all
router.get("/:id", getNewsById); // GET by ID
router.post("/", upload.single('gambar'), createNews); // CREATE
router.put("/:id", upload.single('gambar'), updateNews); // UPDATE
router.delete("/:id", deleteNews); // DELETE by ID
router.delete("/", deleteAllNews); // DELETE all
router.post("/upload", upload.single('gambar'), uploadImage); // UPLOAD only

export default router;