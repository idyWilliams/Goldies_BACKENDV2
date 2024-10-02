import { Router } from "express";
const router = Router();
import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategory,
  getSubCategory,
  updateSubCategory,
} from "../controllers/subCategoryController";

import { authenticateToken } from "../middleware/verifyJWT";

router.post("/create_subcategory", authenticateToken, createSubCategory);
router.get("/get_all_subcategory", getAllSubCategory);
router.get(
  "/get_subcategory/:subCategoryId",
  getSubCategory
);
router.put(
  "/edit_subcategory/:subCategoryId",
  authenticateToken,
  updateSubCategory
);
router.delete(
  "/delete_subcategory/:subCategoryId",
  authenticateToken,
  deleteSubCategory
);

export default router;
