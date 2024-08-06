import { Router } from "express";
const router = Router();
import {
  createCategory,
  deleteCategory,
  editCategory,
  getAllCategories,
  getCategory,
} from "../controllers/categoryController";
import { authenticateToken } from "../middleware/verifyJWT";

router.post("/create_category", authenticateToken, createCategory);
router.get("/get_all_category", authenticateToken, getAllCategories);
router.get("/get_category/:categoryId", authenticateToken, getCategory);
router.put("/edit_category/:categoryId", authenticateToken, editCategory);
router.delete(
  "/delete_category/:categoryId",
  authenticateToken,
  deleteCategory
);

export default router;
