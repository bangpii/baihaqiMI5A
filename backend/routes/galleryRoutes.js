import express from "express";
import {
    getGallery,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery,
    deleteAllGallery,
    uploadImage
} from "../controllers/galleryController.js";
import upload from "../middleware/uploadGallery.js";

const router = express.Router();

// 🔹 Routes for Gallery
router.get("/", getGallery); // GET all
router.get("/:id", getGalleryById); // GET by ID
router.post("/", upload.single('gambar'), createGallery); // CREATE
router.put("/:id", upload.single('gambar'), updateGallery); // UPDATE
router.delete("/:id", deleteGallery); // DELETE by ID
router.delete("/", deleteAllGallery); // DELETE all
router.post("/upload", upload.single('gambar'), uploadImage); // UPLOAD only

export default router;