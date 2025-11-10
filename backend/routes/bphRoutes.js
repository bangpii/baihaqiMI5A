import express from "express";
import {
    getBph,
    getBphById,
    createBph,
    updateBph,
    deleteBph,
    deleteAllBph,
    uploadImage
} from "../controllers/bphController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 🔹 Routes for BPH
router.get("/", getBph); // GET all
router.get("/:id", getBphById); // GET by ID
router.post("/", upload.single('image'), createBph); // CREATE
router.put("/:id", upload.single('image'), updateBph); // UPDATE
router.delete("/:id", deleteBph); // DELETE by ID
router.delete("/", deleteAllBph); // DELETE all
router.post("/upload", upload.single('image'), uploadImage); // UPLOAD only

export default router;