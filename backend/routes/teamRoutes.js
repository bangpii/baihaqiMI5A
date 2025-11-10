import express from "express";
import {
    getTeam,
    getTeamById,
    getTeamByDivisi,
    createTeam,
    updateTeam,
    deleteTeam,
    deleteAllTeam,
    uploadImage
} from "../controllers/teamController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 🔹 Routes for Team
router.get("/", getTeam); // GET all
router.get("/:id", getTeamById); // GET by ID
router.get("/divisi/:divisi", getTeamByDivisi); // GET by divisi
router.post("/", upload.single('image'), createTeam); // CREATE
router.put("/:id", upload.single('image'), updateTeam); // UPDATE
router.delete("/:id", deleteTeam); // DELETE by ID
router.delete("/", deleteAllTeam); // DELETE all
router.post("/upload", upload.single('image'), uploadImage); // UPLOAD only

export default router;