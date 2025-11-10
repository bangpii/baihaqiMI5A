import express from "express";
import {
    getVisiMisi,
    getVisiMisiById,
    getVisiMisiByType,
    createVisiMisi,
    updateVisiMisi,
    deleteVisiMisi,
    deleteAllVisiMisi,
    uploadImage
} from "../controllers/visimisiController.js";
import upload from "../middleware/uploadVisiMisi.js";

const router = express.Router();

// 🔹 Routes for VisiMisi
router.get("/", getVisiMisi); // GET all
router.get("/:id", getVisiMisiById); // GET by ID
router.get("/type/:type", getVisiMisiByType); // GET by type
router.post("/", upload.single('image'), createVisiMisi); // CREATE
router.put("/:id", upload.single('image'), updateVisiMisi); // UPDATE
router.delete("/:id", deleteVisiMisi); // DELETE by ID
router.delete("/", deleteAllVisiMisi); // DELETE all
router.post("/upload", upload.single('image'), uploadImage); // UPLOAD only

export default router;