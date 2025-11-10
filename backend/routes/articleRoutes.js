import express from "express";
import {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    deleteAllArticles,
    uploadImage
} from "../controllers/articleController.js";
import upload from "../middleware/uploadArticle.js";

const router = express.Router();

// 🔹 Routes for Articles
router.get("/", getArticles); // GET all
router.get("/:id", getArticleById); // GET by ID
router.post("/", upload.single('gambar'), createArticle); // CREATE
router.put("/:id", upload.single('gambar'), updateArticle); // UPDATE
router.delete("/:id", deleteArticle); // DELETE by ID
router.delete("/", deleteAllArticles); // DELETE all
router.post("/upload", upload.single('gambar'), uploadImage); // UPLOAD only

export default router;