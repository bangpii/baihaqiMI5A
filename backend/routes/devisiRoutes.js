import express from "express";
import {
    getDevisi,
    getDevisiById,
    createDevisi,
    updateDevisi,
    deleteDevisi,
    deleteAllDevisi,
    uploadImageDevisi
} from "../controllers/devisiController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 🔹 Routes for Devisi
router.get("/", getDevisi); // GET all
router.get("/:id", getDevisiById); // GET by ID
router.post("/", upload.single('image'), createDevisi); // CREATE
router.put("/:id", upload.single('image'), updateDevisi); // UPDATE
router.delete("/:id", deleteDevisi); // DELETE by ID
router.delete("/", deleteAllDevisi); // DELETE all
router.post("/upload", upload.single('image'), uploadImageDevisi); // UPLOAD only

export default router;