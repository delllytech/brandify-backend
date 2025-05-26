import express from "express";
import { 
  createPackage, 
  getAllPackages, 
  getPackageById, 
  updatePackage, 
  deletePackage 
} from "./packageController";

const router = express.Router();


router.get("/packages", getAllPackages);
router.get("/packages/:id", getPackageById);

router.post("/packages", createPackage);
router.put("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

export default router;